export default function SpiralBinding() {
  const COUNT = 18;
  const VW    = 700;
  const PAD   = 24;
  const STEP  = (VW - PAD * 2) / (COUNT - 1);

  const CW    = 11;
  const CH    = 9;
  const CY    = 14;
  const H     = CY + CH + 8;

  const WIRE_FRONT = '#b0bec5';
  const WIRE_MID   = '#78909c';
  const WIRE_BACK  = '#455a64';
  const WIRE_SHINE = '#eceff1';

  // FIX 1 — vary spacing itself, not just centre offset
  const jitter  = (i) => ((i * 7 + 3) % 5 - 2) * 0.4;
  const centres = Array.from({ length: COUNT }, (_, i) => {
    const base = PAD + i * STEP;
    return base + jitter(i) * 0.8;
  });

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        top: -(CY - CH / 2 + 2),
        left: 0, right: 0,
        height: H,
        zIndex: 30,
        pointerEvents: 'none',
      }}
    >
      <svg
        width="100%"
        height={H}
        viewBox={`0 0 ${VW} ${H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* FIX 3 — diagonal gradient for metallic realism */}
          <linearGradient id="frontGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor={WIRE_SHINE} />
            <stop offset="30%"  stopColor={WIRE_FRONT} />
            <stop offset="70%"  stopColor={WIRE_MID}   />
            <stop offset="100%" stopColor={WIRE_FRONT} />
          </linearGradient>

          <linearGradient id="edgeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          <filter id="shadowBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>

        {/* Paper top edge */}
        <rect x="0" y={CY - 3} width={VW} height="6" fill="url(#edgeGrad)" />
        <line x1="0" y1={CY - 3} x2={VW} y2={CY - 3} stroke="rgba(0,0,0,0.07)" strokeWidth="1" />

        {centres.map((cx, i) => {
          // FIX 4 — perspective scale: coils near edges appear slightly smaller
          const scale = 1 - (Math.abs(i - COUNT / 2) / COUNT) * 0.05;
          const tilt  = i % 2 === 0 ? -7 : -9;

          return (
            <g
              key={i}
              transform={`translate(${cx},${CY}) scale(${scale}) rotate(${tilt}) translate(${-cx},${-CY})`}
            >
              {/* Blurred shadow */}
              <ellipse
                cx={cx + 1.5} cy={CY + 2}
                rx={CW} ry={CH * 0.32}
                fill="rgba(0,0,0,0.18)"
                filter="url(#shadowBlur)"
              />

              {/* Back arc */}
              <path
                d={`M ${cx} ${CY - CH}
                    C ${cx + CW * 1.4} ${CY - CH}
                      ${cx + CW * 1.4} ${CY + CH}
                    ${cx} ${CY + CH}`}
                fill="none"
                stroke={WIRE_BACK}
                strokeWidth="2.2"
                strokeLinecap="round"
                opacity="0.55"
              />

              {/* FIX 2 — paper occlusion: off-white + shadow line */}
              <rect
                x={cx - CW * 0.5} y={CY - 4}
                width={CW} height="8"
                fill="#f8fafc"
              />
              <line
                x1={cx - CW * 0.5} y1={CY + 3}
                x2={cx + CW * 0.5} y2={CY + 3}
                stroke="rgba(0,0,0,0.08)" strokeWidth="0.5"
              />

              {/* Front arc — outer metallic stroke */}
              <path
                d={`M ${cx} ${CY - CH}
                    C ${cx - CW * 1.4} ${CY - CH}
                      ${cx - CW * 1.4} ${CY + CH}
                    ${cx} ${CY + CH}`}
                fill="none"
                stroke="url(#frontGrad)"
                strokeWidth="2.8"
                strokeLinecap="round"
              />

              {/* Inner depth stroke — wire thickness illusion */}
              <path
                d={`M ${cx} ${CY - CH}
                    C ${cx - CW * 1.4} ${CY - CH}
                      ${cx - CW * 1.4} ${CY + CH}
                    ${cx} ${CY + CH}`}
                fill="none"
                stroke="#37474f"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.45"
              />

              {/* Top crossing wire */}
              <line
                x1={cx - CW * 0.45} y1={CY - CH + 0.5}
                x2={cx + CW * 0.45} y2={CY - CH + 0.5}
                stroke={WIRE_FRONT} strokeWidth="2.4" strokeLinecap="round"
              />

              {/* Bottom crossing wire */}
              <line
                x1={cx - CW * 0.45} y1={CY + CH - 0.5}
                x2={cx + CW * 0.45} y2={CY + CH - 0.5}
                stroke={WIRE_FRONT} strokeWidth="2.4" strokeLinecap="round"
              />

              {/* Specular shine */}
              <path
                d={`M ${cx - 1} ${CY - CH + 1}
                    C ${cx - CW * 0.9} ${CY - CH + 1}
                      ${cx - CW * 1.1} ${CY - 2}
                    ${cx - 1} ${CY}`}
                fill="none"
                stroke={WIRE_SHINE}
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.65"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
