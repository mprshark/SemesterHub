"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Subject } from '@/data/syllabus';
import { supabase } from '@/lib/supabase';

type CommunityNote = {
  id: number;
  subject_id: string;
  file_name: string;
  file_url: string;
  category: string;
  created_at: string;
};

export default function ResourceTabs({ subject }: { subject: Subject }) {
  const [activeTab, setActiveTab] = useState('Syllabus');
  const [communityNotes, setCommunityNotes] = useState<CommunityNote[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      const { data } = await supabase
        .from('community_notes')
        .select('*')
        .eq('subject_id', subject.id)
        .order('created_at', { ascending: false });
      if (data) setCommunityNotes(data);
    };
    fetchNotes();
  }, [subject.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const { error: uploadError } = await supabase.storage
      .from('community-notes')
      .upload(fileName, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      alert("Upload failed. Make sure the 'community-notes' bucket exists and allows uploads.");
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('community-notes')
      .getPublicUrl(fileName);

    const { data: insertData, error: insertError } = await supabase
      .from('community_notes')
      .insert([{ subject_id: subject.id, file_name: file.name, file_url: publicUrl, category: 'Notes' }])
      .select();

    if (insertData) {
      setCommunityNotes(prev => [insertData[0], ...prev]);
    } else if (insertError) {
      console.error("Database error:", insertError);
      alert("Failed to save note record to database. Did you create the table?");
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const notesList = communityNotes.filter(n => n.category === 'Notes' || !n.category);
  const cheatSheetsList = communityNotes.filter(n => n.category === 'Cheat Sheets');
  const pastPapersList = communityNotes.filter(n => n.category === 'Past Papers');
  const labsList = communityNotes.filter(n => n.category === 'Lab / Practicals');
  const projectsList = communityNotes.filter(n => n.category === 'Projects');
  const booksList = communityNotes.filter(n => n.category === 'Books');
  
  const tabs = ['Syllabus', 'Notes', 'Past Papers', 'Lab / Practicals', 'Projects', 'Cheat Sheets', 'Books'];

  return (
    <div style={{ marginTop: '64px' }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 24px)',
              fontFamily: 'var(--mono)',
              fontSize: 'clamp(12px, 3vw, 14px)',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              background: activeTab === tab ? 'var(--saffron)' : 'var(--paper)',
              color: activeTab === tab ? 'var(--paper)' : 'var(--ink)',
              border: '3px solid var(--ink)',
              boxShadow: activeTab === tab ? 'none' : '4px 4px 0 var(--ink)',
              transform: activeTab === tab ? 'translate(4px, 4px)' : 'none',
              transition: 'all 0.1s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ 
        background: 'var(--paper-2)', 
        border: '3px solid var(--ink)', 
        boxShadow: '8px 8px 0 var(--ink)',
        padding: 'clamp(20px, 5vw, 40px)',
        minHeight: '400px'
      }}>
        {activeTab === 'Syllabus' && (
          <div>
            <h2 className="display" style={{ fontSize: '32px', marginBottom: '40px' }}>Units Breakdown</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {subject.units.map((unit, idx) => (
                <details key={idx} style={{
                  background: 'var(--paper)',
                  border: '3px solid var(--ink)',
                  boxShadow: '4px 4px 0 var(--ink)',
                  padding: '24px',
                  cursor: 'pointer'
                }}>
                  <summary style={{
                    fontFamily: 'var(--condensed)',
                    fontSize: '24px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    outline: 'none',
                    listStyle: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    {unit.title}
                    <span style={{ color: 'var(--saffron)', fontSize: '20px' }}>▼</span>
                  </summary>
                  
                  <div style={{ marginTop: '24px', borderTop: '2px dashed var(--ink)', paddingTop: '24px' }}>
                    <p style={{ fontFamily: 'var(--sans)', fontStyle: 'italic', color: 'var(--ink-2)', marginBottom: '16px' }}>
                      <strong>Why it matters:</strong> {unit.whyItMatters || "Because it's on the exam."}
                    </p>
                    {unit.reading && (
                      <p style={{ fontFamily: 'var(--mono)', fontSize: '14px', color: 'var(--green-2)', marginBottom: '24px' }}>
                        📖 {unit.reading}
                      </p>
                    )}
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {unit.topics.map((topic, tIdx) => (
                        <li key={tIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontFamily: 'var(--sans)', lineHeight: 1.5 }}>
                          <span style={{ color: 'var(--saffron)' }}>✦</span> {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Notes' && (
          <div>
            <h2 className="display" style={{ fontSize: '32px', marginBottom: '24px' }}>Class Notes</h2>
            
            {notesList.length > 0 ? (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {notesList.map((note) => (
                  <li key={note.id} style={{ padding: '16px', background: 'var(--paper)', border: '2px solid var(--ink)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--saffron-deep)' }}>
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                      <p style={{ fontFamily: 'var(--sans)', marginTop: '4px', fontWeight: 600, wordBreak: 'break-all' }}>{note.file_name}</p>
                    </div>
                    <a href={note.file_url} target="_blank" rel="noopener noreferrer" style={{
                      background: 'var(--saffron)',
                      color: 'var(--paper)',
                      padding: '8px 16px',
                      fontFamily: 'var(--condensed)',
                      fontSize: '14px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      border: '2px solid var(--ink)'
                    }}>Download</a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="lead" style={{ marginTop: 0 }}>Nothing here yet. Stay lazy, check back later.</p>
            )}

            <div style={{ marginTop: '40px', padding: '24px', border: '3px dashed var(--saffron-deep)', background: 'var(--paper)' }}>
              <h3 style={{ fontFamily: 'var(--condensed)', fontSize: '20px', textTransform: 'uppercase' }}>Contribute</h3>
              <p style={{ fontFamily: 'var(--sans)', marginTop: '8px' }}>Found better notes? Don't be selfish.</p>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                style={{ display: 'none' }} 
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              />
              <button 
                className="btn-primary" 
                style={{ marginTop: '16px', opacity: isUploading ? 0.7 : 1, cursor: isUploading ? 'not-allowed' : 'pointer' }}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload Notes'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'Past Papers' && (
          <div>
            <h2 className="display" style={{ fontSize: '32px', marginBottom: '24px' }}>Past Papers</h2>
            <p className="lead" style={{ marginTop: 0 }}>What they asked last time (they're not creative).</p>
            
            {pastPapersList.length > 0 && (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px', marginBottom: '32px' }}>
                {pastPapersList.map((paper) => (
                  <li key={paper.id} style={{ padding: '16px', background: 'var(--paper)', border: '2px solid var(--ink)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontFamily: 'var(--sans)', fontWeight: 600, margin: 0, wordBreak: 'break-all' }}>{paper.file_name}</p>
                    <a href={paper.file_url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: '4px 12px', fontSize: '12px' }}>Download</a>
                  </li>
                ))}
              </ul>
            )}

            <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}>
              {subject.practiceTopics.map((pt, idx) => (
                <li key={idx} style={{ padding: '16px', background: 'var(--paper)', border: '2px solid var(--ink)' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--saffron-deep)' }}>#EXAM-IMPORTANT</span>
                  <p style={{ fontFamily: 'var(--sans)', marginTop: '8px', fontWeight: 600 }}>{pt}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'Lab / Practicals' && (
          <div>
            <h2 className="display" style={{ fontSize: '32px', marginBottom: '24px' }}>Lab Practicals</h2>
            
            {labsList.length > 0 && (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {labsList.map((lab) => (
                  <li key={lab.id} style={{ padding: '16px', background: 'var(--paper)', border: '2px solid var(--ink)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontFamily: 'var(--sans)', fontWeight: 600, margin: 0, wordBreak: 'break-all' }}>{lab.file_name}</p>
                    <a href={lab.file_url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: '4px 12px', fontSize: '12px' }}>Download</a>
                  </li>
                ))}
              </ul>
            )}

            {subject.labs.length > 0 ? (
              <ol style={{ paddingLeft: '24px', fontFamily: 'var(--sans)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {subject.labs.map((lab, idx) => (
                  <li key={idx}><strong>Lab {idx+1}:</strong> {lab}</li>
                ))}
              </ol>
            ) : (
              <p className="lead" style={{ marginTop: 0 }}>No official labs for this subject. Enjoy the free time.</p>
            )}
          </div>
        )}

        {activeTab === 'Projects' && (
          <div>
            <h2 className="display" style={{ fontSize: '32px', marginBottom: '24px' }}>Project Ideas</h2>
            
            {projectsList.length > 0 && (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {projectsList.map((proj) => (
                  <li key={proj.id} style={{ padding: '16px', background: 'var(--paper)', border: '2px solid var(--ink)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontFamily: 'var(--sans)', fontWeight: 600, margin: 0, wordBreak: 'break-all' }}>{proj.file_name}</p>
                    <a href={proj.file_url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: '4px 12px', fontSize: '12px' }}>Download</a>
                  </li>
                ))}
              </ul>
            )}

            {subject.projects.length > 0 ? (
              <ul style={{ listStyle: 'square', paddingLeft: '24px', fontFamily: 'var(--sans)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {subject.projects.map((proj, idx) => (
                  <li key={idx}>{proj}</li>
                ))}
              </ul>
            ) : (
              <p className="lead" style={{ marginTop: 0 }}>No official projects.</p>
            )}
          </div>
        )}

        {activeTab === 'Cheat Sheets' && (
          <div>
            <h2 className="display" style={{ fontSize: '32px', marginBottom: '24px' }}>Cheat Sheets</h2>
            <p className="lead" style={{ marginTop: 0 }}>Everything, one page, zero shame.</p>
            
            {cheatSheetsList.length > 0 ? (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}>
                {cheatSheetsList.map((cs) => (
                  <li key={cs.id} style={{ padding: '16px', background: 'var(--saffron)', color: 'var(--paper)', border: '3px solid var(--ink)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontFamily: 'var(--sans)', fontWeight: 700, margin: 0, wordBreak: 'break-all' }}>{cs.file_name}</p>
                    <a href={cs.file_url} target="_blank" rel="noopener noreferrer" style={{
                      background: 'var(--paper)',
                      color: 'var(--ink)',
                      padding: '6px 12px',
                      fontFamily: 'var(--mono)',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      border: '2px solid var(--ink)'
                    }}>Open</a>
                  </li>
                ))}
              </ul>
            ) : (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}>
                {subject.cheatSheets.map((cs, idx) => (
                  <li key={idx} style={{ padding: '16px', background: 'var(--saffron)', color: 'var(--paper)', border: '3px solid var(--ink)', fontWeight: 700, fontFamily: 'var(--sans)' }}>
                    {cs}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'Books' && (
          <div>
            <h2 className="display" style={{ fontSize: '32px', marginBottom: '24px' }}>Books & References</h2>
            
            {booksList.length > 0 && (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {booksList.map((book) => (
                  <li key={book.id} style={{ padding: '16px', background: 'var(--paper)', border: '2px solid var(--ink)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontFamily: 'var(--sans)', fontWeight: 600, margin: 0, wordBreak: 'break-all' }}>{book.file_name}</p>
                    <a href={book.file_url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: '4px 12px', fontSize: '12px' }}>Download</a>
                  </li>
                ))}
              </ul>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {subject.books.map((book, idx) => (
                <div key={idx} style={{ padding: '24px', background: 'var(--paper)', border: '2px solid var(--ink)' }}>
                  <h3 style={{ fontFamily: 'var(--condensed)', fontSize: '24px', textTransform: 'uppercase' }}>
                    {book.title}
                  </h3>
                  <p style={{ fontFamily: 'var(--sans)', color: 'var(--ink-2)', marginTop: '4px' }}>by {book.author}</p>
                  
                  {book.isPrimary && (
                    <span style={{ display: 'inline-block', marginTop: '12px', padding: '4px 8px', background: 'var(--green)', color: 'white', fontFamily: 'var(--mono)', fontSize: '10px', textTransform: 'uppercase' }}>
                      Primary Textbook
                    </span>
                  )}
                  {book.isBeginnerFriendly && (
                    <span style={{ display: 'inline-block', marginTop: '12px', marginLeft: '8px', padding: '4px 8px', background: 'var(--saffron)', color: 'white', fontFamily: 'var(--mono)', fontSize: '10px', textTransform: 'uppercase' }}>
                      Beginner Friendly
                    </span>
                  )}
                  {book.note && (
                    <p style={{ marginTop: '16px', fontFamily: 'var(--sans)', fontSize: '14px', fontStyle: 'italic', borderLeft: '3px solid var(--ink)', paddingLeft: '12px' }}>
                      {book.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
