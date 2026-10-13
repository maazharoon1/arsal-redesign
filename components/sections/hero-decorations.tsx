export function HeroDecorations() {
  return (
    <div className="hero-decoration" aria-hidden="true">
      <svg
        className="hero-ribbons"
        viewBox="0 0 1400 940"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <defs>
          <linearGradient id="hero-ribbon" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#684c90" stopOpacity=".5" />
            <stop offset=".5" stopColor="#322741" stopOpacity=".35" />
            <stop offset="1" stopColor="#0e0c1b" />
          </linearGradient>
          <linearGradient id="hero-ribbon-light" x1="0" y1="1" x2="1" y2="0">
            <stop stopColor="#21182f" />
            <stop offset=".75" stopColor="#5b407f" stopOpacity=".55" />
            <stop offset="1" stopColor="#ad83e1" stopOpacity=".5" />
          </linearGradient>
        </defs>
        <path
          d="M-200 -100 H950 C700 180 390 380 -200 350Z"
          fill="url(#hero-ribbon)"
        />
        <path
          d="M-200 140 C420 460 720 300 1550 -120 L1550 200 C980 490 590 710 -200 360Z"
          fill="url(#hero-ribbon)"
        />
        <path
          d="M-100 940 C310 420 680 650 1500 330 L1500 550 C850 850 540 560 -100 1060Z"
          fill="url(#hero-ribbon-light)"
        />
        <path
          d="M-150 780 C600 520 800 1190 1500 650 L1500 920 C810 1280 250 820 -150 1020Z"
          fill="url(#hero-ribbon-light)"
        />
      </svg>
      <svg
        className="hero-curves"
        viewBox="0 0 1400 940"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <linearGradient id="hero-line" x1="0" x2="1">
            <stop stopColor="#c8a0ff" stopOpacity=".1" />
            <stop offset=".5" stopColor="#c8a0ff" stopOpacity=".75" />
            <stop offset="1" stopColor="#a784dc" stopOpacity=".25" />
          </linearGradient>
        </defs>
        <g fill="none" stroke="url(#hero-line)" strokeWidth=".85">
          {Array.from({ length: 24 }, (_, index) => (
            <path
              key={`upper-${index}`}
              d={`M620 ${420 + index * 7} C820 ${90 + index * 12} 1070 ${60 + index * 8} 1490 ${120 + index * 8}`}
            />
          ))}
          {Array.from({ length: 28 }, (_, index) => (
            <path
              key={`lower-${index}`}
              d={`M-100 ${790 + index * 5} C250 ${450 + index * 9} 720 ${1110 - index * 4} 1030 ${640 + index * 5} S1320 ${520 + index * 3} 1500 ${570 + index * 5}`}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
