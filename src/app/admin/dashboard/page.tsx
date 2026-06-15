"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const SUBJECTS = [
  { id: "csu083", name: "Analysis and Design of Algorithms" },
  { id: "csu357", name: "Database Management System" },
  { id: "csu2215", name: "Introduction to Git and Github" },
  { id: "csu1162", name: "Python Application Programming" }
];

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Dashboard State
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'UPLOAD' | 'SECURITY' | 'SYSTEM'>('DASHBOARD');
  
  // Data State
  const [subject, setSubject] = useState(SUBJECTS[0].id);
  const [category, setCategory] = useState("Notes");
  const [isUploading, setIsUploading] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean | null>(null);
  const [visitorLogs, setVisitorLogs] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<string[]>(["root@semesterhub:~# DASHBOARD INITIALIZED."]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analytics State
  const [totalVisits, setTotalVisits] = useState(0);
  const [uniqueUsers, setUniqueUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);

  const parseDevice = (ua: string) => {
    if (!ua) return 'Unknown';
    if (ua.includes('iPhone')) return '📱 iPhone';
    if (ua.includes('iPad')) return '📱 iPad';
    if (ua.includes('Android')) return '📱 Android';
    if (ua.includes('Mac OS')) return '💻 Mac';
    if (ua.includes('Windows')) return '💻 Windows';
    if (ua.includes('Linux')) return '💻 Linux';
    return '🖥️ Unknown Device';
  };

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') !== 'unlocked') {
      router.replace('/admin');
      return;
    }
    setIsAuthenticated(true);

    supabase.from('site_settings').select('value').eq('key', 'maintenance_mode').single().then(({ data, error }) => {
      if (error) {
        setSystemLogs(prev => [...prev, `root@semesterhub:~# ERROR FETCHING SETTINGS: ${error.message}`]);
        setMaintenanceMode(false);
      } else if (data) {
        setMaintenanceMode(data.value === 'true');
      }
    });

    supabase.from('visitor_logs').select('*').order('created_at', { ascending: false }).limit(1000).then(({ data, error }) => {
      if (error) {
        setSystemLogs(prev => [...prev, `root@semesterhub:~# ERROR FETCHING LOGS: ${error.message}`]);
      } else if (data) {
        setVisitorLogs(data);
        setTotalVisits(data.length);
        const uniqueIps = new Set(data.map(log => log.ip_address));
        setUniqueUsers(uniqueIps.size);
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
        const activeIps = new Set(data.filter(log => new Date(log.created_at) > fiveMinsAgo).map(log => log.ip_address));
        setActiveUsers(activeIps.size);
      }
    });
  }, [router]);

  const toggleMaintenance = async () => {
    if (maintenanceMode === null) return;
    const newValue = !maintenanceMode;
    setSystemLogs(prev => [...prev, `root@semesterhub:~# Executing system override: MAINTENANCE_MODE=${newValue}`]);
    
    const { error } = await supabase.from('site_settings').update({ value: String(newValue) }).eq('key', 'maintenance_mode');
    if (error) {
      setSystemLogs(prev => [...prev, `root@semesterhub:~# ERROR: ${error.message}`]);
    } else {
      setMaintenanceMode(newValue);
      setSystemLogs(prev => [...prev, `root@semesterhub:~# SYSTEM OVERRIDE SUCCESSFUL.`]);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setSystemLogs(prev => [...prev, `root@semesterhub:~# Initializing upload sequence for [${file.name}]...`]);
    
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    setSystemLogs(prev => [...prev, `root@semesterhub:~# Uploading to CDN...`]);
    const { error: uploadError } = await supabase.storage
      .from('community-notes')
      .upload(fileName, file);

    if (uploadError) {
      setSystemLogs(prev => [...prev, `root@semesterhub:~# ERROR: CDN Upload failed. ${uploadError.message}`]);
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('community-notes')
      .getPublicUrl(fileName);

    setSystemLogs(prev => [...prev, `root@semesterhub:~# File secured at ${publicUrl}`]);
    setSystemLogs(prev => [...prev, `root@semesterhub:~# Writing metadata to [${category}] database table...`]);

    const { error: insertError } = await supabase
      .from('community_notes')
      .insert([{ subject_id: subject, file_name: file.name, file_url: publicUrl, category }]);

    if (insertError) {
      setSystemLogs(prev => [...prev, `root@semesterhub:~# ERROR: Database insert failed. ${insertError.message}`]);
    } else {
      setSystemLogs(prev => [...prev, `root@semesterhub:~# SUCCESS: Operation complete.`]);
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isAuthenticated) return null; // Wait for redirect if not authed

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--paper)',
      padding: 'clamp(20px, 5vw, 60px)',
      display: 'flex',
      gap: '24px'
    }}>
      {/* SIDEBAR */}
      <div style={{
        width: '250px',
        backgroundColor: 'var(--ink)',
        color: 'var(--green-2)',
        fontFamily: 'var(--mono)',
        border: '4px solid var(--ink)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        boxShadow: '8px 8px 0 var(--green)',
      }}>
        <div>
          <h2 style={{ fontSize: '24px', margin: 0, textShadow: '0 0 5px var(--green-2)' }}>ADMIN_CORE</h2>
          <div style={{ height: '2px', background: 'var(--green-2)', marginTop: '8px' }}></div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {(['DASHBOARD', 'UPLOAD', 'SECURITY', 'SYSTEM'] as const).map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              style={{
                background: activeTab === tab ? 'var(--green-2)' : 'transparent',
                color: activeTab === tab ? 'var(--ink)' : 'var(--green-2)',
                border: '2px solid var(--green-2)',
                padding: '12px 16px',
                fontFamily: 'var(--mono)',
                fontWeight: 'bold',
                cursor: 'pointer',
                textAlign: 'left',
                textTransform: 'uppercase',
                boxShadow: activeTab === tab ? '4px 4px 0 var(--green)' : 'none',
                transition: 'all 0.1s'
              }}
            >
              &gt; {tab}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 'auto' }}>
          <button 
            onClick={() => {
              sessionStorage.removeItem('admin_auth');
              router.push('/admin');
            }}
            style={{
              background: 'transparent',
              color: '#f00',
              border: '2px solid #f00',
              padding: '8px 16px',
              fontFamily: 'var(--mono)',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%',
              textTransform: 'uppercase'
            }}
          >
            DISCONNECT
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{
        flex: 1,
        backgroundColor: 'var(--ink)',
        color: 'var(--green-2)',
        fontFamily: 'var(--mono)',
        border: '4px solid var(--ink)',
        padding: 'clamp(20px, 5vw, 40px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxShadow: '12px 12px 0 var(--green)',
        overflowY: 'auto'
      }}>
        {activeTab === 'DASHBOARD' && (
          <>
            <h1 style={{ margin: 0, fontSize: '32px' }}>DASHBOARD</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              <div style={{ border: '4px solid var(--green-2)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '14px', opacity: 0.8 }}>TOTAL VISITS (LAST 1K)</span>
                <span style={{ fontSize: '48px', fontWeight: 'bold' }}>{totalVisits}</span>
              </div>
              <div style={{ border: '4px solid var(--green-2)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '14px', opacity: 0.8 }}>UNIQUE USERS</span>
                <span style={{ fontSize: '48px', fontWeight: 'bold' }}>{uniqueUsers}</span>
              </div>
              <div style={{ border: '4px solid var(--green-2)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--green-2)', color: 'var(--ink)', boxShadow: '8px 8px 0 var(--green)' }}>
                <span style={{ fontSize: '14px', opacity: 0.8 }}>ACTIVE USERS (5M)</span>
                <span style={{ fontSize: '64px', fontWeight: 'bold', lineHeight: 1 }}>{activeUsers}</span>
              </div>
            </div>
          </>
        )}

        {activeTab === 'UPLOAD' && (
          <>
            <h1 style={{ margin: 0, fontSize: '32px' }}>CONTENT_UPLOAD</h1>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>TARGET_SUBJECT</label>
                <select 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)}
                  style={{ background: 'var(--ink)', color: 'var(--green-2)', border: '2px solid var(--green-2)', padding: '8px', fontFamily: 'var(--mono)' }}
                >
                  {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>DATA_CATEGORY</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  style={{ background: 'var(--ink)', color: 'var(--green-2)', border: '2px solid var(--green-2)', padding: '8px', fontFamily: 'var(--mono)' }}
                >
                  <option value="Notes">Notes</option>
                  <option value="Cheat Sheets">Cheat Sheets</option>
                  <option value="Past Papers">Past Papers</option>
                  <option value="Lab / Practicals">Lab / Practicals</option>
                  <option value="Projects">Projects</option>
                  <option value="Books">Books</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleUpload} 
                  style={{ display: 'none' }} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  style={{
                    background: isUploading ? 'var(--ink)' : 'var(--green)',
                    color: isUploading ? 'var(--green)' : 'var(--paper)',
                    border: '2px solid var(--ink)',
                    padding: '8px 24px',
                    fontFamily: 'var(--mono)',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    boxShadow: isUploading ? 'none' : '4px 4px 0 var(--ink)'
                  }}
                >
                  {isUploading ? 'Executing...' : 'Execute Upload'}
                </button>
              </div>
            </div>

            <div style={{ marginTop: '24px', borderTop: '2px dashed var(--green-2)', paddingTop: '24px' }}>
              <h2 style={{ fontSize: '20px', margin: 0, color: 'var(--green-2)', marginBottom: '16px' }}>SYSTEM_LOGS</h2>
              <div style={{ 
                border: '2px solid var(--green-2)', 
                background: '#000', 
                height: '150px', 
                overflowY: 'auto', 
                padding: '16px',
                fontFamily: 'monospace',
                fontSize: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {systemLogs.map((log, i) => <div key={i}>{log}</div>)}
              </div>
            </div>
          </>
        )}

        {activeTab === 'SYSTEM' && (
          <>
            <h1 style={{ margin: 0, fontSize: '32px' }}>SYSTEM_CONTROLS</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '14px', textTransform: 'uppercase' }}>Maintenance Mode: {maintenanceMode === null ? 'LOADING...' : maintenanceMode ? 'ACTIVE (LOCKED)' : 'OFFLINE (LIVE)'}</span>
                <button 
                  onClick={toggleMaintenance}
                  disabled={maintenanceMode === null}
                  style={{
                    background: maintenanceMode ? '#f00' : 'var(--ink)',
                    color: maintenanceMode ? 'var(--paper)' : 'var(--green-2)',
                    border: maintenanceMode ? '2px solid #f00' : '2px solid var(--green-2)',
                    padding: '8px 24px',
                    fontFamily: 'var(--mono)',
                    cursor: maintenanceMode === null ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                >
                  {maintenanceMode ? 'Disable Lockdown' : 'Engage Lockdown'}
                </button>
              </div>
            </div>
            <div style={{ marginTop: '24px', borderTop: '2px dashed var(--green-2)', paddingTop: '24px' }}>
              <h2 style={{ fontSize: '20px', margin: 0, color: 'var(--green-2)', marginBottom: '16px' }}>SYSTEM_LOGS</h2>
              <div style={{ 
                border: '2px solid var(--green-2)', 
                background: '#000', 
                height: '150px', 
                overflowY: 'auto', 
                padding: '16px',
                fontFamily: 'monospace',
                fontSize: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {systemLogs.map((log, i) => <div key={i}>{log}</div>)}
              </div>
            </div>
          </>
        )}

        {activeTab === 'SECURITY' && (
          <>
            <h1 style={{ margin: 0, fontSize: '32px' }}>SECURITY_LOGS</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <div style={{ 
                border: '2px solid var(--green-2)', 
                background: '#000', 
                flex: 1,
                minHeight: '400px',
                overflowY: 'auto', 
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {visitorLogs.length === 0 && <div>No recent activity detected.</div>}
                {visitorLogs.slice(0, 50).map(log => (
                  <div key={log.id} style={{ display: 'grid', gridTemplateColumns: '150px 150px 1fr', gap: '16px', fontSize: '12px', borderBottom: '1px dashed var(--green-2)', paddingBottom: '4px' }}>
                    <span style={{ color: 'var(--paper)' }}>{new Date(log.created_at).toLocaleString()}</span>
                    <span style={{ color: '#f00', fontWeight: 'bold' }}>{log.ip_address}</span>
                    <span style={{ color: 'var(--green-2)', opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.path} | {parseDevice(log.user_agent)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
