"use client";
import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Send, Phone, Video, MoreVertical, Search, ArrowLeft, Paperclip } from 'lucide-react';
import Navbar from '@/components/Navbar';

// --- MOCK DATA ---
const CONVERSATIONS = [
  { id: 1, name: "Emmanuel Okafor", job: "Plumber", img: "https://images.unsplash.com/photo-1581578731117-104f2a8d23e9?q=80&w=2940&auto=format&fit=crop", online: true, lastMsg: "I will be there by 2pm." },
  { id: 2, name: "Aisha Bello", job: "Photographer", img: "https://images.unsplash.com/photo-1554048612-387768052bf7?q=80&w=2835&auto=format&fit=crop", online: false, lastMsg: "Can you send the moodboard?" },
  { id: 3, name: "Chinedu West", job: "Painter", img: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=3131&auto=format&fit=crop", online: true, lastMsg: "Thanks for the payment!" },
];

const INITIAL_MESSAGES = [
  { id: 1, text: "Good afternoon Emmanuel, are you available for a plumbing job in Lekki?", isMine: true, time: "10:30 AM" },
  { id: 2, text: "Good afternoon! Yes I am available. What seems to be the issue?", isMine: false, time: "10:32 AM" },
  { id: 3, text: "My kitchen sink is leaking heavily.", isMine: true, time: "10:33 AM" },
  { id: 4, text: "I can come check it out. My inspection fee is ₦2,000.", isMine: false, time: "10:35 AM" },
];

function MessagesContent() {
  const [activeChat, setActiveChat] = useState(CONVERSATIONS[0]);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  // 1. GET THE RETURN PATH (Default to Dashboard if missing)
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/dashboard';

  const handleSend = (e: any) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const newMsg = {
      id: messages.length + 1,
      text: inputText,
      isMine: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMsg]);
    setInputText("");
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full border-x border-gray-200 bg-white shadow-xl my-0 md:my-4 md:rounded-xl overflow-hidden">
        
        {/* --- LEFT SIDEBAR --- */}
        <div className={`${showChatOnMobile ? 'hidden' : 'flex'} md:flex w-full md:w-80 border-r border-gray-100 flex-col bg-white`}>
          
          {/* Header with DYNAMIC BACK BUTTON */}
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div className="flex items-center gap-3">
              <Link href={returnTo} className="text-gray-500 hover:text-green-600 transition">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h2 className="font-bold text-lg text-gray-800">Messages</h2>
            </div>
            <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">3 New</div>
          </div>
          
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search chats..." className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {CONVERSATIONS.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => { setActiveChat(chat); setShowChatOnMobile(true); }}
                className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 transition ${activeChat.id === chat.id ? "bg-green-50 border-r-4 border-green-600" : ""}`}
              >
                <div className="relative w-12 h-12 mr-4">
                  <Image src={chat.img} alt={chat.name} fill className="object-cover rounded-full" />
                  {chat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-gray-900 truncate">{chat.name}</h3>
                    <span className="text-xs text-gray-400">10:35 AM</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{chat.lastMsg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- RIGHT SIDE --- */}
        <div className={`${showChatOnMobile ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-[#e5ddd5]/30`}> 
          <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <button onClick={() => setShowChatOnMobile(false)} className="md:hidden mr-3 text-gray-600 hover:text-green-600">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="relative w-10 h-10 mr-3">
                <Image src={activeChat.img} alt={activeChat.name} fill className="object-cover rounded-full" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{activeChat.name}</h3>
                <p className="text-xs text-green-600 font-medium">{activeChat.job} • Online</p>
              </div>
            </div>
            <div className="flex space-x-4 text-gray-500">
              <Phone className="w-5 h-5 cursor-pointer hover:text-green-600" />
              <Video className="w-5 h-5 cursor-pointer hover:text-green-600" />
              <MoreVertical className="w-5 h-5 cursor-pointer hover:text-gray-900" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat opacity-90">
             {messages.map((msg) => (
               <div key={msg.id} className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}>
                 <div className={`max-w-[70%] rounded-lg px-4 py-2 shadow-sm ${msg.isMine ? "bg-green-600 text-white rounded-tr-none" : "bg-white text-gray-900 rounded-tl-none"}`}>
                   <p className="text-sm">{msg.text}</p>
                   <p className={`text-[10px] text-right mt-1 ${msg.isMine ? "text-green-100" : "text-gray-400"}`}>{msg.time}</p>
                 </div>
               </div>
             ))}
          </div>

          <div className="p-4 bg-white border-t border-gray-200">
            <form onSubmit={handleSend} className="flex items-center space-x-2">
              <Paperclip className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..." 
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
              <button type="submit" className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition">
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
    <Suspense fallback={<div>Loading...</div>}>
      <MessagesContent />
    </Suspense>
  );
}