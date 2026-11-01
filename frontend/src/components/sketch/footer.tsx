'use client';

import React from 'react';
import Link from 'next/link';
import { Globe } from 'lucide-react';
import { WavyDivider, SquiggleUnderline } from './doodles';

export function SketchFooter() {
  return (
    <footer className="relative bg-[#FAFAF5] pt-12 pb-14 overflow-hidden">
      {/* Wavy hand-drawn line on top */}
      <div className="absolute top-0 inset-x-0 overflow-hidden leading-none text-[#111111]">
        <WavyDivider className="w-full h-6" />
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-8 pt-6 flex flex-col items-center text-center">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-[#FFEB00] border-2 border-[#111111] shadow-[2px_2px_0_#111111] flex items-center justify-center font-marker text-xs">
            ⚡
          </div>
          <span className="font-marker text-2xl text-[#111111]">Jobless Hunter</span>
        </div>

        {/* Squiggle underline */}
        <div className="w-48 mb-4">
          <SquiggleUnderline className="w-full h-4 text-[#FFEB00]" />
        </div>

        {/* Short Tagline with real candidate details */}
        <p className="font-hand text-lg md:text-xl text-[#6B6B66] max-w-lg mb-6">
          24/7 Autonomous AI Job Application Agent built for{' '}
          <span className="font-bold text-[#111111]">Solayman El Mouden</span>.
          Containerized, truthful, and self-hosted on Ubuntu 24.04 VPS.
        </p>

        {/* Circular icon buttons for socials */}
        <div className="flex items-center gap-4 mb-8">
          {/* GitHub SVG */}
          <a
            href="https://github.com/solacode-SC"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub Profile"
            className="w-11 h-11 rounded-full bg-[#FFFFFF] border-2 border-[#111111] shadow-[3px_3px_0_#111111] flex items-center justify-center hover:-translate-y-1 hover:bg-[#FFEB00] transition-all"
          >
            <svg
              className="w-5 h-5 text-[#111111]"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </a>

          {/* LinkedIn SVG */}
          <a
            href="https://www.linkedin.com/in/solayman-elmouden/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn Profile"
            className="w-11 h-11 rounded-full bg-[#FFFFFF] border-2 border-[#111111] shadow-[3px_3px_0_#111111] flex items-center justify-center hover:-translate-y-1 hover:bg-[#FFEB00] transition-all"
          >
            <svg
              className="w-5 h-5 text-[#111111]"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.62 1.62 0 1 0 0-3.24 1.62 1.62 0 0 0 0 3.24m1.39 9.74v-8.37H5.07v8.37h2.78z" />
            </svg>
          </a>

          {/* Website / Portfolio */}
          <a
            href="https://solaymanbuilds.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Portfolio Website"
            className="w-11 h-11 rounded-full bg-[#FFFFFF] border-2 border-[#111111] shadow-[3px_3px_0_#111111] flex items-center justify-center hover:-translate-y-1 hover:bg-[#FFEB00] transition-all"
          >
            <Globe className="w-5 h-5 text-[#111111]" />
          </a>
        </div>

        {/* Bottom copyright & navigation notes */}
        <div className="pt-6 border-t border-dashed border-[#111111]/30 w-full flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#6B6B66] gap-3">
          <p>© {new Date().getFullYear()} Solayman El Mouden • All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-[#111111] underline">
              Dashboard
            </Link>
            <Link href="/jobs" className="hover:text-[#111111] underline">
              Discovered Jobs
            </Link>
            <Link href="/applications" className="hover:text-[#111111] underline">
              Pipeline
            </Link>
            <Link href="/profile" className="hover:text-[#111111] underline">
              Profile
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
