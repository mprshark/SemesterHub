"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const MatrixBackground = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize) + 1;
    const drops: number[] = [];
    for (let x = 0; x < columns; x++) drops[x] = 1;

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0F0';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = letters.charAt(Math.floor(Math.random() * letters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    window.addEventListener('resize', setSize);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', setSize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />;
};

export default function AdminTerminal() {
  const router = useRouter();
  const [authStep, setAuthStep] = useState<'PIN' | 'CREDS'>('PIN');
  const [uiStatus, setUiStatus] = useState<'IDLE' | 'ERROR' | 'SUCCESS'>('IDLE');
  const [pin, setPin] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [logs, setLogs] = useState<string[]>(["root@semesterhub:~# ENTER 4-DIGIT SECURITY PIN..."]);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);

  React.useEffect(() => {
    const checkLockout = () => {
      const lockoutTime = localStorage.getItem('lockout_time');
      if (lockoutTime) {
        const timePassed = Date.now() - parseInt(lockoutTime);
        const TWO_MINUTES = 2 * 60 * 1000;
        if (timePassed < TWO_MINUTES) {
          setIsLockedOut(true);
          setLockoutTimeLeft(Math.ceil((TWO_MINUTES - timePassed) / 1000));
        } else {
          localStorage.removeItem('lockout_time');
          setIsLockedOut(false);
        }
      }
    };
    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const triggerLockout = () => {
    setIsLockedOut(true);
    localStorage.setItem('lockout_time', Date.now().toString());
    fetch('/api/log-visitor', {
      method: 'POST',
      body: JSON.stringify({ pathname: '/admin/INTRUSION_ATTEMPT' })
    });
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "3357") {
      setFailedAttempts(0);
      setUiStatus('SUCCESS');
      setLogs(prev => [...prev, "root@semesterhub:~# PIN Accepted. Proceed to credential verification."]);
      setTimeout(() => {
        setAuthStep('CREDS');
        setUiStatus('IDLE');
        setPin("");
      }, 800);
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      setUiStatus('ERROR');
      setLogs(prev => [...prev, `root@semesterhub:~# ERROR: Invalid PIN. Attempt ${newAttempts}/3.`]);
      
      if (newAttempts >= 3) {
        triggerLockout();
      }

      setTimeout(() => {
        setUiStatus('IDLE');
        setPin("");
      }, 500);
    }
  };

  const handleCredsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "sharkop666") {
      setLogs(prev => [...prev, "root@semesterhub:~# ACCESS GRANTED. Initializing Dashboard..."]);
      sessionStorage.setItem('admin_auth', 'unlocked');
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 500);
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      setUiStatus('ERROR');
      setLogs(prev => [...prev, `root@semesterhub:~# ERROR: Invalid credentials. Attempt ${newAttempts}/3.`]);
      setPassword("");
      
      if (newAttempts >= 3) {
        triggerLockout();
      }

      setTimeout(() => {
        setUiStatus('IDLE');
      }, 500);
    }
  };

  if (isLockedOut) {
    return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#000',
        color: '#0f0',
        fontFamily: 'var(--mono)',
        fontSize: '14px',
        overflow: 'hidden',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <MatrixBackground />
        <div style={{
          position: 'relative',
          backgroundColor: 'var(--blood)',
          color: 'var(--paper)',
          padding: '40px',
          border: '4px solid var(--paper)',
          textAlign: 'center',
          zIndex: 10000,
          boxShadow: '0 0 50px var(--blood)'
        }}>
          <h1 style={{ fontSize: '48px', margin: 0, textTransform: 'uppercase', fontFamily: 'var(--display)' }}>Intrusion Detected</h1>
          <p style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'var(--mono)' }}>YOUR IP HAS BEEN RECORDED AND FORWARDED TO THE ADMIN.</p>
          <p style={{ fontFamily: 'var(--mono)' }}>This incident has been permanently logged.</p>
          {lockoutTimeLeft > 0 && (
            <p style={{ fontFamily: 'var(--mono)', marginTop: '20px', fontSize: '18px', fontWeight: 'bold', backgroundColor: 'var(--ink)', color: 'var(--paper)', padding: '10px' }}>
              TERMINAL LOCKED FOR: {Math.floor(lockoutTimeLeft / 60)}:{(lockoutTimeLeft % 60).toString().padStart(2, '0')}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--paper)',
      padding: 'clamp(20px, 5vw, 60px)',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        @keyframes flash-red {
          0%, 100% { background-color: var(--ink); }
          50% { background-color: #500; }
        }
        @keyframes flash-green {
          0%, 100% { background-color: var(--ink); }
          50% { background-color: #050; }
        }
        .anim-error {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both, flash-red 0.5s ease-in-out;
        }
        .anim-success {
          animation: flash-green 0.8s ease-in-out;
        }
      `}</style>
      <div className={uiStatus === 'ERROR' ? 'anim-error' : uiStatus === 'SUCCESS' ? 'anim-success' : ''} style={{
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
        transition: 'background-color 0.1s'
      }}>
        <div>
          <h1 style={{ fontSize: '32px', margin: 0, textShadow: '0 0 5px var(--green-2)' }}>SEMESTER_HUB_ADMIN_TERMINAL_V1.0</h1>
          <p style={{ margin: '8px 0 0 0', opacity: 0.8 }}>Unauthorized access is strictly prohibited and logged.</p>
        </div>
        <div style={{
          flex: 1,
          fontFamily: 'monospace',
          fontSize: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          overflowY: 'auto'
        }}>
          {logs.map((log, i) => <div key={i}>{log}</div>)}
        </div>

        {authStep === 'PIN' && (
          <form onSubmit={handlePinSubmit} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span>root@semesterhub:~# PIN: </span>
            <input 
              type="password" 
              maxLength={4}
              value={pin}
              onChange={e => setPin(e.target.value)}
              autoFocus
              style={{
                background: 'var(--ink)',
                border: '2px solid var(--green-2)',
                color: 'var(--green-2)',
                fontFamily: 'var(--mono)',
                fontSize: '16px',
                outline: 'none',
                width: '100px',
                letterSpacing: '4px',
                padding: '4px 8px'
              }}
            />
          </form>
        )}

        {authStep === 'CREDS' && (
          <form onSubmit={handleCredsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span style={{ width: '80px' }}>USERNAME: </span>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
                style={{
                  background: 'var(--ink)',
                  border: '2px solid var(--green-2)',
                  color: 'var(--green-2)',
                  fontFamily: 'var(--mono)',
                  fontSize: '16px',
                  outline: 'none',
                  width: '200px',
                  padding: '4px 8px'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span style={{ width: '80px' }}>PASSWORD: </span>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  background: 'var(--ink)',
                  border: '2px solid var(--green-2)',
                  color: 'var(--green-2)',
                  fontFamily: 'var(--mono)',
                  fontSize: '16px',
                  outline: 'none',
                  width: '200px',
                  padding: '4px 8px'
                }}
              />
            </div>
            <button type="submit" style={{ display: 'none' }}>Submit</button>
          </form>
        )}
      </div>
    </div>
  );
}
