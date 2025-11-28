"use client";
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Send, ArrowLeft, Loader2, User, Plus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '../../utils/supabase/client';

function ChatInterface() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/dashboard';
  
  // State
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [chatPartnerEmail, setChatPartnerEmail] = useState(""); // Who are we talking to?
  const [isNewChat, setIsNewChat] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // 1. Load User & Initial Messages
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Fetch existing messages
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (data) setMessages(data);

      // 2. SETUP REALTIME SUBSCRIPTION
      const channel = supabase
        .channel('realtime-messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          // When a new message comes in, add it to the list
          setMessages((prev) => [...prev, payload.new]);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    init();
  }, [router]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. SEND MESSAGE FUNCTION
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const { error } = await supabase.from('messages').insert({
      content: inputText,
      sender_id: user.id,
      sender_email: user.email,
      // For this prototype, we store the target email. 
      // In a full app, you would use IDs.
      receiver_email: chatPartnerEmail.toLowerCase(), 
    });

    if (error) console.error(error);
    setInputText("");
  };

  // Filter messages: Show Public ones OR ones between me and the partner
  const filteredMessages = messages.filter(msg => {
    // If we are in "Global Chat" mode (no partner selected), show everything (for testing)
    if (!chatPartnerEmail) return true;
    
    // Otherwise, show only chat between me and partner
    const isMe = msg.sender_id === user?.id;
    const isPartner = msg.sender_email === chatPartnerEmail || msg.receiver_email === chatPartnerEmail;
    return (isMe || isPartner);
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex max-w-5xl mx-auto w-full border-x border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 shadow-xl my-0 md:my-4 md:rounded-xl overflow-hidden relative">
        
        {/* --- MAIN CHAT AREA --- */}
        <div className="flex-1 flex flex-col relative"> 
          
          {/* Header */}
          <div className="p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center z-10">
            <div className="flex items-center">
              <Link href={returnTo} className="mr-3 text-gray-500 hover:text-green-600 transition">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {chatPartnerEmail ? `Chatting with: ${chatPartnerEmail}` : "Community Chat (Public)"}
                </h3>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">Online</p>
              </div>
            </div>
            
            {/* Start New Chat Button */}
            <button 
              onClick={() => setIsNewChat(!isNewChat)}
              className="text-xs bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 px-3 py-2 rounded-lg flex items-center transition"
            >
              <Plus className="w-4 h-4 mr-1" /> New Chat
            </button>
          </div>

          {/* New Chat Input (Hidden unless clicked) */}
          {isNewChat && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 border-b border-green-100 dark:border-green-900">
              <label className="text-xs font-bold text-green-800 dark:text-green-300 block mb-1">Enter Email to Chat:</label>
              <input 
                type="email" 
                placeholder="friend@example.com"
                className="w-full p-2 rounded border border-green-200 dark:border-green-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-950 dark:text-white"
                value={chatPartnerEmail}
                onChange={(e) => setChatPartnerEmail(e.target.value)}
              />
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-950/50">
             {filteredMessages.length === 0 && (
               <div className="text-center text-gray-400 text-sm mt-10">No messages yet. Say hello!</div>
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
                     {!isMine && <p className="text-[10px] opacity-50 mb-1 font-bold">{msg.sender_email}</p>}
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
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800">
            <form onSubmit={handleSend} className="flex items-center space-x-2">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..." 
                className="flex-1 border border-gray-300 dark:border-gray-700 rounded-full px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:bg-slate-950 dark:text-white transition"
              />
              <button type="submit" className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition shadow-lg disabled:opacity-50" disabled={!inputText.trim()}>
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading Chat...</div>}>
      <ChatInterface />
    </Suspense>
  );
}