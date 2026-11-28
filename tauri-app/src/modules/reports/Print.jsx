import React from "react";

/**
 * Dedicated A4 print-only stationery for Tauri (Linux WebKitGTK).
 * Uses 100vw x 100vh for edge-to-edge letterhead lock (zero top gap, full footer)
 * and 188mm zoomed content area padded safely below the header wave.
 */
export default function Print({ children, title = "PIASS College of Nursing" }) {
  return (
    <>
      <style>{`
        #piass-print-root {
          display: none;
        }

        @page {
          size: A4 portrait;
          margin: 0mm;
        }

        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          /* Keep DOM intact for WebKitGTK, just hide visually */
          body * {
            visibility: hidden !important;
          }

          #piass-print-root,
          #piass-print-root * {
            visibility: visible !important;
          }

          #piass-print-root {
            display: block !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #172033 !important;
            z-index: 99999 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Full-Page PIASS Letterhead Image locked edge-to-edge */
          #piass-print-root .piass-letterhead-bg {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            object-fit: fill !important;
            z-index: 1 !important;
            pointer-events: none !important;
          }

          /* Report Content padded safely below header wave & scaled to fit A4 width */
          #piass-print-root .piass-print-body {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            z-index: 10 !important;
            box-sizing: border-box !important;
            width: 188mm !important;
            max-width: 188mm !important;
            margin: 0 0 0 11mm !important;
            padding: 21% 0 12% 0 !important;
            zoom: 0.78;
          }

          #piass-print-root .piass-print-body * {
            max-width: 100% !important;
            box-sizing: border-box !important;
          }

          #piass-print-root .piass-print-body table {
            width: 100% !important;
            border-collapse: collapse !important;
            background: rgba(255, 255, 255, 0.9) !important;
          }

          #piass-print-root .print-hidden {
            display: none !important;
          }
        }
      `}</style>

      <section id="piass-print-root" aria-label={`${title} A4 print layout`}>
        <img
          src="/piass-letterhead.png"
          onError={(e) => {
            if (!e.currentTarget.dataset.triedJpg) {
              e.currentTarget.dataset.triedJpg = "1";
              e.currentTarget.src = "/piass-letterhead.jpg";
            } else if (!e.currentTarget.dataset.triedJpeg) {
              e.currentTarget.dataset.triedJpeg = "1";
              e.currentTarget.src = "/piass-letterhead.jpeg";
            }
          }}
          alt="PIASS Official Letterhead"
          className="piass-letterhead-bg"
        />

        <div className="piass-print-body">{children}</div>
      </section>
    </>
  );
}
