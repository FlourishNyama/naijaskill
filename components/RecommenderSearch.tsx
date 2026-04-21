"use client";
import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface Client {
  id: string;
  full_name: string;
  location?: string;
}

interface Props {
  onSelect: (client: Client) => void;
  excluded: string[];
}

export default function RecommenderSearch({ onSelect, excluded }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return; }

    const search = async () => {
      let q = supabase
        .from('profiles')
        .select('id, full_name, location')
        .eq('role', 'client')
        .ilike('full_name', `%${query}%`)
        .limit(6);

      if (excluded.length > 0) {
        q = q.not('id', 'in', `(${excluded.join(',')})`);
      }

      const { data } = await q;
      setResults(data || []);
      setOpen(true);
    };

    const t = setTimeout(search, 300);
    return () => clearTimeout(t);
  }, [query, excluded.join(',')]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search client by name..."
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:border-green-500 transition"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
          {results.map(client => (
            <button
              key={client.id}
              type="button"
              onClick={() => { onSelect(client); setQuery(''); setOpen(false); }}
              className="w-full text-left px-4 py-3 hover:bg-green-50 dark:hover:bg-slate-700 transition text-sm border-b border-gray-50 dark:border-gray-700 last:border-0"
            >
              <div className="font-medium text-gray-900 dark:text-white">{client.full_name}</div>
              {client.location && <div className="text-xs text-gray-400">{client.location}</div>}
            </button>
          ))}
        </div>
      )}
      {open && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl px-4 py-3 text-sm text-gray-400">
          No clients found with that name.
        </div>
      )}
    </div>
  );
}
