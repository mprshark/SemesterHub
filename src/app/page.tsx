"use client";

import Link from 'next/link';
import Image from 'next/image';
import Loader from '@/components/Loader';
import { syllabusData } from '@/data/syllabus';
import { useState } from 'react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubjects = syllabusData.filter(subject => 
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    subject.code.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <>
      <Loader />
      
      {/* Top Strip */}
      <div className="top-strip" style={{
        background: 'var(--ink)',
        color: 'var(--paper)',
        fontFamily: 'var(--mono)',
        fontSize: '11px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        padding: '9px 0',
        overflow: 'hidden',
        borderBottom: '3px solid var(--ink)'
      }}>
        <div style={{ display: 'flex', gap: '56px', whiteSpace: 'nowrap', width: 'max-content', animation: 'ticker 20s linear infinite' }}>
          <span>✦ SYLLABUS ✦ NOTES ✦ CHEATSHEETS ✦ PYQ'S ✦ RESOURCES ✦ SYLLABUS ✦ NOTES ✦ CHEATSHEETS ✦ PYQ'S ✦ RESOURCES ✦</span>
          <span>✦ SYLLABUS ✦ NOTES ✦ CHEATSHEETS ✦ PYQ'S ✦ RESOURCES ✦ SYLLABUS ✦ NOTES ✦ CHEATSHEETS ✦ PYQ'S ✦ RESOURCES ✦</span>
        </div>
      </div>

      <main className="container" style={{ paddingBottom: '120px' }}>
        <header style={{ paddingTop: '80px', paddingBottom: '60px', borderBottom: '3px solid var(--ink)', marginBottom: '80px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Image 
            src="/logo.png" 
            alt="SemesterHub Logo" 
            width={180} 
            height={180} 
            style={{ 
              width: 'clamp(100px, 20vw, 180px)',
              height: 'auto',
              border: '4px solid var(--ink)', 
              boxShadow: '8px 8px 0 var(--ink)', 
              marginBottom: 'clamp(16px, 4vw, 32px)',
              borderRadius: '8px',
              background: 'var(--paper)'
            }} 
            priority
          />
          <h1 className="display">
            SEMESTER<em style={{ color: 'var(--green)', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>HUB</em>
          </h1>
          <p className="lead" style={{ marginTop: '24px' }}>
            Access your question papers, syllabus breakdowns, and class notes. Stay lazy, stay updated.
          </p>

          <div style={{ marginTop: '48px', width: '100%', maxWidth: '640px', position: 'relative' }}>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subjects, notes, past papers..." 
              style={{
                width: '100%',
                padding: 'clamp(12px, 3vw, 20px) clamp(100px, 25vw, 120px) clamp(12px, 3vw, 20px) clamp(16px, 4vw, 24px)',
                fontFamily: 'var(--sans)',
                fontSize: 'clamp(14px, 4vw, 18px)',
                border: '3px solid var(--ink)',
                boxShadow: 'clamp(3px, 1vw, 6px) clamp(3px, 1vw, 6px) 0 var(--ink)',
                outline: 'none',
                background: 'var(--paper)',
                color: 'var(--ink)'
              }}
            />
            <button style={{
              position: 'absolute',
              right: 'clamp(6px, 2vw, 12px)',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'var(--saffron)',
              border: '2px solid var(--ink)',
              padding: 'clamp(6px, 1.5vw, 8px) clamp(10px, 3vw, 16px)',
              fontFamily: 'var(--condensed)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: 'clamp(12px, 3vw, 14px)'
            }}>Search</button>
          </div>
        </header>


        <section>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '60px' }}>
            <h2 className="display" style={{ fontSize: 'clamp(32px, 4vw, 56px)', textAlign: 'center' }}>SUBJECTS</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'clamp(16px, 4vw, 32px)' }}>
            {filteredSubjects.length > 0 ? filteredSubjects.map((subject) => (
              <Link key={subject.id} href={`/subject/${subject.id}`} className="card-subject">
                <div className="subject-code">{subject.code}</div>
                <h3 className="subject-title">{subject.name}</h3>
                <div style={{ marginTop: 'auto', paddingTop: '32px' }}>
                  <span style={{ 
                    fontFamily: 'var(--condensed)', 
                    fontSize: '12px', 
                    fontWeight: 600, 
                    letterSpacing: '0.1em', 
                    textTransform: 'uppercase',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderBottom: '2px solid currentColor',
                    paddingBottom: '2px'
                  }}>
                    View Details &rarr;
                  </span>
                </div>
              </Link>
            )) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', fontFamily: 'var(--sans)', color: 'var(--ink-2)' }}>
                <p>No subjects found matching "{searchQuery}". Stop making things up.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
