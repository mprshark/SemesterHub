"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { usePathname } from 'next/navigation';

export default function ClientTracker() {
  const pathname = usePathname();
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    // 1. Log Visitor IP
    fetch('/api/log-visitor', {
      method: 'POST',
      body: JSON.stringify({ pathname }),
      headers: { 'Content-Type': 'application/json' }
    }).catch(console.error);

    // 2. Check Maintenance Mode
    const checkMaintenance = async () => {
      const { data } = await supabase.from('site_settings').select('value').eq('key', 'maintenance_mode').single();
      if (data && data.value === 'true') {
        setIsMaintenance(true);
      } else {
        setIsMaintenance(false);
      }
    };
    
    checkMaintenance();

    // 3. Listen for real-time changes to maintenance mode so we can lock/unlock instantly without refreshing
    const channel = supabase.channel('settings-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'site_settings', filter: 'key=eq.maintenance_mode' }, (payload) => {
        setIsMaintenance(payload.new.value === 'true');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pathname]);

  if (isMaintenance && !pathname.startsWith('/admin')) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'var(--paper)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          border: '4px solid var(--ink)',
          boxShadow: '16px 16px 0 #f00',
          padding: 'clamp(40px, 8vw, 80px)',
          maxWidth: '800px',
          width: '100%',
          background: 'var(--paper)'
        }}>
          <h1 style={{ 
            fontFamily: 'var(--condensed)', 
            fontSize: 'clamp(50px, 10vw, 120px)', 
            lineHeight: 0.9,
            margin: '0 0 24px 0',
            textTransform: 'uppercase',
            color: '#f00',
            textShadow: '4px 4px 0 var(--ink)'
          }}>
            SYSTEM LOCKED
          </h1>
          <h2 style={{
            fontFamily: 'var(--sans)',
            fontSize: 'clamp(20px, 4vw, 32px)',
            fontWeight: 900,
            margin: '0 0 16px 0',
            textTransform: 'uppercase'
          }}>
            MAINTENANCE MODE ACTIVE
          </h2>
          <p style={{
            fontFamily: 'var(--mono)',
            fontSize: '16px',
            color: 'var(--ink-2)'
          }}>
            The Admin has locked the system for crucial updates. Do not panic. Check back later.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
