"use client";
import { useState, useEffect } from 'react';
import { Save, Loader2, RefreshCw, ToggleLeft, ToggleRight, Settings } from 'lucide-react';
import { createClient } from '../../../utils/supabase/client';

export default function PlatformSettings() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local state for form inputs
  const [fee, setFee] = useState('10');
  const [minWithdrawal, setMinWithdrawal] = useState('1000');
  const [maintenance, setMaintenance] = useState(false);
  const [allowSignups, setAllowSignups] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from('platform_settings').select('*');
    
    if (data) {
        setSettings(data);
        // Map DB values to state
        setFee(data.find(s => s.key === 'platform_fee')?.value || '10');
        setMinWithdrawal(data.find(s => s.key === 'min_withdrawal')?.value || '1000');
        setMaintenance(data.find(s => s.key === 'maintenance_mode')?.value === 'true');
        setAllowSignups(data.find(s => s.key === 'allow_signups')?.value === 'true');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if(!window.confirm("Are you sure you want to update platform settings?")) return;
    setSaving(true);

    const updates = [
        { key: 'platform_fee', value: fee },
        { key: 'min_withdrawal', value: minWithdrawal },
        { key: 'maintenance_mode', value: String(maintenance) },
        { key: 'allow_signups', value: String(allowSignups) },
    ];

    for (const setting of updates) {
        await supabase
            .from('platform_settings')
            .update({ value: setting.value })
            .eq('key', setting.key);
    }

    setSaving(false);
    alert("Settings Updated Successfully!");
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-slate-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Settings</h1>
            <p className="text-slate-500 text-sm">Configure global business rules and feature flags.</p>
        </div>
        <button 
            onClick={fetchSettings} 
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
        >
            <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* FINANCIAL CONFIG */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-green-500"/> Financial Rules
            </h3>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Platform Commission Fee (%)
                    </label>
                    <div className="relative">
                        <input 
                            type="number" 
                            value={fee}
                            onChange={(e) => setFee(e.target.value)}
                            className="w-full p-3 pl-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:border-green-500 font-bold"
                        />
                        <span className="absolute right-4 top-3 text-slate-400 font-bold">%</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Percentage deducted from Worker's earnings per job.</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Minimum Withdrawal Limit (₦)
                    </label>
                    <input 
                        type="number" 
                        value={minWithdrawal}
                        onChange={(e) => setMinWithdrawal(e.target.value)}
                        className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:border-green-500 font-bold"
                    />
                    <p className="text-xs text-slate-500 mt-1">Users cannot withdraw less than this amount.</p>
                </div>
            </div>
        </div>

        {/* SYSTEM FLAGS */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-orange-500"/> System Controls
            </h3>
            
            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Allow New Signups</h4>
                        <p className="text-xs text-slate-500">If disabled, registration page will be blocked.</p>
                    </div>
                    <button onClick={() => setAllowSignups(!allowSignups)} className={`transition-colors ${allowSignups ? 'text-green-600' : 'text-slate-300'}`}>
                        {allowSignups ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                    <div>
                        <h4 className="font-bold text-red-900 dark:text-red-400">Maintenance Mode</h4>
                        <p className="text-xs text-red-700 dark:text-red-300">Take site offline (Admins can still login).</p>
                    </div>
                    <button onClick={() => setMaintenance(!maintenance)} className={`transition-colors ${maintenance ? 'text-red-600' : 'text-slate-300'}`}>
                        {maintenance ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-800">
        <button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-xl font-bold flex items-center hover:opacity-90 transition disabled:opacity-50"
        >
            {saving ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            Save Configuration
        </button>
      </div>

    </div>
  );
}