"use client";
import Link from 'next/link';
import { ArrowLeft, Wallet, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, Smartphone } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function WalletPage() {
  const TRANSACTIONS = [
    { id: 1, title: "Escrow Deposit (Plumbing)", date: "Today, 10:30 AM", amount: "-₦10,000", type: "debit", status: "Held" },
    { id: 2, title: "Wallet Top Up (Flutterwave)", date: "Yesterday", amount: "+₦50,000", type: "credit", status: "Success" },
    { id: 3, title: "Service Fee Refund", date: "24 Nov", amount: "+₦500", type: "credit", status: "Success" },
    { id: 4, title: "Escrow Release (Painter)", date: "20 Nov", amount: "-₦35,000", type: "debit", status: "Completed" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-6 mb-20">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link href="/dashboard" className="mr-3 text-gray-500 hover:text-green-600">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">My Wallet</h1>
        </div>

        {/* 1. BALANCE CARD */}
        <div className="bg-green-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4">
            <Wallet className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <p className="text-green-200 text-sm font-medium mb-1">Available Balance</p>
            <h2 className="text-4xl font-bold mb-6">₦45,000.00</h2>
            
            <div className="flex gap-3">
              <button className="flex-1 bg-white text-green-900 py-3 rounded-xl font-bold text-sm hover:bg-green-50 transition flex items-center justify-center">
                <Plus className="w-4 h-4 mr-2" /> Top Up
              </button>
              <button className="flex-1 bg-green-800 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition border border-green-700">
                Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* 2. QUICK ACTIONS (Payment Methods) */}
        <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center hover:border-green-500 transition cursor-pointer">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-2">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-700">Add Card</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center hover:border-green-500 transition cursor-pointer">
            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mb-2">
              <Smartphone className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-700">Bank Transfer</span>
          </div>
        </div>

        {/* 3. TRANSACTION HISTORY */}
        <h3 className="font-bold text-gray-900 mb-4">Recent Transactions</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {TRANSACTIONS.map((tx) => (
            <div key={tx.id} className="p-4 border-b border-gray-50 last:border-0 flex justify-between items-center hover:bg-gray-50">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{tx.title}</p>
                  <p className="text-xs text-gray-400">{tx.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>{tx.amount}</p>
                <p className="text-[10px] bg-gray-100 inline-block px-2 py-0.5 rounded text-gray-500 mt-1">{tx.status}</p>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}