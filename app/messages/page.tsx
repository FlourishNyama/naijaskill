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
  const [chatPartner, setChatPartner] = useState<any>(null); // Stores the full profile of who we talk to
  
  // Search State
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // 1. INITIAL LOAD
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      // Load Messages
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      if (data) setMessages(data);

      // Subscribe to New Messages
      const channel = supabase
        .channel('realtime-messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };
    init();
  }, [router]);

  // 2. SEARCH USERS FUNCTION
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      // Search the 'profiles' table we just created
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .ilike('full_name', `%${searchQuery}%`) // Search by name
        .neq('id', user?.id) // Don't show myself
        .limit(5);
        
      if (data) setSearchResults(data);
    };

    // Small delay to prevent searching on every keystroke
    const delayDebounceFn = setTimeout(() => {
      if (isSearching) searchUsers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, isSearching, user]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. SEND FUNCTION
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !chatPartner) return;

    const { error } = await supabase.from('messages').insert({
      content: inputText,
      sender_id: user.id,
      sender_email: user.email,
      receiver_id: chatPartner.id, // Now using ID, not just email
      receiver_email: chatPartner.email,
    });

    if (error) console.error(error);
    setInputText("");
  };

  // Filter Messages
  const filteredMessages = messages.filter(msg => {
    if (!chatPartner) return false;
    const isMe = msg.sender_id === user?.id;
    // Check if message is between me and the selected partner
    return (isMe && msg.receiver_id === chatPartner.id) || (msg.sender_id === chatPartner.id && msg.receiver_id === user?.id);
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex max-w-5xl mx-auto w-full border-x border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 shadow-xl my-0 md:my-4 md:rounded-xl overflow-hidden relative">
        
        {/* --- LEFT SIDEBAR (List & Search) --- */}
        <div className={`w-full md:w-80 border-r border-gray-100 dark:border-gray-800 flex flex-col bg-white dark:bg-slate-900 ${chatPartner ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href={returnTo} className="text-gray-500 hover:text-green-600 transition">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h2 className="font-bold text-lg text-gray-800 dark:text-white">Chats</h2>
            </div>
            <button onClick={() => setIsSearching(!isSearching)} className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-2 rounded-full">
              {isSearching ? <ArrowLeft className="w-4 h-4"/> : <Plus className="w-4 h-4" />}
            </button>
          </div>
          
          {/* SEARCH MODE */}
          {isSearching ? (
            <div className="p-4 flex-1">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Search user by name..." 
                  className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase">Results</p>
                {searchResults.map(result => (
                  <div 
                    key={result.id}
                    onClick={() => {
                      setChatPartner(result);
                      setIsSearching(false);
                      setSearchQuery("");
                    }}
                    className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition"
                  >
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-700 dark:text-green-400 font-bold mr-3">
                      {result.full_name?.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{result.full_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{result.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // RECENT CHATS LIST (Simplified for now - just shows empty state or list if implemented)
            <div className="flex-1 p-8 text-center flex flex-col items-center justify-center text-gray-400">
              <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-sm">No recent chats.</p>
              <button onClick={() => setIsSearching(true)} className="mt-4 text-green-600 font-bold text-sm hover:underline">
                Find someone to chat with
              </button>
            </div>
          )}
        </div>

        {/* --- RIGHT SIDE (Active Chat) --- */}
        <div className={`flex-1 flex flex-col bg-[#e5ddd5]/30 dark:bg-slate-950 ${!chatPartner ? 'hidden md:flex' : 'flex'}`}> 
          
          {chatPartner ? (
            <>
              {/* Active Chat Header */}
              <div className="p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 flex items-center z-10 shadow-sm">
                <button onClick={() => setChatPartner(null)} className="md:hidden mr-3 text-gray-600 dark:text-gray-300">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  {chatPartner.full_name?.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{chatPartner.full_name}</h3>
                  <p className="text-xs text-green-600 font-medium capitalize">{chatPartner.role}</p>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                 {filteredMessages.length === 0 && (
                   <div className="text-center text-gray-400 text-sm mt-10">Say hello to {chatPartner.full_name}!</div>
                 )}
                 
                 {filteredMessages.map((msg) => {
                   const isMine = msg.sender_id === user?.id;
                   return (
                     <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                       <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm text-sm ${
                         isMine 
                           ? "bg-green-600 text-white rounded-tr-none" 
                           : "bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-700"
                       }`}>
                         <p>{msg.content}</p>
                         <p className={`text-[9px] text-right mt-1 opacity-70`}>
                           {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </p>
                       </div>
                     </div>
                   );
                 })}
                 <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..." 
                    className="flex-1 border border-gray-300 dark:border-gray-700 rounded-full px-4 py-3 focus:outline-none focus:border-green-500 dark:bg-slate-800 dark:text-white"
                  />
                  <button type="submit" className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition shadow-lg disabled:opacity-50" disabled={!inputText.trim()}>
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            // Desktop Empty State
            <div className="hidden md:flex flex-1 items-center justify-center text-gray-400 bg-gray-50 dark:bg-slate-950">
              <p>Select a user to start chatting</p>
            </div>
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