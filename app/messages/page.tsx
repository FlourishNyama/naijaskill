"use client";
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Send, ArrowLeft, Plus, Search, User, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '../../utils/supabase/client';

function ChatInterface() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/dashboard';
  
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [chatPartner, setChatPartner] = useState<any>(null); 
  
  // List of people I've talked to (Derived from messages)
  const [recentChats, setRecentChats] = useState<any[]>([]);

  // Search State
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // 1. INITIAL LOAD (User & Messages)
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      // Fetch ALL messages involving me
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true });
      
      if (data) setMessages(data);

      // Realtime Listener
      const channel = supabase
        .channel('realtime-messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          // Only add if it involves me
          if (payload.new.sender_id === user.id || payload.new.receiver_id === user.id) {
            setMessages((prev) => [...prev, payload.new]);
          }
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };
    init();
  }, [router]);

  // 2. CALCULATE RECENT CHATS LIST
  useEffect(() => {
    if (!user || messages.length === 0) return;

    const fetchProfiles = async () => {
      // 1. Find all unique user IDs I've talked to
      const partnerIds = new Set();
      messages.forEach(msg => {
        if (msg.sender_id !== user.id) partnerIds.add(msg.sender_id);
        if (msg.receiver_id !== user.id) partnerIds.add(msg.receiver_id);
      });

      if (partnerIds.size === 0) return;

      // 2. Fetch their names/roles from 'profiles' table
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', Array.from(partnerIds));

      if (profiles) {
        // 3. Build the list objects with "Last Message" info
        const chats = profiles.map(profile => {
          // Find last message with this person
          const lastMsg = [...messages].reverse().find(m => 
            (m.sender_id === profile.id && m.receiver_id === user.id) || 
            (m.receiver_id === profile.id && m.sender_id === user.id)
          );
          return { ...profile, lastMsg };
        });

        // 4. Sort by newest message first
        chats.sort((a, b) => new Date(b.lastMsg?.created_at).getTime() - new Date(a.lastMsg?.created_at).getTime());
        setRecentChats(chats);
      }
    };

    fetchProfiles();
  }, [messages, user]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatPartner]);

  // 3. SEND FUNCTION
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !chatPartner) return;

    const { error } = await supabase.from('messages').insert({
      content: inputText,
      sender_id: user.id,
      sender_email: user.email,
      receiver_id: chatPartner.id,
      receiver_email: chatPartner.email,
    });

    if (error) console.error(error);
    setInputText("");
  };

  // 4. SEARCH FUNCTION
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) { setSearchResults([]); return; }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .ilike('full_name', `%${searchQuery}%`)
        .neq('id', user?.id)
        .limit(5);
      if (data) setSearchResults(data);
    };
    const delay = setTimeout(() => { if (isSearching) searchUsers(); }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery, isSearching, user]);

  // Filter messages for active chat window
  const activeMessages = messages.filter(msg => {
    if (!chatPartner) return false;
    const isMe = msg.sender_id === user?.id;
    return (isMe && msg.receiver_id === chatPartner.id) || (msg.sender_id === chatPartner.id && msg.receiver_id === user?.id);
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex max-w-5xl mx-auto w-full border-x border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 shadow-xl my-0 md:my-4 md:rounded-xl overflow-hidden relative">
        
        {/* --- LEFT SIDEBAR (Recent List & Search) --- */}
        <div className={`w-full md:w-80 border-r border-gray-100 dark:border-gray-800 flex flex-col bg-white dark:bg-slate-900 ${chatPartner ? 'hidden md:flex' : 'flex'}`}>
          
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href={returnTo} className="text-gray-500 hover:text-green-600 transition">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h2 className="font-bold text-lg text-gray-800 dark:text-white">Messages</h2>
            </div>
            <button onClick={() => { setIsSearching(!isSearching); setSearchQuery(""); }} className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-2 rounded-full">
              {isSearching ? <ArrowLeft className="w-4 h-4"/> : <Plus className="w-4 h-4" />}
            </button>
          </div>
          
          {/* SEARCH OR LIST */}
          {isSearching ? (
            <div className="p-4 flex-1">
              <input 
                type="text" 
                autoFocus
                placeholder="Search user by name..." 
                className="w-full p-3 bg-gray-100 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500 dark:text-white mb-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchResults.map(result => (
                <div key={result.id} onClick={() => { setChatPartner(result); setIsSearching(false); }} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-700 dark:text-green-400 font-bold mr-3">{result.full_name?.substring(0,2).toUpperCase()}</div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{result.full_name}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {recentChats.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No recent conversations.<br/>Click + to start one.</div>
              ) : (
                recentChats.map(chat => (
                  <div 
                    key={chat.id} 
                    onClick={() => setChatPartner(chat)}
                    className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 border-b border-gray-50 dark:border-slate-800/50 ${chatPartner?.id === chat.id ? "bg-green-50 dark:bg-slate-800" : ""}`}
                  >
                    <div className="relative w-12 h-12 mr-4 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-300 font-bold text-lg">
                      {chat.full_name?.substring(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white truncate">{chat.full_name}</h3>
                        <span className="text-[10px] text-gray-400">
                          {new Date(chat.lastMsg?.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{chat.lastMsg?.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* --- RIGHT SIDE (Chat Window) --- */}
        <div className={`flex-1 flex flex-col bg-[#e5ddd5]/30 dark:bg-slate-950 ${!chatPartner ? 'hidden md:flex' : 'flex'}`}> 
          {chatPartner ? (
            <>
              <div className="p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 flex items-center z-10 shadow-sm">
                <button onClick={() => setChatPartner(null)} className="md:hidden mr-3 text-gray-600 dark:text-gray-300"><ArrowLeft className="w-6 h-6" /></button>
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mr-3">{chatPartner.full_name?.substring(0,2).toUpperCase()}</div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{chatPartner.full_name}</h3>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium capitalize">{chatPartner.role}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                 {activeMessages.map((msg) => {
                   const isMine = msg.sender_id === user?.id;
                   return (
                     <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                       <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm text-sm ${isMine ? "bg-green-600 text-white rounded-tr-none" : "bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-700"}`}>
                         <p>{msg.content}</p>
                         <p className="text-[9px] text-right mt-1 opacity-70">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                       </div>
                     </div>
                   );
                 })}
                 <div ref={messagesEndRef} />
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type a message..." className="flex-1 border border-gray-300 dark:border-gray-700 rounded-full px-4 py-3 focus:outline-none focus:border-green-500 dark:bg-slate-800 dark:text-white" />
                  <button type="submit" className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition shadow-lg disabled:opacity-50" disabled={!inputText.trim()}><Send className="w-5 h-5" /></button>
                </form>
              </div>
            </>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center text-gray-400 bg-gray-50 dark:bg-slate-950"><p>Select a chat to start messaging</p></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center"><Loader2 className="animate-spin w-8 h-8 mx-auto" /></div>}>
      <ChatInterface />
    </Suspense>
  );
}