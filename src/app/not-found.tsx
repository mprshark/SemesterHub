"use client";

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'var(--saffron)',
      padding: '24px',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'var(--paper)',
        border: '4px solid var(--ink)',
        boxShadow: '16px 16px 0 var(--ink)',
        padding: 'clamp(40px, 8vw, 80px)',
        maxWidth: '800px',
        width: '100%'
      }}>
        <h1 style={{ 
          fontFamily: 'var(--condensed)', 
          fontSize: 'clamp(80px, 15vw, 150px)', 
          lineHeight: 0.8,
          margin: '0 0 24px 0',
          textTransform: 'uppercase'
        }}>
          404
        </h1>
        <h2 style={{
          fontFamily: 'var(--sans)',
          fontSize: 'clamp(24px, 5vw, 40px)',
          fontWeight: 900,
          margin: '0 0 16px 0',
          textTransform: 'uppercase'
        }}>
          You're lost, student.
        </h2>
        <p style={{
          fontFamily: 'var(--mono)',
          fontSize: '16px',
          color: 'var(--ink-2)',
          marginBottom: '40px'
        }}>
          The syllabus doesn't cover this URL. Turn back before the professor catches you.
        </p>
        
        <Link href="/" style={{
          display: 'inline-block',
          background: 'var(--green)',
          color: 'var(--paper)',
          textDecoration: 'none',
          fontFamily: 'var(--condensed)',
          fontSize: '24px',
          fontWeight: 700,
          textTransform: 'uppercase',
          padding: '16px 40px',
          border: '4px solid var(--ink)',
          boxShadow: '6px 6px 0 var(--ink)',
          transition: 'all 0.1s'
        }}>
          ESCAPE TO HOME
        </Link>
      </div>
    </div>
  );
}
