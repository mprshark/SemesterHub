import Link from 'next/link';
import { notFound } from 'next/navigation';
import { syllabusData } from '@/data/syllabus';
import React from 'react';
import ResourceTabs from '@/components/Tabs';

// Generates static params for all subjects
export async function generateStaticParams() {
  return syllabusData.map((subject) => ({
    id: subject.id,
  }));
}

export default async function SubjectPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const subject = syllabusData.find(s => s.id === id);

  if (!subject) {
    notFound();
  }

  return (
    <>
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
        <div style={{ display: 'flex', gap: '56px', whiteSpace: 'nowrap', width: 'max-content', animation: 'ticker 50s linear infinite' }}>
          <span>✦ {subject.name} ✦ {subject.code} ✦ {subject.name} ✦ {subject.code} ✦</span>
        </div>
      </div>

      <main className="container" style={{ paddingBottom: '120px' }}>
        <header style={{ paddingTop: '60px', paddingBottom: '40px', borderBottom: '3px solid var(--ink)', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
            <div>
              <Link href="/" style={{ 
                fontFamily: 'var(--mono)', 
                fontSize: '12px', 
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--ink-2)',
                display: 'inline-block',
                marginBottom: '32px',
                borderBottom: '1px solid currentColor'
              }}>
                &larr; Back to Subjects
              </Link>
              <br/>
              <span className="eyebrow">&lt;subject breakdown&gt;</span>
              <h1 className="display" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
                {subject.name}
              </h1>
              <p className="lead" style={{ marginTop: '16px', fontFamily: 'var(--mono)', color: 'var(--saffron-deep)' }}>
                {subject.code}
              </p>
            </div>

            {/* At a glance box */}
            <div className="at-a-glance" style={{ 
              background: 'var(--paper-2)', 
              border: '3px solid var(--ink)', 
              boxShadow: '6px 6px 0 var(--ink)',
              padding: '24px'
            }}>
              <h3 style={{ fontFamily: 'var(--mono)', fontSize: '14px', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '2px solid var(--ink)', paddingBottom: '8px' }}>At a Glance</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: 'var(--sans)', fontSize: '14px' }}>
                <li><strong>Credits:</strong> {subject.credits} ({subject.hours})</li>
                <li><strong>Exam Split:</strong> {subject.examSplit.internal} / {subject.examSplit.endTerm}</li>
                {subject.examSplit.note && <li style={{ color: 'var(--saffron-deep)', fontStyle: 'italic', fontSize: '12px' }}>Note: {subject.examSplit.note}</li>}
                <li><strong>Lab Heavy:</strong> {subject.isLabHeavy ? 'Yes 🔬' : 'No'}</li>
                <li><strong>Units:</strong> {subject.units.length}</li>
              </ul>
              <a href={subject.pdf} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '24px', padding: '12px', fontSize: '12px' }}>
                Download Official PDF
              </a>
            </div>
          </div>

          <div style={{ marginTop: '48px', maxWidth: '800px' }}>
            <h2 className="display" style={{ fontSize: '32px', marginBottom: '16px' }}>Roadmap</h2>
            <p className="lead" style={{ marginTop: 0 }}>
              {subject.roadmapText}
            </p>
          </div>
        </header>

        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             {/* Exam mode toggle (Mock) */}
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 600 }}>Panic Mode:</span>
                <button style={{ 
                  width: '48px', 
                  height: '24px', 
                  background: 'var(--ink)', 
                  borderRadius: '12px', 
                  position: 'relative' 
                }}>
                  <div style={{ width: '16px', height: '16px', background: 'var(--paper)', borderRadius: '50%', position: 'absolute', top: '4px', left: '4px' }}></div>
                </button>
             </div>
          </div>
          
          <ResourceTabs subject={subject} />
        </section>
      </main>
    </>
  );
}
