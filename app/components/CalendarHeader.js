'use client';

import Image from 'next/image';
import { useRef } from 'react';

export default function CalendarHeader({ heroImage, imageAlt, monthName, year, onPrev, onNext, onToday }) {
  const touchStartX = useRef(null);

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) dx < 0 ? onNext() : onPrev();
    touchStartX.current = null;
  }

  const navBtnStyle = {
    width: '32px', height: '32px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.18)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: '#fff', fontSize: '20px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', backdropFilter: 'blur(6px)',
    transition: 'background 0.15s, transform 0.15s',
    outline: 'none',
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: '280px' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Photo */}
      <Image
        src={heroImage}
        alt={imageAlt || `${monthName} ${year}`}
        fill
        style={{ objectFit: 'cover', objectPosition: 'center 35%' }}
        priority
        unoptimized
      />

      {/* Vignette */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.45) 100%)',
      }} />
      <div className="absolute bottom-0 left-0 right-0" style={{
        height: '80px',
        background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.35))',
      }} />

      {/* Geometric accents */}
      <svg className="absolute bottom-0 left-0" width="180" height="110" viewBox="0 0 180 110" fill="none">
        <polygon points="0,110 180,110 0,28" fill="rgba(37,99,235,0.88)" />
        <line x1="0" y1="28" x2="180" y2="110" stroke="rgba(147,197,253,0.5)" strokeWidth="1" />
      </svg>
      <svg className="absolute bottom-0 right-0" width="110" height="72" viewBox="0 0 110 72" fill="none">
        <polygon points="110,72 0,72 110,14" fill="rgba(37,99,235,0.72)" />
        <line x1="110" y1="14" x2="0" y2="72" stroke="rgba(147,197,253,0.4)" strokeWidth="1" />
      </svg>

      {/* Month / year — right panel */}
      <div
        className="absolute right-0 top-0 bottom-0 flex flex-col items-end justify-center pr-7 pl-10"
        style={{
          background: 'linear-gradient(to left, rgba(0,0,0,0.42) 0%, transparent 100%)',
          minWidth: '180px',
        }}
      >
        <div className="absolute left-0 top-8 bottom-8 w-px" style={{
          background: 'linear-gradient(to bottom, transparent, rgba(147,197,253,0.6) 30%, rgba(147,197,253,0.6) 70%, transparent)',
        }} />
        <span className="text-blue-200 font-light tracking-[0.3em] text-xs mb-2 uppercase">
          {year}
        </span>
        <h1
          className="text-white font-bold uppercase text-right leading-none"
          style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: 'clamp(1.75rem, 4.5vw, 2.6rem)',
            letterSpacing: '0.04em',
            textShadow: '0 2px 16px rgba(0,0,0,0.5)',
          }}
        >
          {monthName}
        </h1>
        {/* Swipe hint — mobile only */}
        <span className="sm:hidden mt-3 text-white/40 text-xs tracking-wider">
          ← swipe →
        </span>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-4 left-5 flex items-center gap-2 z-10">
        <button
          onClick={onPrev}
          style={navBtnStyle}
          aria-label="Previous month"
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.transform = 'scale(1)'; }}
          onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(147,197,253,0.6)'; }}
          onBlur={e => { e.currentTarget.style.boxShadow = 'none'; }}
        >
          ‹
        </button>

        <button
          onClick={onToday}
          aria-label="Go to today"
          style={{
            padding: '5px 14px', borderRadius: '999px',
            background: 'rgba(255,255,255,0.18)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff', fontSize: '11px', fontWeight: '600',
            letterSpacing: '0.08em', backdropFilter: 'blur(6px)',
            cursor: 'pointer', outline: 'none',
            transition: 'background 0.15s, transform 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.transform = 'scale(1)'; }}
          onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(147,197,253,0.6)'; }}
          onBlur={e => { e.currentTarget.style.boxShadow = 'none'; }}
        >
          TODAY
        </button>

        <button
          onClick={onNext}
          style={navBtnStyle}
          aria-label="Next month"
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.transform = 'scale(1)'; }}
          onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(147,197,253,0.6)'; }}
          onBlur={e => { e.currentTarget.style.boxShadow = 'none'; }}
        >
          ›
        </button>
      </div>
    </div>
  );
}
