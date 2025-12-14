"use client";
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Send, Search, User, MoreVertical, ArrowLeft, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '../../utils/supabase/client';

// ---------------------------------------------------------
// PART 1: The Main Logic (Renamed to MessagesContent)
// ---------------------------------------------------------
function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoChatId = searchParams.get('chatWith'); 

  const [user, setUser] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      // Fetch Contacts
      const { data: sent } = await supabase.from('messages').select('receiver_id').eq('sender_id', user.id);
      const { data: received } = await supabase.from('messages').select('sender_id').eq('receiver_id', user.id);

      const contactIds = Array.from(new Set([
        ...(sent?.map(m => m.receiver_id) || []),
        ...(received?.map(m => m.sender_id) || [])
      ]));

      let loadedContacts = [];

      if (contactIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('*').in('id', contactIds);
        loadedContacts = profiles || [];
      }

      // Auto-Chat Logic
      if (autoChatId) {
        const existing = loadedContacts.find((c: any) => c.id === autoChatId);
        if (existing) {
            setSelectedContact(existing);
        } else {
            const { data: newContact } = await supabase.from('profiles').select('*').eq('id', autoChatId).single();
            if (newContact) {
                loadedContacts = [newContact, ...loadedContacts];
                setSelectedContact(newContact);
            }
        }
      }
      
      setContacts(loadedContacts);
      setLoading(false);
    };
    init();
  }, [router, autoChatId]);

  // Fetch Messages
  useEffect(() => {
    if (!selectedContact || !user) return;
    
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedContact.id}),and(sender_id.eq.${selectedContact.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
      scrollToBottom();
    };

    fetchMessages();

    const channel = supabase
      .channel('chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new;
        if ((msg.sender_id === user.id && msg.receiver_id === selectedContact.id) || 
            (msg.sender_id === selectedContact.id && msg.receiver_id === user.id)) {
          setMessages(prev => [...prev, msg]);
          scrollToBottom();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedContact, user]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: selectedContact.id,
      content: newMessage
    });
    setNewMessage('');
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-green-600"/></div>;

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-950 overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden max-w-6xl mx-auto w-full border-x border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 shadow-sm">
        
        {/* SIDEBAR */}
        <div className={`w-full md:w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Messages</h2>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search chats..." className="w-full pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-green-500" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {contacts.map(contact => (
              <div key={contact.id} onClick={() => setSelectedContact(contact)} className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition border-b border-gray-100 dark:border-gray-800 ${selectedContact?.id === contact.id ? 'bg-green-50 dark:bg-slate-800' : ''}`}>
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden relative flex-shrink-0">
                    {contact.avatar_url ? <Image src={contact.avatar_url} alt="" fill className="object-cover"/> : <User className="w-6 h-6 m-auto mt-3 text-gray-400"/>}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{contact.full_name}</h3>
                    <p className="text-xs text-gray-500 truncate">{contact.job_title || 'User'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHAT WINDOW */}
        <div className={`flex-1 flex flex-col ${!selectedContact ? 'hidden md:flex' : 'flex'}`}>
          {selectedContact ? (
            <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedContact(null)} className="md:hidden p-1 -ml-2 text-gray-600 dark:text-gray-300">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden relative">
                        {selectedContact.avatar_url ? <Image src={selectedContact.avatar_url} alt="" fill className="object-cover"/> : <User className="w-5 h-5 m-auto mt-2.5 text-gray-400"/>}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{selectedContact.full_name}</h3>
                        <p className="text-xs text-green-600">Online</p>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-5 h-5"/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-slate-950">
                {messages.map((msg) => {
                    const isMe = msg.sender_id === user.id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${isMe ? 'bg-green-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-none shadow-sm'}`}>
                                <p>{msg.content}</p>
                                <span className={`text-[10px] block mt-1 opacity-70 ${isMe ? 'text-green-100' : 'text-gray-400'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..." 
                        className="flex-1 p-3 rounded-xl bg-gray-100 dark:bg-slate-800 border-none outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 transition"
                    />
                    <button type="submit" disabled={!newMessage.trim()} className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                        <Send className="w-5 h-5" />
                    </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <User className="w-10 h-10 opacity-20" />
                </div>
                <p>Select a contact to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// PART 2: The Wrapper (Exported Default)
// ---------------------------------------------------------
export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-green-600" /></div>}>
      <MessagesContent />
    </Suspense>
  );
}