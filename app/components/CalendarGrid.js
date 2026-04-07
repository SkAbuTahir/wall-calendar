'use client';

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function isSameDay(a, b) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function normBounds(a, b) {
  if (!a || !b) return { s: a, e: b };
  return a <= b ? { s: a, e: b } : { s: b, e: a };
}

function isInRange(date, s, e) {
  if (!s || !e) return false;
  const t = date.getTime();
  return t > s.getTime() && t < e.getTime();
}

// Tooltip that appears above a day cell
function HolidayTooltip({ name }) {
  return (
    <div
      className="holiday-tooltip"
      role="tooltip"
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 6px)',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#1e293b',
        color: '#f1f5f9',
        fontSize: '10.5px',
        fontWeight: '500',
        whiteSpace: 'nowrap',
        padding: '4px 8px',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        zIndex: 50,
        pointerEvents: 'none',
        letterSpacing: '0.02em',
      }}
    >
      {name}
      <span style={{
        position: 'absolute',
        top: '100%', left: '50%',
        transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '5px solid transparent',
        borderRight: '5px solid transparent',
        borderTop: '5px solid #1e293b',
      }} />
    </div>
  );
}

/**
 * Build a 42-cell grid (6 rows × 7 cols, Mon-start).
 * Each cell: { date: Date, type: 'current' | 'prev' | 'next' }
 */
function buildCells(year, month) {
  const firstDow = new Date(year, month, 1).getDay();
  const offset = (firstDow + 6) % 7; // Mon = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const arr = [];

  // Previous month trailing days
  if (offset > 0) {
    const prevM = month === 0 ? 11 : month - 1;
    const prevY = month === 0 ? year - 1 : year;
    const prevDays = new Date(prevY, prevM + 1, 0).getDate();
    for (let i = offset - 1; i >= 0; i--) {
      arr.push({ date: new Date(prevY, prevM, prevDays - i), type: 'prev' });
    }
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    arr.push({ date: new Date(year, month, d), type: 'current' });
  }

  // Next month leading days to fill 42 cells
  const nextM = month === 11 ? 0 : month + 1;
  const nextY = month === 11 ? year + 1 : year;
  let nextD = 1;
  while (arr.length < 42) {
    arr.push({ date: new Date(nextY, nextM, nextD++), type: 'next' });
  }

  return arr;
}

export default function CalendarGrid({
  month, year, today, rangeStart, rangeEnd, hoveredDate,
  getHoliday, onDayClick, onDayHover, onEscape,
}) {
  const [focusedIdx, setFocusedIdx]   = useState(null);
  const [tooltipDay, setTooltipDay]   = useState(null);
  const gridRef                       = useRef(null);

  const cells = useMemo(() => buildCells(year, month), [month, year]);

  // Indices of current-month cells only (for keyboard navigation)
  const dayIndices = useMemo(
    () => cells.map((c, i) => (c.type === 'current' ? i : null)).filter(i => i !== null),
    [cells]
  );

  // Reset focus when month changes
  useEffect(() => { setFocusedIdx(null); }, [month, year]);

  const rawEnd = rangeStart && !rangeEnd ? hoveredDate : rangeEnd;
  const { s: selS, e: selE } = normBounds(rangeStart, rawEnd);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') { onEscape?.(); return; }

    const currentPos = focusedIdx !== null ? dayIndices.indexOf(focusedIdx) : -1;
    let nextPos = currentPos;

    if (e.key === 'ArrowRight') nextPos = Math.min(currentPos + 1, dayIndices.length - 1);
    else if (e.key === 'ArrowLeft') nextPos = Math.max(currentPos - 1, 0);
    else if (e.key === 'ArrowDown') nextPos = Math.min(currentPos + 7, dayIndices.length - 1);
    else if (e.key === 'ArrowUp') nextPos = Math.max(currentPos - 7, 0);
    else if (e.key === 'Enter' || e.key === ' ') {
      if (focusedIdx !== null && cells[focusedIdx]?.type === 'current') {
        e.preventDefault();
        onDayClick(cells[focusedIdx].date);
      }
      return;
    } else return;

    e.preventDefault();
    if (nextPos !== currentPos && dayIndices[nextPos] !== undefined) {
      const newIdx = dayIndices[nextPos];
      setFocusedIdx(newIdx);
      onDayHover(cells[newIdx].date);
      const btn = gridRef.current?.querySelector(`[data-idx="${newIdx}"]`);
      btn?.focus();
    }
  }, [focusedIdx, dayIndices, cells, onDayClick, onDayHover, onEscape]);

  const isPast = (date) => date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const awaitingEnd = rangeStart && !rangeEnd;

  return (
    <div
      className="flex-1 min-w-0 px-4 pt-5 pb-5 flex flex-col"
      onKeyDown={handleKeyDown}
      ref={gridRef}
    >
      {/* Selection status hint */}
      <div style={{ height: '22px', marginBottom: '6px' }}>
        {awaitingEnd ? (
          <div className="flex items-center gap-1.5">
            <span className="pulse-dot" />
            <span style={{ fontSize: '10.5px', color: '#6366f1', fontWeight: '500' }}>
              Click or hover to preview end date
            </span>
          </div>
        ) : rangeStart && rangeEnd ? (
          <div className="flex items-center gap-1.5">
            <span style={{
              display: 'inline-block', width: '6px', height: '6px',
              borderRadius: '50%', background: '#22c55e', flexShrink: 0,
            }} />
            <span style={{ fontSize: '10.5px', color: '#16a34a', fontWeight: '500' }}>
              {Math.floor((rangeEnd - rangeStart) / 86400000) + 1} days selected
              &nbsp;·&nbsp;
              <button
                onClick={() => onEscape?.()}
                style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontSize: '10.5px', padding: 0 }}
              >
                Clear ✕
              </button>
            </span>
          </div>
        ) : (
          <span style={{ fontSize: '10.5px', color: '#d1d5db' }}>
            Click a date to start selection
          </span>
        )}
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1" role="row" aria-label="Days of the week">
        {DAY_LABELS.map((d, i) => (
          <div
            key={d}
            role="columnheader"
            aria-label={['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][i]}
            className="text-center py-1"
            style={{
              fontSize: '10px',
              fontWeight: '700',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: i === 6 ? '#3b82f6' : i === 5 ? '#6366f1' : '#9ca3af',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7" role="grid" aria-label={`${month + 1} ${year} calendar`}>
        {cells.map((cell, idx) => {
          // ── Overflow cells (prev / next month) ───────────────────────
          if (cell.type !== 'current') {
            return (
              <div
                key={`ov-${idx}`}
                role="gridcell"
                aria-hidden
                className="flex items-center justify-center"
                style={{ height: '40px' }}
              >
                <span style={{
                  fontSize: '12px',
                  fontWeight: '400',
                  color: '#9ca3af',
                  opacity: 0.45,
                  userSelect: 'none',
                }}>
                  {cell.date.getDate()}
                </span>
              </div>
            );
          }

          // ── Current month cells ───────────────────────────────────────
          const date    = cell.date;
          const day     = date.getDate();
          const dow     = date.getDay();
          const isSun   = dow === 0;
          const isSat   = dow === 6;
          const isToday = isSameDay(date, today);
          const isStart = selS && isSameDay(date, selS);
          const isEnd   = selE && isSameDay(date, selE);
          const inRange = isInRange(date, selS, selE);
          const isSelected = isStart || isEnd;
          const isSingle   = isStart && isEnd;
          const isHov      = isSameDay(date, hoveredDate);
          const isFocused  = focusedIdx === idx;
          const holiday    = getHoliday(day);
          const past       = isPast(date);
          const isStartAwaiting = isStart && awaitingEnd;

          const showStrip = inRange || (isStart && selE && !isSingle) || (isEnd && !isSingle);
          const stripL    = isStart && !isSingle ? '50%' : '0';
          const stripR    = isEnd   && !isSingle ? '50%' : '0';

          let bg     = 'transparent';
          let color  = isSun ? '#3b82f6' : isSat ? '#6366f1' : past ? '#c4c9d4' : '#374151';
          let border = 'none';
          let weight = '400';
          let shadow = 'none';

          if (isSelected) {
            bg     = 'linear-gradient(135deg, #3b82f6, #6366f1)';
            color  = '#ffffff';
            weight = '600';
            shadow = '0 2px 10px rgba(99,102,241,0.5)';
          } else if (isStartAwaiting) {
            bg     = 'linear-gradient(135deg, #3b82f6, #6366f1)';
            color  = '#ffffff';
            weight = '600';
            shadow = '0 0 0 3px rgba(99,102,241,0.25)';
          } else if (isToday) {
            bg     = '#eff6ff';
            color  = '#2563eb';
            border = '1.5px solid #3b82f6';
            weight = '700';
          } else if (isHov && !inRange) {
            bg = '#f3f4f6';
          }

          const ariaLabel = [
            date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
            isToday ? '(today)' : '',
            holiday ? `Holiday: ${holiday}` : '',
            isStart ? '(range start)' : '',
            isEnd   ? '(range end)'   : '',
            inRange ? '(in selected range)' : '',
          ].filter(Boolean).join(' ');

          return (
            <div
              key={`cur-${day}`}
              role="gridcell"
              className="relative flex items-center justify-center"
              style={{ height: '40px' }}
            >
              {/* Range strip */}
              {showStrip && (
                <div
                  aria-hidden
                  className="absolute pointer-events-none"
                  style={{
                    top: '5px', bottom: '5px',
                    left: stripL, right: stripR,
                    background: 'linear-gradient(135deg, #dbeafe, #e0e7ff)',
                    zIndex: 0,
                    transition: 'left 0.1s ease, right 0.1s ease',
                  }}
                />
              )}

              {/* Day button */}
              <button
                data-idx={idx}
                role="button"
                aria-label={ariaLabel}
                aria-pressed={isSelected}
                aria-current={isToday ? 'date' : undefined}
                tabIndex={isFocused || (focusedIdx === null && isToday) ? 0 : -1}
                onClick={() => onDayClick(date)}
                onMouseEnter={() => { onDayHover(date); setTooltipDay(holiday ? day : null); }}
                onMouseLeave={() => { onDayHover(null); setTooltipDay(null); }}
                onFocus={() => { setFocusedIdx(idx); onDayHover(date); }}
                onBlur={() => onDayHover(null)}
                className="relative z-10 flex items-center justify-center focus-visible:outline-none"
                style={{
                  width: '32px', height: '32px',
                  borderRadius: '50%',
                  background: bg,
                  color,
                  border: isFocused && !isSelected
                    ? '2px solid #6366f1'
                    : border,
                  fontWeight: weight,
                  fontSize: '12.5px',
                  boxShadow: shadow,
                  cursor: 'pointer',
                  transition: 'transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease',
                  transform: isHov && !isSelected ? 'scale(1.15)' : 'scale(1)',
                  opacity: past && !isSelected && !isToday ? 0.45 : 1,
                }}
              >
                {day}
              </button>

              {/* Holiday dot */}
              {holiday && (
                <div
                  aria-hidden
                  className="absolute z-20"
                  style={{ bottom: '3px', left: '50%', transform: 'translateX(-50%)' }}
                >
                  <div style={{
                    width: '4px', height: '4px', borderRadius: '50%',
                    background: isSelected ? 'rgba(255,255,255,0.7)' : '#f97316',
                  }} />
                </div>
              )}

              {/* Today dot */}
              {isToday && !isSelected && (
                <div aria-hidden style={{
                  position: 'absolute', bottom: '3px', left: '50%',
                  transform: 'translateX(-50%)',
                  width: '4px', height: '4px', borderRadius: '50%',
                  background: '#3b82f6', zIndex: 20,
                }} />
              )}

              {/* Holiday tooltip */}
              {tooltipDay === day && holiday && (
                <HolidayTooltip name={holiday} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
