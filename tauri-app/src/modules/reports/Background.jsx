import React from 'react';

export default function Background({ children }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#faf5e6]">

      {/* TOP HEADER */}
      <header className="relative h-[135px] w-full shrink-0 overflow-hidden bg-[#062b55]">

        <div className="relative z-10 flex items-center justify-between px-6 pt-3">

          {/* Left Logo */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#d9ad35] bg-[#faf5e6] p-1.5 shadow-lg">
            <img
              src="/piass-logo.jpeg"
              className="h-full w-full object-contain mix-blend-multiply"
              alt="PIASS Logo"
            />
          </div>

          {/* Center Large Royal Title */}
          <div className="text-center">
            <h1
              className="bg-gradient-to-r from-[#fef08a] via-[#facc15] to-[#eab308] bg-clip-text text-3xl font-black uppercase tracking-wider text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)] md:text-4xl"
            >
              PIASS College
            </h1>
            <p className="mt-0.5 font-serif text-xl font-semibold italic tracking-wide text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] md:text-2xl">
              of Nursing <span className="not-italic font-bold text-[#fde047]">Kasur</span>
            </p>
          </div>

          {/* Empty Spacer (keeps title dead-center) */}
          <div className="h-20 w-20 shrink-0" />
        </div>

        {/* TOP GREEN & GOLD WAVE */}
        <svg
          className="absolute bottom-[-2px] left-0 w-full"
          viewBox="0 0 800 90"
          preserveAspectRatio="none"
        >
          <path
            d="M0 10 Q200 85 400 45 T800 25 L800 90 L0 90Z"
            fill="#078343"
          />
          <path
            d="M0 25 Q200 100 400 60 T800 40"
            fill="none"
            stroke="#d9ad35"
            strokeWidth="5"
          />
        </svg>
      </header>

      {/* CENTER DOTTED BODY + EXTRA LARGE WATERMARK */}
      <main
        className="relative flex-1 overflow-y-auto bg-[#faf5e6] p-4"
        style={{
          backgroundImage: 'radial-gradient(#cfc5a5 1.15px, transparent 1.15px)',
          backgroundSize: '18px 18px',
        }}
      >
        {/* Extra Large Watermark Logo (Fixed Center) */}
        <div className="pointer-events-none sticky top-1/2 z-0 flex h-0 w-full -translate-y-1/2 items-center justify-center">
          <img
            src="/piass-logo.jpeg"
            alt="PIASS College Watermark"
            className="h-[580px] w-[580px] max-h-[80vh] max-w-[90%] select-none object-contain opacity-[0.14] mix-blend-multiply"
          />
        </div>

        {/* Report Content Wrapper */}
        <div className="relative z-10 w-full">
          {children}
        </div>
      </main>

      {/* BOTTOM FOOTER */}
      <footer className="w-full shrink-0 bg-[#062b55]">

        <div className="h-2.5 bg-emerald-700" />
        <div className="h-1 bg-[#d9ad35]" />

        <div className="grid grid-cols-3 gap-4 px-6 py-4 text-white">

          <div>
            <p className="text-xs font-bold text-[#fde047]">CONTACT</p>
            <p className="mt-1 text-[11px]">
              +92 304 1448481
            </p>
            <p className="text-[11px]">
              +92 335 6665500
            </p>
          </div>

          <div>
            <p className="text-xs font-bold text-[#fde047]">ADDRESS</p>
            <p className="mt-1 text-[11px]">
              Main Ferozpur Road,
            </p>
            <p className="text-[11px]">
              Opposite New Bus Terminal Kasur
            </p>
          </div>

          <div>
            <p className="text-xs font-bold text-[#fde047]">ONLINE</p>
            <p className="mt-1 text-[11px]">
              www.piass.edu.pk
            </p>
            <p className="text-[11px]">
              piasskasur@gmail.com
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}