'use client';

import { useState, useEffect, useRef } from 'react';

const LINE_HEIGHT = 34;
const LINE_COUNT  = 6;

function fmt(d) {
  return d?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) ?? '';
}

function SavedBadge({ show }) {
  return (
    <span
      style={{
        fontSize: '10px',
        fontWeight: '600',
        letterSpacing: '0.06em',
        color: '#22c55e',
        opacity: show ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}
    >
      ✓ Saved
    </span>
  );
}

export default function NotesSection({
  noteKey, rangeNoteKey,
  notes, onSaveNotes,
  rangeStart, rangeEnd,
  onClearRange,
}) {
  const [activeTab, setActiveTab]   = useState('month');
  const [savedFlash, setSavedFlash] = useState(false);
  const flashTimer = useRef(null);

  // Switch to month tab when range is cleared
  useEffect(() => {
    if (!rangeStart) setActiveTab('month');
  }, [rangeStart]);

  const currentKey  = activeTab === 'range' && rangeNoteKey ? rangeNoteKey : noteKey;
  const currentNote = notes[currentKey] || '';
  const rangeActive = !!rangeStart;
  const rangeComplete = rangeActive && !!rangeEnd;

  const dayCount = rangeComplete
    ? Math.floor((rangeEnd - rangeStart) / 86400000) + 1
    : null;

  function handleChange(e) {
    onSaveNotes({ ...notes, [currentKey]: e.target.value });
    // Flash "Saved" indicator
    clearTimeout(flashTimer.current);
    setSavedFlash(true);
    flashTimer.current = setTimeout(() => setSavedFlash(false), 1800);
  }

  function handleClear() {
    const updated = { ...notes };
    delete updated[currentKey];
    onSaveNotes(updated);
  }

  const isRangeTabDisabled = !rangeActive;

  return (
    <div className="flex-1 sm:flex-none sm:w-56 min-w-0 flex flex-col" style={{ minHeight: '260px' }}>

      {/* ── Tab bar ── */}
      <div className="flex border-b" style={{ borderColor: '#f0f0f0' }}>
        {[
          { id: 'month', label: 'Month Notes', icon: '📋' },
          { id: 'range', label: 'Range Notes', icon: '📌' },
        ].map(({ id, label, icon }) => {
          const isActive   = activeTab === id;
          const isDisabled = id === 'range' && isRangeTabDisabled;
          return (
            <button
              key={id}
              onClick={() => !isDisabled && setActiveTab(id)}
              disabled={isDisabled}
              style={{
                flex: 1,
                padding: '10px 8px',
                fontSize: '10.5px',
                fontWeight: isActive ? '700' : '500',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: isActive ? '#2563eb' : isDisabled ? '#d1d5db' : '#9ca3af',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'color 0.2s, border-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
              }}
            >
              <span style={{ fontSize: '12px' }}>{icon}</span>
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 px-5 pt-4 pb-4 flex flex-col gap-3">

        {/* Range context strip — only on range tab */}
        {activeTab === 'range' && (
          <div
            className="flex items-center justify-between rounded-lg px-3 py-2"
            style={{
              background: rangeComplete
                ? 'linear-gradient(135deg, #eff6ff, #eef2ff)'
                : '#f9fafb',
              border: `1px solid ${rangeComplete ? '#bfdbfe' : '#e5e7eb'}`,
            }}
          >
            <div className="flex items-center gap-2">
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                background: rangeComplete ? '#3b82f6' : '#d1d5db',
              }} />
              <span style={{
                fontSize: '11px', fontWeight: '500',
                color: rangeComplete ? '#1d4ed8' : '#9ca3af',
              }}>
                {rangeComplete
                  ? `${fmt(rangeStart)} – ${fmt(rangeEnd)} · ${dayCount} day${dayCount !== 1 ? 's' : ''}`
                  : rangeActive
                  ? `${fmt(rangeStart)} → pick end date`
                  : 'No range selected'}
              </span>
            </div>
            {rangeActive && (
              <button
                onClick={onClearRange}
                style={{
                  fontSize: '10px', color: '#9ca3af', background: 'none',
                  border: 'none', cursor: 'pointer', padding: '0 2px',
                  lineHeight: 1,
                }}
                title="Clear range"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Ruled textarea area */}
        <div className="relative flex-1" style={{ height: `${LINE_COUNT * LINE_HEIGHT}px` }}>

          {/* Ruled lines */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            {Array.from({ length: LINE_COUNT }).map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: 0, right: 0,
                top: `${(i + 1) * LINE_HEIGHT - 1}px`,
                height: '1px',
                background: i === LINE_COUNT - 1
                  ? 'linear-gradient(to right, #e5e7eb 60%, transparent)'
                  : '#f0f0f0',
              }} />
            ))}
          </div>

          {/* Disabled overlay for range tab with no range */}
          {activeTab === 'range' && !rangeActive && (
            <div
              className="absolute inset-0 flex items-center justify-center rounded-lg z-10"
              style={{ background: 'rgba(249,250,251,0.85)' }}
            >
              <div className="text-center">
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>📅</div>
                <p style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '500' }}>
                  Select a date range<br />to add range notes
                </p>
              </div>
            </div>
          )}

          <textarea
            className="absolute inset-0 w-full h-full resize-none bg-transparent outline-none"
            style={{
              fontSize: '13px',
              lineHeight: `${LINE_HEIGHT}px`,
              color: '#374151',
              fontFamily: "'Inter', sans-serif",
              paddingTop: '2px',
              caretColor: '#3b82f6',
              opacity: activeTab === 'range' && !rangeActive ? 0 : 1,
            }}
            value={currentNote}
            onChange={handleChange}
            disabled={activeTab === 'range' && !rangeActive}
            placeholder={
              activeTab === 'month'
                ? 'Notes for this month…'
                : 'Notes for this date range…'
            }
            spellCheck={false}
          />
        </div>

        {/* Footer: char count + saved + clear */}
        <div className="flex items-center justify-between" style={{ marginTop: '2px' }}>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '10px', color: '#d1d5db', fontVariantNumeric: 'tabular-nums' }}>
              {currentNote.length} chars
            </span>
            <SavedBadge show={savedFlash} />
          </div>
          {currentNote && (
            <button
              onClick={handleClear}
              style={{
                fontSize: '10px', fontWeight: '500',
                color: '#ef4444', background: 'none',
                border: 'none', cursor: 'pointer',
                opacity: 0.7,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
            >
              Clear note
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
