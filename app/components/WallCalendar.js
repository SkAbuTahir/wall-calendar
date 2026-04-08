'use client';

import { useState, useCallback, useEffect } from 'react';
import CalendarHeader from './CalendarHeader';
import SpiralBinding from './SpiralBinding';
import NotesSection from './NotesSection';
import CalendarGrid from './CalendarGrid';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

/** Fixed-date public holidays (month-day → label) */
const HOLIDAYS = {
  '1-1':   "New Year's Day",
  '2-2':   "Groundhog Day",
  '2-14':  "Valentine's Day",
  '3-14':  "Pi Day",
  '3-17':  "St. Patrick's Day",
  '4-1':   "April Fools'",
  '4-22':  "Earth Day",
  '5-1':   "May Day",
  '5-4':   "Star Wars Day",
  '5-5':   "Cinco de Mayo",
  '6-19':  "Juneteenth",
  '6-21':  "Summer Solstice",
  '7-4':   "Independence Day",
  '8-26':  "Women's Equality Day",
  '9-22':  "Autumn Equinox",
  '10-31': "Halloween",
  '11-11': "Veterans Day",
  '12-21': "Winter Solstice",
  '12-24': "Christmas Eve",
  '12-25': "Christmas Day",
  '12-31': "New Year's Eve",
};

/** One hero image per month — landscape photography themed to each season */
const MONTH_IMAGES = [
  // Jan — snowy winter sunrise over pine forest & mountains
  'https://images.pexels.com/photos/1687247/pexels-photo-1687247.jpeg?auto=compress&cs=tinysrgb&w=1400',
  // Feb — vibrant red roses bouquet
  'https://images.pexels.com/photos/12268567/pexels-photo-12268567.jpeg?auto=compress&cs=tinysrgb&w=1400',
  // Mar — lush green tea plantation hills at sunrise
  'https://images.pexels.com/photos/1009937/pexels-photo-1009937.jpeg?auto=compress&cs=tinysrgb&w=1400',
  // Apr — cherry blossom-lined canal path
  'https://images.pexels.com/photos/14978029/pexels-photo-14978029.jpeg?auto=compress&cs=tinysrgb&w=1400',
  // May — colorful wildflower field under clear blue sky
  'https://images.pexels.com/photos/966855/pexels-photo-966855.jpeg?auto=compress&cs=tinysrgb&w=1400',
  // Jun — tropical beach with palm trees at sunset
  'https://images.pexels.com/photos/3601461/pexels-photo-3601461.jpeg?auto=compress&cs=tinysrgb&w=1400',
  // Jul — mountain lake reflection at Banff under blue sky
  'https://images.pexels.com/photos/29123269/pexels-photo-29123269.jpeg?auto=compress&cs=tinysrgb&w=1400',
  // Aug — vibrant sunflower field in golden sunlight
  'https://images.pexels.com/photos/33180749/pexels-photo-33180749.jpeg?auto=compress&cs=tinysrgb&w=1400',
  // Sep — autumn vineyard with golden rolling hills
  'https://images.pexels.com/photos/30239094/pexels-photo-30239094.jpeg?auto=compress&cs=tinysrgb&w=1400',
  // Oct — vibrant orange and red autumn forest foliage
  'https://images.pexels.com/photos/589807/pexels-photo-589807.jpeg?auto=compress&cs=tinysrgb&w=1400',
  // Nov — misty foggy autumn forest with bare trees
  'https://images.pexels.com/photos/5604760/pexels-photo-5604760.jpeg?auto=compress&cs=tinysrgb&w=1400',
  // Dec — starry night sky over snow-covered pine trees
  'https://images.pexels.com/photos/2533340/pexels-photo-2533340.png?auto=compress&cs=tinysrgb&w=1400',
];

const MONTH_IMAGE_ALTS = [
  'Snow-covered pine forest and mountains at winter sunrise',
  'Vibrant red roses bouquet for Valentine\'s month',
  'Lush green tea plantation hills at sunrise in March',
  'Cherry blossom trees lining a peaceful park path in April',
  'Colorful wildflower meadow blooming under blue sky in May',
  'Tropical beach with palm trees at golden sunset in June',
  'Mountain lake reflection at Banff National Park in July',
  'Golden sunflower field in full bloom in August',
  'Autumn vineyard with golden foliage and rolling hills in September',
  'Vibrant orange and red fall forest foliage in October',
  'Misty foggy autumn forest with bare trees in November',
  'Starry winter night sky over snow-covered pine trees in December',
];

export default function WallCalendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [notes, setNotes] = useState({});
  const [animKey, setAnimKey] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('wall-calendar-notes');
      if (saved) setNotes(JSON.parse(saved));
    } catch {}
  }, []);

  const saveNotes = useCallback((updated) => {
    setNotes(updated);
    try { localStorage.setItem('wall-calendar-notes', JSON.stringify(updated)); } catch {}
  }, []);

  const navigate = useCallback((dir) => {
    if (isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentDate(prev => {
        const d = new Date(prev);
        d.setMonth(d.getMonth() + (dir === 'next' ? 1 : -1));
        return d;
      });
      setAnimKey(k => k + 1);
      setIsFlipping(false);
    }, 350);
  }, [isFlipping]);

  const handleDayClick = useCallback((date) => {
    if (!rangeStart || rangeEnd) {
      setRangeStart(date); setRangeEnd(null);
    } else {
      if (date < rangeStart) { setRangeEnd(rangeStart); setRangeStart(date); }
      else setRangeEnd(date);
    }
  }, [rangeStart, rangeEnd]);

  const noteKey = `${year}-${month}`;
  const rangeNoteKey = rangeStart
    ? `range-${rangeStart.toISOString().split('T')[0]}${rangeEnd ? '-to-' + rangeEnd.toISOString().split('T')[0] : ''}`
    : null;
  const getHoliday = (day) => HOLIDAYS[`${month + 1}-${day}`] ?? null;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-10"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f2744 100%)',
      }}
    >
      {/* Hanging hook */}
      <div className="flex flex-col items-center" style={{ marginBottom: '-1px', zIndex: 20 }}>
        <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
          <path
            d="M14 28 C14 28 4 28 4 18 C4 10 10 6 14 6 C18 6 24 10 24 18"
            stroke="url(#hookGrad)" strokeWidth="3" strokeLinecap="round" fill="none"
          />
          <line x1="14" y1="28" x2="14" y2="32" stroke="url(#hookGrad)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="14" cy="4" r="3" fill="url(#hookGrad)" />
          <circle cx="14" cy="4" r="1.2" fill="#0f172a" />
          <defs>
            <linearGradient id="hookGrad" x1="4" y1="4" x2="24" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Calendar card */}
      <div
        className={`w-full max-w-3xl rounded-2xl card-shadow ${isFlipping ? 'calendar-exit' : 'calendar-enter'}`}
        key={animKey}
        style={{ background: '#ffffff', position: 'relative', overflow: 'visible' }}
      >
        <SpiralBinding />

        {/* Inner wrapper clips image + body to rounded corners */}
        <div className="rounded-2xl overflow-hidden">

          {/* Hero image */}
          <CalendarHeader
            heroImage={MONTH_IMAGES[month]}
            imageAlt={MONTH_IMAGE_ALTS[month]}
            monthName={MONTH_NAMES[month]}
            year={year}
            onPrev={() => navigate('prev')}
            onNext={() => navigate('next')}
            onToday={() => {
              setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
            }}
          />

          {/* Bottom: Notes + Grid */}
          <div className="flex flex-col sm:flex-row" style={{ background: '#fafafa' }}>
            <NotesSection
              noteKey={noteKey}
              rangeNoteKey={rangeNoteKey}
              notes={notes}
              onSaveNotes={saveNotes}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              onClearRange={() => { setRangeStart(null); setRangeEnd(null); }}
            />

            <div className="hidden sm:block" style={{ width: '1px', background: 'linear-gradient(to bottom, transparent, #e5e7eb 20%, #e5e7eb 80%, transparent)' }} />
            <div className="sm:hidden mx-6" style={{ height: '1px', background: '#e5e7eb' }} />

            <CalendarGrid
              month={month}
              year={year}
              today={today}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              hoveredDate={hoveredDate}
              getHoliday={getHoliday}
              onDayClick={handleDayClick}
              onDayHover={setHoveredDate}
              onEscape={() => { setRangeStart(null); setRangeEnd(null); }}
            />
          </div>

          {/* Bottom accent bar */}
          <div style={{ height: '4px', background: 'linear-gradient(90deg, #3b82f6, #6366f1, #3b82f6)' }} />
        </div>
      </div>

      <p className="mt-5 text-xs tracking-widest uppercase" style={{ color: 'rgba(148,163,184,0.6)' }}>
        Click start · click end · select across months
      </p>
    </div>
  );
}
