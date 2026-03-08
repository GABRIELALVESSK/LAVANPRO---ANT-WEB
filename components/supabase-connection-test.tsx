'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function SupabaseConnectionTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'demo'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      // Check if we are using the dummy Supabase URL
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      if (!supabaseUrl || supabaseUrl.includes('dummy') || supabaseUrl === '') {
        setStatus('demo');
        return;
      }

      try {
        const { error } = await supabase.from('_dummy_table_test_connection').select('*').limit(1);

        // If we get an error about the table not existing, or specific schema cache errors, 
        // the connection IS working because it reached the database.
        if (error && (error.code === '42P01' || error.message?.includes('schema cache') || error.message?.includes('not find the table'))) {
          setStatus('success');
        } else if (error) {
          setStatus('error');
          setErrorMessage(error.message);
        } else {
          setStatus('success');
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || 'Unknown error occurred');
      }
    }

    testConnection();
  }, []);

  if (status === 'loading') {
    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm mb-6 border border-blue-200 dark:border-blue-800">
        Testing Supabase connection...
      </div>
    );
  }

  if (status === 'demo') {
    return (
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg text-sm mb-6 border border-amber-200 dark:border-amber-800 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
        <strong className="font-semibold">Modo de Demonstração:</strong> O sistema está rodando localmente sem conexão ativa ao banco de dados. Os dados exibidos são fictícios.
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm mb-6 border border-red-200 dark:border-red-800">
        <strong className="font-semibold">Supabase Connection Failed:</strong> {errorMessage}
        <p className="mt-2">Please ensure you have set the NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables correctly.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm mb-6 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
      <strong className="font-semibold">Supabase Connected Successfully!</strong>
    </div>
  );
}
