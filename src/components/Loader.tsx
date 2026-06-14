"use client";
import React, { useEffect, useState } from 'react';

export default function Loader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 500); // Wait a bit at 100%
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`loader-wrapper ${loading ? '' : 'hidden'}`}>
      
      {/* Grid background layer */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(26, 17, 8, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(26, 17, 8, 0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        zIndex: 1
      }}></div>

      {/* Modal Window */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '90%',
        maxWidth: '800px',
        background: 'var(--ink)',
        border: '4px solid var(--ink)',
        boxShadow: '16px 16px 0 var(--ink)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Top Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '4px solid var(--ink)',
          background: 'var(--paper-2)'
        }}>
          <div style={{ padding: '16px 24px', flex: 1, textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '14px', color: 'var(--ink-2)', fontWeight: 700 }}>
            <span style={{ color: 'var(--saffron)' }}>&lt;status&gt;</span> CRAMMING ENTIRE SYLLABUS THE NIGHT BEFORE... <span style={{ color: 'var(--saffron)' }}>&lt;/status&gt;</span>
          </div>
          <div style={{
            width: '64px',
            alignSelf: 'stretch',
            background: 'var(--saffron)',
            borderLeft: '4px solid var(--ink)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'var(--ink)',
            cursor: 'pointer'
          }}>
            ✕
          </div>
        </div>

        {/* Content Area */}
        <div style={{
          padding: 'clamp(40px, 10vh, 120px) clamp(16px, 5vw, 40px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
           {/* Faint grid background for the content area */}
           <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              height: '100%',
              backgroundImage: 'linear-gradient(rgba(244, 235, 215, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(244, 235, 215, 0.05) 1px, transparent 1px)',
              backgroundSize: '30px 30px'
           }}></div>

           <div style={{ position: 'relative', zIndex: 3, width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Initializing Row */}
              <div style={{ display: 'flex', height: '48px', border: '2px solid var(--paper)' }}>
                 <div style={{
                    width: '48px',
                    background: 'var(--saffron)',
                    borderRight: '2px solid var(--paper)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'var(--paper)'
                 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                       <path d="M5 12h14"></path>
                       <path d="M12 5l7 7-7 7"></path>
                    </svg>
                 </div>
                 <div style={{
                    flex: 1,
                    background: 'var(--paper)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 16px',
                    fontFamily: 'var(--mono)',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'var(--ink)'
                 }}>
                    <span>INITIALIZING...</span>
                    <span>{progress > 100 ? 100 : progress}%</span>
                 </div>
              </div>

              {/* Progress Blocks Row */}
              <div style={{ display: 'flex', gap: '4px', height: '32px' }}>
                 {Array.from({ length: 16 }).map((_, i) => {
                    const threshold = (100 / 16) * i;
                    const isFilled = progress > threshold;
                    return (
                       <div key={i} style={{
                          flex: 1,
                          background: isFilled ? 'var(--saffron)' : 'rgba(244, 235, 215, 0.05)',
                          border: isFilled ? '1px solid var(--saffron)' : '1px solid rgba(244, 235, 215, 0.2)',
                          transition: 'background 0.1s'
                       }}></div>
                    );
                 })}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
