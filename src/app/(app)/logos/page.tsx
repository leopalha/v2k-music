"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Download, Copy } from "lucide-react";
import { Button } from "@/components/ui";
import { toast } from "@/components/ui/use-toast";

type LogoVariant = {
  id: string;
  name: string;
  description: string;
  component: React.ReactNode;
  svg: string;
  isImage?: boolean;
};

export default function LogosPage() {
  const [selectedLogo, setSelectedLogo] = useState<string>("brain-neon-circuit");

  const logos: LogoVariant[] = [
    {
      id: "brain-photo-1",
      name: "Brain Neon Photo 1",
      description: "Imagem real do cérebro neon (Brain 1)",
      isImage: true,
      svg: "",
      component: (
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20 flex-shrink-0">
            <Image
              src="/logos/brain-neon-1.png"
              alt="Brain Neon 1"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-extrabold font-jakarta text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 tracking-tight">
              V2K
            </span>
            <span className="text-[9px] font-inter font-normal text-text-tertiary" style={{ letterSpacing: '0.68em' }}>MUSIC</span>
          </div>
        </div>
      ),
    },
    {
      id: "brain-photo-2",
      name: "Brain Neon Photo 2",
      description: "Imagem real do cérebro neon (Brain 2)",
      isImage: true,
      svg: "",
      component: (
        <div className="flex items-center gap-3">
          <div className="relative w-32 h-32 flex-shrink-0">
            <Image
              src="/logos/brain-neon-2.png"
              alt="Brain Neon 2"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-extrabold font-jakarta text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 tracking-tight">
              V2K
            </span>
            <span className="text-[9px] font-inter font-normal text-text-tertiary" style={{ letterSpacing: '0.68em' }}>MUSIC</span>
          </div>
        </div>
      ),
    },
    {
      id: "brain-neon-circuit",
      name: "Brain Neon Circuit",
      description: "Cérebro estilo neon com circuitos neurais (Referência 1)",
      svg: `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="brainGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1A89FF;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#8C1AFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF1AA3;stop-opacity:1" />
    </linearGradient>
  </defs>
  <!-- Neural Circuit Brain -->
  <g transform="translate(7, 5) scale(1.3)">
    <!-- Brain Outline - Left Hemisphere -->
    <path d="M 18,26 C 18,20 20,14 23,11 C 25,9 27,8 29,8 C 30,8 31,8.5 32,9.5
             C 32.5,11 33,13 33,15 L 33,37 C 33,40 32,42 30,43.5
             C 28,45 25,45.5 22,44 C 19,42.5 17,39 17,35 C 16.5,32 17,28 18,26 Z"
          fill="none" stroke="url(#brainGrad1)" stroke-width="2" opacity="0.9"/>

    <!-- Brain Outline - Right Hemisphere -->
    <path d="M 33,15 C 33.5,13 34,11 35,9.5 C 36,8.5 37,8 38,8
             C 40,8 42,9 44,11 C 47,14 49,20 49,26 C 50,28 50.5,32 50,35
             C 50,39 48,42.5 45,44 C 42,45.5 39,45 37,43.5
             C 35,42 34,40 34,37 L 33,15 Z"
          fill="none" stroke="url(#brainGrad1)" stroke-width="2" opacity="0.9"/>

    <!-- Center Division Line -->
    <line x1="33" y1="12" x2="33" y2="42" stroke="url(#brainGrad1)" stroke-width="1.5" opacity="0.7"/>

    <!-- Neural Circuit Lines - Left Side -->
    <line x1="33" y1="26" x2="22" y2="15" stroke="#FF1AA3" stroke-width="1.5" opacity="0.8"/>
    <line x1="33" y1="26" x2="20" y2="26" stroke="#8C1AFF" stroke-width="1.5" opacity="0.8"/>
    <line x1="33" y1="26" x2="22" y2="37" stroke="#1A89FF" stroke-width="1.5" opacity="0.8"/>
    <line x1="33" y1="26" x2="25" y2="20" stroke="#8C1AFF" stroke-width="1.2" opacity="0.6"/>
    <line x1="33" y1="26" x2="25" y2="32" stroke="#FF1AA3" stroke-width="1.2" opacity="0.6"/>

    <!-- Neural Circuit Lines - Right Side -->
    <line x1="33" y1="26" x2="44" y2="15" stroke="#FF1AA3" stroke-width="1.5" opacity="0.8"/>
    <line x1="33" y1="26" x2="46" y2="26" stroke="#8C1AFF" stroke-width="1.5" opacity="0.8"/>
    <line x1="33" y1="26" x2="44" y2="37" stroke="#1A89FF" stroke-width="1.5" opacity="0.8"/>
    <line x1="33" y1="26" x2="41" y2="20" stroke="#8C1AFF" stroke-width="1.2" opacity="0.6"/>
    <line x1="33" y1="26" x2="41" y2="32" stroke="#FF1AA3" stroke-width="1.2" opacity="0.6"/>

    <!-- Neural Nodes - Left Side -->
    <circle cx="22" cy="15" r="2.5" fill="#FF1AA3" opacity="0.9"/>
    <circle cx="20" cy="26" r="2.5" fill="#8C1AFF" opacity="0.9"/>
    <circle cx="22" cy="37" r="2.5" fill="#1A89FF" opacity="0.9"/>
    <circle cx="25" cy="20" r="2" fill="#8C1AFF" opacity="0.7"/>
    <circle cx="25" cy="32" r="2" fill="#FF1AA3" opacity="0.7"/>

    <!-- Neural Nodes - Right Side -->
    <circle cx="44" cy="15" r="2.5" fill="#FF1AA3" opacity="0.9"/>
    <circle cx="46" cy="26" r="2.5" fill="#8C1AFF" opacity="0.9"/>
    <circle cx="44" cy="37" r="2.5" fill="#1A89FF" opacity="0.9"/>
    <circle cx="41" cy="20" r="2" fill="#8C1AFF" opacity="0.7"/>
    <circle cx="41" cy="32" r="2" fill="#FF1AA3" opacity="0.7"/>

    <!-- Center Core Node -->
    <circle cx="33" cy="26" r="3" fill="#8C1AFF" opacity="1"/>
    <circle cx="33" cy="26" r="1.5" fill="#FF1AA3" opacity="1"/>
  </g>
  <!-- V2K Text -->
  <text x="115" y="42" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="32" font-weight="800" fill="url(#brainGrad1)">V2K</text>
  <text x="79" y="57" text-anchor="start" font-family="Inter, sans-serif" font-size="9" font-weight="400" fill="#737373" letter-spacing="10.5">MUSIC</text>
</svg>`,
      component: (
        <svg viewBox="0 0 200 80" className="w-full h-20">
          <defs>
            <linearGradient id="brainGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#1A89FF", stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: "#8C1AFF", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#FF1AA3", stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <g transform="translate(7, 5) scale(1.3)">
            <path d="M 18,26 C 18,20 20,14 23,11 C 25,9 27,8 29,8 C 30,8 31,8.5 32,9.5
                     C 32.5,11 33,13 33,15 L 33,37 C 33,40 32,42 30,43.5
                     C 28,45 25,45.5 22,44 C 19,42.5 17,39 17,35 C 16.5,32 17,28 18,26 Z"
                  fill="none" stroke="url(#brainGrad1)" strokeWidth="2" opacity="0.9"/>
            <path d="M 33,15 C 33.5,13 34,11 35,9.5 C 36,8.5 37,8 38,8
                     C 40,8 42,9 44,11 C 47,14 49,20 49,26 C 50,28 50.5,32 50,35
                     C 50,39 48,42.5 45,44 C 42,45.5 39,45 37,43.5
                     C 35,42 34,40 34,37 L 33,15 Z"
                  fill="none" stroke="url(#brainGrad1)" strokeWidth="2" opacity="0.9"/>
            <line x1="33" y1="12" x2="33" y2="42" stroke="url(#brainGrad1)" strokeWidth="1.5" opacity="0.7"/>
            <line x1="33" y1="26" x2="22" y2="15" stroke="#FF1AA3" strokeWidth="1.5" opacity="0.8"/>
            <line x1="33" y1="26" x2="20" y2="26" stroke="#8C1AFF" strokeWidth="1.5" opacity="0.8"/>
            <line x1="33" y1="26" x2="22" y2="37" stroke="#1A89FF" strokeWidth="1.5" opacity="0.8"/>
            <line x1="33" y1="26" x2="25" y2="20" stroke="#8C1AFF" strokeWidth="1.2" opacity="0.6"/>
            <line x1="33" y1="26" x2="25" y2="32" stroke="#FF1AA3" strokeWidth="1.2" opacity="0.6"/>
            <line x1="33" y1="26" x2="44" y2="15" stroke="#FF1AA3" strokeWidth="1.5" opacity="0.8"/>
            <line x1="33" y1="26" x2="46" y2="26" stroke="#8C1AFF" strokeWidth="1.5" opacity="0.8"/>
            <line x1="33" y1="26" x2="44" y2="37" stroke="#1A89FF" strokeWidth="1.5" opacity="0.8"/>
            <line x1="33" y1="26" x2="41" y2="20" stroke="#8C1AFF" strokeWidth="1.2" opacity="0.6"/>
            <line x1="33" y1="26" x2="41" y2="32" stroke="#FF1AA3" strokeWidth="1.2" opacity="0.6"/>
            <circle cx="22" cy="15" r="2.5" fill="#FF1AA3" opacity="0.9"/>
            <circle cx="20" cy="26" r="2.5" fill="#8C1AFF" opacity="0.9"/>
            <circle cx="22" cy="37" r="2.5" fill="#1A89FF" opacity="0.9"/>
            <circle cx="25" cy="20" r="2" fill="#8C1AFF" opacity="0.7"/>
            <circle cx="25" cy="32" r="2" fill="#FF1AA3" opacity="0.7"/>
            <circle cx="44" cy="15" r="2.5" fill="#FF1AA3" opacity="0.9"/>
            <circle cx="46" cy="26" r="2.5" fill="#8C1AFF" opacity="0.9"/>
            <circle cx="44" cy="37" r="2.5" fill="#1A89FF" opacity="0.9"/>
            <circle cx="41" cy="20" r="2" fill="#8C1AFF" opacity="0.7"/>
            <circle cx="41" cy="32" r="2" fill="#FF1AA3" opacity="0.7"/>
            <circle cx="33" cy="26" r="3" fill="#8C1AFF" opacity="1"/>
            <circle cx="33" cy="26" r="1.5" fill="#FF1AA3" opacity="1"/>
          </g>
          <text x="115" y="42" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="32" fontWeight="800" fill="url(#brainGrad1)">V2K</text>
          <text x="79" y="57" textAnchor="start" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="400" fill="#737373" letterSpacing="10.5">MUSIC</text>
        </svg>
      ),
    },
    {
      id: "brain-neon-variant1",
      name: "Brain Neon Circuit V2",
      description: "Variação com gradiente Pink/Purple dominante",
      svg: `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="neonVar1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#FF1AA3;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8C1AFF;stop-opacity:1" />
    </linearGradient>
  </defs>
  <g transform="translate(7, 5) scale(1.3)">
    <path d="M 18,26 C 18,20 20,14 23,11 C 25,9 27,8 29,8 C 30,8 31,8.5 32,9.5
             C 32.5,11 33,13 33,15 L 33,37 C 33,40 32,42 30,43.5
             C 28,45 25,45.5 22,44 C 19,42.5 17,39 17,35 C 16.5,32 17,28 18,26 Z"
          fill="none" stroke="url(#neonVar1)" stroke-width="2.5" opacity="1"/>
    <path d="M 33,15 C 33.5,13 34,11 35,9.5 C 36,8.5 37,8 38,8
             C 40,8 42,9 44,11 C 47,14 49,20 49,26 C 50,28 50.5,32 50,35
             C 50,39 48,42.5 45,44 C 42,45.5 39,45 37,43.5
             C 35,42 34,40 34,37 L 33,15 Z"
          fill="none" stroke="url(#neonVar1)" stroke-width="2.5" opacity="1"/>
    <line x1="33" y1="12" x2="33" y2="42" stroke="#FF1AA3" stroke-width="2" opacity="1"/>
    <line x1="33" y1="26" x2="22" y2="15" stroke="#FF1AA3" stroke-width="2" opacity="1"/>
    <line x1="33" y1="26" x2="20" y2="26" stroke="#8C1AFF" stroke-width="2" opacity="1"/>
    <line x1="33" y1="26" x2="22" y2="37" stroke="#8C1AFF" stroke-width="2" opacity="1"/>
    <line x1="33" y1="26" x2="44" y2="15" stroke="#FF1AA3" stroke-width="2" opacity="1"/>
    <line x1="33" y1="26" x2="46" y2="26" stroke="#8C1AFF" stroke-width="2" opacity="1"/>
    <line x1="33" y1="26" x2="44" y2="37" stroke="#8C1AFF" stroke-width="2" opacity="1"/>
    <circle cx="22" cy="15" r="3" fill="#FF1AA3" opacity="1"/>
    <circle cx="20" cy="26" r="3" fill="#8C1AFF" opacity="1"/>
    <circle cx="22" cy="37" r="3" fill="#8C1AFF" opacity="1"/>
    <circle cx="44" cy="15" r="3" fill="#FF1AA3" opacity="1"/>
    <circle cx="46" cy="26" r="3" fill="#8C1AFF" opacity="1"/>
    <circle cx="44" cy="37" r="3" fill="#8C1AFF" opacity="1"/>
    <circle cx="33" cy="26" r="4" fill="#FF1AA3" opacity="1"/>
  </g>
  <text x="115" y="42" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="32" font-weight="800" fill="url(#neonVar1)">V2K</text>

  <text x="79" y="57" text-anchor="start" font-family="Inter, sans-serif" font-size="9" font-weight="400" fill="#737373" letter-spacing="10.5">MUSIC</text>
</svg>`,
      component: (
        <svg viewBox="0 0 200 80" className="w-full h-20">
          <defs>
            <linearGradient id="neonVar1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#FF1AA3", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#8C1AFF", stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <g transform="translate(7, 5) scale(1.3)">
            <path d="M 18,26 C 18,20 20,14 23,11 C 25,9 27,8 29,8 C 30,8 31,8.5 32,9.5
                     C 32.5,11 33,13 33,15 L 33,37 C 33,40 32,42 30,43.5
                     C 28,45 25,45.5 22,44 C 19,42.5 17,39 17,35 C 16.5,32 17,28 18,26 Z"
                  fill="none" stroke="url(#neonVar1)" strokeWidth="2.5" opacity="1"/>
            <path d="M 33,15 C 33.5,13 34,11 35,9.5 C 36,8.5 37,8 38,8
                     C 40,8 42,9 44,11 C 47,14 49,20 49,26 C 50,28 50.5,32 50,35
                     C 50,39 48,42.5 45,44 C 42,45.5 39,45 37,43.5
                     C 35,42 34,40 34,37 L 33,15 Z"
                  fill="none" stroke="url(#neonVar1)" strokeWidth="2.5" opacity="1"/>
            <line x1="33" y1="12" x2="33" y2="42" stroke="#FF1AA3" strokeWidth="2" opacity="1"/>
            <line x1="33" y1="26" x2="22" y2="15" stroke="#FF1AA3" strokeWidth="2" opacity="1"/>
            <line x1="33" y1="26" x2="20" y2="26" stroke="#8C1AFF" strokeWidth="2" opacity="1"/>
            <line x1="33" y1="26" x2="22" y2="37" stroke="#8C1AFF" strokeWidth="2" opacity="1"/>
            <line x1="33" y1="26" x2="44" y2="15" stroke="#FF1AA3" strokeWidth="2" opacity="1"/>
            <line x1="33" y1="26" x2="46" y2="26" stroke="#8C1AFF" strokeWidth="2" opacity="1"/>
            <line x1="33" y1="26" x2="44" y2="37" stroke="#8C1AFF" strokeWidth="2" opacity="1"/>
            <circle cx="22" cy="15" r="3" fill="#FF1AA3" opacity="1"/>
            <circle cx="20" cy="26" r="3" fill="#8C1AFF" opacity="1"/>
            <circle cx="22" cy="37" r="3" fill="#8C1AFF" opacity="1"/>
            <circle cx="44" cy="15" r="3" fill="#FF1AA3" opacity="1"/>
            <circle cx="46" cy="26" r="3" fill="#8C1AFF" opacity="1"/>
            <circle cx="44" cy="37" r="3" fill="#8C1AFF" opacity="1"/>
            <circle cx="33" cy="26" r="4" fill="#FF1AA3" opacity="1"/>
          </g>
          <text x="115" y="42" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="32" fontWeight="800" fill="url(#neonVar1)">V2K</text>
          <text x="79" y="57" textAnchor="start" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="400" fill="#737373" letterSpacing="10.5">MUSIC</text>
        </svg>
      ),
    },
    {
      id: "brain-neon-variant2",
      name: "Brain Neon Circuit V3",
      description: "Variação com gradiente Purple/Blue frio",
      svg: `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="neonVar2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#8C1AFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1A89FF;stop-opacity:1" />
    </linearGradient>
  </defs>
  <g transform="translate(7, 5) scale(1.3)">
    <path d="M 18,26 C 18,20 20,14 23,11 C 25,9 27,8 29,8 C 30,8 31,8.5 32,9.5
             C 32.5,11 33,13 33,15 L 33,37 C 33,40 32,42 30,43.5
             C 28,45 25,45.5 22,44 C 19,42.5 17,39 17,35 C 16.5,32 17,28 18,26 Z"
          fill="none" stroke="url(#neonVar2)" stroke-width="2.5" opacity="1"/>
    <path d="M 33,15 C 33.5,13 34,11 35,9.5 C 36,8.5 37,8 38,8
             C 40,8 42,9 44,11 C 47,14 49,20 49,26 C 50,28 50.5,32 50,35
             C 50,39 48,42.5 45,44 C 42,45.5 39,45 37,43.5
             C 35,42 34,40 34,37 L 33,15 Z"
          fill="none" stroke="url(#neonVar2)" stroke-width="2.5" opacity="1"/>
    <line x1="33" y1="12" x2="33" y2="42" stroke="#8C1AFF" stroke-width="2" opacity="1"/>
    <line x1="33" y1="26" x2="22" y2="15" stroke="#8C1AFF" stroke-width="2" opacity="1"/>
    <line x1="33" y1="26" x2="20" y2="26" stroke="#1A89FF" stroke-width="2" opacity="1"/>
    <line x1="33" y1="26" x2="22" y2="37" stroke="#1A89FF" stroke-width="2" opacity="1"/>
    <line x1="33" y1="26" x2="44" y2="15" stroke="#8C1AFF" stroke-width="2" opacity="1"/>
    <line x1="33" y1="26" x2="46" y2="26" stroke="#1A89FF" stroke-width="2" opacity="1"/>
    <line x1="33" y1="26" x2="44" y2="37" stroke="#1A89FF" stroke-width="2" opacity="1"/>
    <circle cx="22" cy="15" r="3" fill="#8C1AFF" opacity="1"/>
    <circle cx="20" cy="26" r="3" fill="#1A89FF" opacity="1"/>
    <circle cx="22" cy="37" r="3" fill="#1A89FF" opacity="1"/>
    <circle cx="44" cy="15" r="3" fill="#8C1AFF" opacity="1"/>
    <circle cx="46" cy="26" r="3" fill="#1A89FF" opacity="1"/>
    <circle cx="44" cy="37" r="3" fill="#1A89FF" opacity="1"/>
    <circle cx="33" cy="26" r="4" fill="#8C1AFF" opacity="1"/>
  </g>
  <text x="115" y="42" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="32" font-weight="800" fill="url(#neonVar2)">V2K</text>

  <text x="79" y="57" text-anchor="start" font-family="Inter, sans-serif" font-size="9" font-weight="400" fill="#737373" letter-spacing="10.5">MUSIC</text>
</svg>`,
      component: (
        <svg viewBox="0 0 200 80" className="w-full h-20">
          <defs>
            <linearGradient id="neonVar2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#8C1AFF", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#1A89FF", stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <g transform="translate(7, 5) scale(1.3)">
            <path d="M 18,26 C 18,20 20,14 23,11 C 25,9 27,8 29,8 C 30,8 31,8.5 32,9.5
                     C 32.5,11 33,13 33,15 L 33,37 C 33,40 32,42 30,43.5
                     C 28,45 25,45.5 22,44 C 19,42.5 17,39 17,35 C 16.5,32 17,28 18,26 Z"
                  fill="none" stroke="url(#neonVar2)" strokeWidth="2.5" opacity="1"/>
            <path d="M 33,15 C 33.5,13 34,11 35,9.5 C 36,8.5 37,8 38,8
                     C 40,8 42,9 44,11 C 47,14 49,20 49,26 C 50,28 50.5,32 50,35
                     C 50,39 48,42.5 45,44 C 42,45.5 39,45 37,43.5
                     C 35,42 34,40 34,37 L 33,15 Z"
                  fill="none" stroke="url(#neonVar2)" strokeWidth="2.5" opacity="1"/>
            <line x1="33" y1="12" x2="33" y2="42" stroke="#8C1AFF" strokeWidth="2" opacity="1"/>
            <line x1="33" y1="26" x2="22" y2="15" stroke="#8C1AFF" strokeWidth="2" opacity="1"/>
            <line x1="33" y1="26" x2="20" y2="26" stroke="#1A89FF" strokeWidth="2" opacity="1"/>
            <line x1="33" y1="26" x2="22" y2="37" stroke="#1A89FF" strokeWidth="2" opacity="1"/>
            <line x1="33" y1="26" x2="44" y2="15" stroke="#8C1AFF" strokeWidth="2" opacity="1"/>
            <line x1="33" y1="26" x2="46" y2="26" stroke="#1A89FF" strokeWidth="2" opacity="1"/>
            <line x1="33" y1="26" x2="44" y2="37" stroke="#1A89FF" strokeWidth="2" opacity="1"/>
            <circle cx="22" cy="15" r="3" fill="#8C1AFF" opacity="1"/>
            <circle cx="20" cy="26" r="3" fill="#1A89FF" opacity="1"/>
            <circle cx="22" cy="37" r="3" fill="#1A89FF" opacity="1"/>
            <circle cx="44" cy="15" r="3" fill="#8C1AFF" opacity="1"/>
            <circle cx="46" cy="26" r="3" fill="#1A89FF" opacity="1"/>
            <circle cx="44" cy="37" r="3" fill="#1A89FF" opacity="1"/>
            <circle cx="33" cy="26" r="4" fill="#8C1AFF" opacity="1"/>
          </g>
          <text x="115" y="42" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="32" fontWeight="800" fill="url(#neonVar2)">V2K</text>
          <text x="79" y="57" textAnchor="start" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="400" fill="#737373" letterSpacing="10.5">MUSIC</text>
        </svg>
      ),
    },
    {
      id: "brain-wave",
      name: "Brain Wave",
      description: "Cérebro com ondas sonoras",
      svg: `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1A89FF;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#8C1AFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF1AA3;stop-opacity:1" />
    </linearGradient>
  </defs>
  <g transform="translate(7, 5) scale(1.5)">
    <!-- Brain shape -->
    <circle cx="28" cy="22" r="16" fill="url(#waveGrad)" opacity="0.2"/>
    <circle cx="28" cy="22" r="12" fill="url(#waveGrad)" opacity="0.3"/>
    <!-- Sound waves -->
    <path d="M28,22 Q32,18 36,22 T44,22" fill="none" stroke="#1A89FF" stroke-width="2"/>
    <path d="M28,22 Q32,26 36,22 T44,22" fill="none" stroke="#FF1AA3" stroke-width="2"/>
    <!-- Center -->
    <circle cx="28" cy="22" r="4" fill="#8C1AFF"/>
  </g>
  <text x="115" y="42" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="32" font-weight="800" fill="url(#waveGrad)">V2K</text>

  <text x="79" y="57" text-anchor="start" font-family="Inter, sans-serif" font-size="9" font-weight="400" fill="#737373" letter-spacing="10.5">MUSIC</text>
</svg>`,
      component: (
        <svg viewBox="0 0 200 80" className="w-full h-20">
          <defs>
            <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#1A89FF", stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: "#8C1AFF", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#FF1AA3", stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <g transform="translate(7, 5) scale(1.5)">
            <circle cx="28" cy="22" r="16" fill="url(#waveGrad)" opacity="0.2"/>
            <circle cx="28" cy="22" r="12" fill="url(#waveGrad)" opacity="0.3"/>
            <path d="M28,22 Q32,18 36,22 T44,22" fill="none" stroke="#1A89FF" strokeWidth="2"/>
            <path d="M28,22 Q32,26 36,22 T44,22" fill="none" stroke="#FF1AA3" strokeWidth="2"/>
            <circle cx="28" cy="22" r="4" fill="#8C1AFF"/>
          </g>
          <text x="115" y="42" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="32" fontWeight="800" fill="url(#waveGrad)">V2K</text>
          <text x="79" y="57" textAnchor="start" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="400" fill="#737373" letterSpacing="10.5">MUSIC</text>
        </svg>
      ),
    },
    {
      id: "neural-net",
      name: "Neural Network",
      description: "Rede neural conectada",
      svg: `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(7, 5) scale(1.5)">
    <!-- Network connections -->
    <line x1="15" y1="12" x2="25" y2="22" stroke="#1A89FF" stroke-width="1.2" opacity="0.5"/>
    <line x1="35" y1="12" x2="25" y2="22" stroke="#1A89FF" stroke-width="1.2" opacity="0.5"/>
    <line x1="15" y1="32" x2="25" y2="22" stroke="#FF1AA3" stroke-width="1.2" opacity="0.5"/>
    <line x1="35" y1="32" x2="25" y2="22" stroke="#FF1AA3" stroke-width="1.2" opacity="0.5"/>
    <line x1="15" y1="12" x2="15" y2="32" stroke="#8C1AFF" stroke-width="1.2" opacity="0.4"/>
    <line x1="35" y1="12" x2="35" y2="32" stroke="#8C1AFF" stroke-width="1.2" opacity="0.4"/>
    <!-- Nodes -->
    <circle cx="15" cy="12" r="3.5" fill="#1A89FF"/>
    <circle cx="35" cy="12" r="3.5" fill="#1A89FF"/>
    <circle cx="15" cy="32" r="3.5" fill="#FF1AA3"/>
    <circle cx="35" cy="32" r="3.5" fill="#FF1AA3"/>
    <circle cx="25" cy="22" r="4.5" fill="#8C1AFF"/>
  </g>
  <text x="115" y="42" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="32" font-weight="800" fill="#E5E5E5">V2K</text>
  <text x="79" y="57" text-anchor="start" font-family="Inter, sans-serif" font-size="9" font-weight="400" fill="#737373" letter-spacing="10.5">MUSIC</text>
</svg>`,
      component: (
        <svg viewBox="0 0 200 80" className="w-full h-20">
          <g transform="translate(7, 5) scale(1.5)">
            <line x1="15" y1="12" x2="25" y2="22" stroke="#1A89FF" strokeWidth="1.2" opacity="0.5"/>
            <line x1="35" y1="12" x2="25" y2="22" stroke="#1A89FF" strokeWidth="1.2" opacity="0.5"/>
            <line x1="15" y1="32" x2="25" y2="22" stroke="#FF1AA3" strokeWidth="1.2" opacity="0.5"/>
            <line x1="35" y1="32" x2="25" y2="22" stroke="#FF1AA3" strokeWidth="1.2" opacity="0.5"/>
            <line x1="15" y1="12" x2="15" y2="32" stroke="#8C1AFF" strokeWidth="1.2" opacity="0.4"/>
            <line x1="35" y1="12" x2="35" y2="32" stroke="#8C1AFF" strokeWidth="1.2" opacity="0.4"/>
            <circle cx="15" cy="12" r="3.5" fill="#1A89FF"/>
            <circle cx="35" cy="12" r="3.5" fill="#1A89FF"/>
            <circle cx="15" cy="32" r="3.5" fill="#FF1AA3"/>
            <circle cx="35" cy="32" r="3.5" fill="#FF1AA3"/>
            <circle cx="25" cy="22" r="4.5" fill="#8C1AFF"/>
          </g>
          <text x="115" y="42" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="32" fontWeight="800" fill="#E5E5E5">V2K</text>
          <text x="79" y="57" textAnchor="start" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="400" fill="#737373" letterSpacing="10.5">MUSIC</text>
        </svg>
      ),
    },
    {
      id: "v2k-geometric",
      name: "V2K Geométrico",
      description: "Design geométrico moderno sem cérebro",
      svg: `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="geoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1A89FF;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#8C1AFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF1AA3;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="circleGrad1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#1A89FF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0D4580;stop-opacity:1" />
    </radialGradient>
    <radialGradient id="circleGrad2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#FF1AA3;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#A0115E;stop-opacity:1" />
    </radialGradient>
    <radialGradient id="circleGrad3" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#8C1AFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#5A11A0;stop-opacity:1" />
    </radialGradient>
  </defs>
  <!-- Geometric shape - 3 hexagons intersecting at center -->
  <g transform="translate(-4, -12.5) scale(1.6)">
    <!-- Top Left Hexagon -->
    <polygon points="20,18 30,18 34,25 30,32 20,32 16,25" fill="url(#geoGrad)" opacity="0.3"/>
    <polygon points="22,20 28,20 31,25 28,30 22,30 19,25" fill="url(#geoGrad)" opacity="0.6"/>
    <circle cx="25" cy="25" r="3.5" fill="url(#circleGrad1)" opacity="0.9"/>
    <circle cx="25" cy="25" r="1.5" fill="#1A89FF" opacity="1"/>

    <!-- Top Right Hexagon -->
    <polygon points="35,18 45,18 49,25 45,32 35,32 31,25" fill="url(#geoGrad)" opacity="0.3"/>
    <polygon points="37,20 43,20 46,25 43,30 37,30 34,25" fill="url(#geoGrad)" opacity="0.6"/>
    <circle cx="40" cy="25" r="3.5" fill="url(#circleGrad2)" opacity="0.9"/>
    <circle cx="40" cy="25" r="1.5" fill="#FF1AA3" opacity="1"/>

    <!-- Bottom Center Hexagon -->
    <polygon points="27,31 38,31 42,38 38,45 27,45 23,38" fill="url(#geoGrad)" opacity="0.3"/>
    <polygon points="29,33 36,33 39,38 36,43 29,43 26,38" fill="url(#geoGrad)" opacity="0.6"/>
    <circle cx="32.5" cy="38" r="3.5" fill="url(#circleGrad3)" opacity="0.9"/>
    <circle cx="32.5" cy="38" r="1.5" fill="#8C1AFF" opacity="1"/>
  </g>
  <!-- Text -->
  <text x="115" y="42" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="32" font-weight="800" fill="url(#geoGrad)">V2K</text>
  <text x="79" y="57" text-anchor="start" font-family="Inter, sans-serif" font-size="9" font-weight="400" fill="#737373" letter-spacing="10.5">MUSIC</text>
</svg>`,
      component: (
        <svg viewBox="0 0 200 80" className="w-full h-20">
          <defs>
            <linearGradient id="geoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#1A89FF", stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: "#8C1AFF", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#FF1AA3", stopOpacity: 1 }} />
            </linearGradient>
            <radialGradient id="circleGrad1React" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{ stopColor: "#1A89FF", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#0D4580", stopOpacity: 1 }} />
            </radialGradient>
            <radialGradient id="circleGrad2React" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{ stopColor: "#FF1AA3", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#A0115E", stopOpacity: 1 }} />
            </radialGradient>
            <radialGradient id="circleGrad3React" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{ stopColor: "#8C1AFF", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#5A11A0", stopOpacity: 1 }} />
            </radialGradient>
          </defs>
          <g transform="translate(-4, -12.5) scale(1.6)">
            <polygon points="20,18 30,18 34,25 30,32 20,32 16,25" fill="url(#geoGrad)" opacity="0.3"/>
            <polygon points="22,20 28,20 31,25 28,30 22,30 19,25" fill="url(#geoGrad)" opacity="0.6"/>
            <circle cx="25" cy="25" r="3.5" fill="url(#circleGrad1React)" opacity="0.9"/>
            <circle cx="25" cy="25" r="1.5" fill="#1A89FF" opacity="1"/>

            <polygon points="35,18 45,18 49,25 45,32 35,32 31,25" fill="url(#geoGrad)" opacity="0.3"/>
            <polygon points="37,20 43,20 46,25 43,30 37,30 34,25" fill="url(#geoGrad)" opacity="0.6"/>
            <circle cx="40" cy="25" r="3.5" fill="url(#circleGrad2React)" opacity="0.9"/>
            <circle cx="40" cy="25" r="1.5" fill="#FF1AA3" opacity="1"/>

            <polygon points="27,31 38,31 42,38 38,45 27,45 23,38" fill="url(#geoGrad)" opacity="0.3"/>
            <polygon points="29,33 36,33 39,38 36,43 29,43 26,38" fill="url(#geoGrad)" opacity="0.6"/>
            <circle cx="32.5" cy="38" r="3.5" fill="url(#circleGrad3React)" opacity="0.9"/>
            <circle cx="32.5" cy="38" r="1.5" fill="#8C1AFF" opacity="1"/>
          </g>
          <text x="115" y="42" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="32" fontWeight="800" fill="url(#geoGrad)">V2K</text>
          <text x="79" y="57" textAnchor="start" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="400" fill="#737373" letterSpacing="10.5">MUSIC</text>
        </svg>
      ),
    },
  ];

  const handleCopySVG = (svg: string) => {
    navigator.clipboard.writeText(svg);
    toast.success("SVG copiado!", "Código SVG copiado para a área de transferência");
  };

  const handleDownloadSVG = (svg: string, filename: string) => {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `v2k-logo-${filename}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Download iniciado!", `Logo ${filename} baixado com sucesso`);
  };

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Seleção de Logo V2K
          </h1>
          <p className="text-text-secondary">
            Escolha o logo que melhor representa a marca V2K Music
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Logo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {logos.map((logo) => (
            <div
              key={logo.id}
              className={`bg-bg-secondary rounded-xl border-2 transition-all cursor-pointer ${
                selectedLogo === logo.id
                  ? "border-primary-400 shadow-lg shadow-primary-400/20"
                  : "border-border-default hover:border-border-strong"
              }`}
              onClick={() => setSelectedLogo(logo.id)}
            >
              {/* Preview */}
              <div className="p-8 bg-bg-elevated rounded-t-xl flex items-center justify-center min-h-[160px]">
                {logo.component}
              </div>

              {/* Info */}
              <div className="p-4 border-t border-border-subtle">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary mb-1">
                      {logo.name}
                    </h3>
                    <p className="text-sm text-text-tertiary">
                      {logo.description}
                    </p>
                  </div>
                  {selectedLogo === logo.id && (
                    <div className="w-6 h-6 rounded-full bg-primary-400 flex items-center justify-center flex-shrink-0 ml-3">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!logo.isImage && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopySVG(logo.svg);
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      SVG
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadSVG(logo.svg, logo.id);
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
                {logo.isImage && (
                  <div className="mt-4">
                    <p className="text-xs text-text-tertiary text-center">
                      Logo baseado em imagem PNG
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Logo Preview */}
        <div className="mt-12 bg-bg-secondary rounded-xl border border-border-default p-8">
          <h2 className="text-xl font-semibold text-text-primary mb-6">
            Logo Selecionado: {logos.find((l) => l.id === selectedLogo)?.name}
          </h2>

          {/* Large Preview */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Light Background */}
            <div className="bg-white rounded-xl p-8 flex items-center justify-center min-h-[200px]">
              <div className="w-full max-w-sm">
                {logos.find((l) => l.id === selectedLogo)?.component}
              </div>
            </div>

            {/* Dark Background */}
            <div className="bg-black rounded-xl p-8 flex items-center justify-center min-h-[200px]">
              <div className="w-full max-w-sm">
                {logos.find((l) => l.id === selectedLogo)?.component}
              </div>
            </div>
          </div>

          {/* Usage Examples */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="bg-bg-elevated rounded-lg p-4">
              <p className="text-xs text-text-tertiary mb-3">Navbar</p>
              <div className="h-12 flex items-center">
                <div className="w-32">
                  {logos.find((l) => l.id === selectedLogo)?.component}
                </div>
              </div>
            </div>

            <div className="bg-bg-elevated rounded-lg p-4">
              <p className="text-xs text-text-tertiary mb-3">Footer</p>
              <div className="h-12 flex items-center">
                <div className="w-28">
                  {logos.find((l) => l.id === selectedLogo)?.component}
                </div>
              </div>
            </div>

            <div className="bg-bg-elevated rounded-lg p-4">
              <p className="text-xs text-text-tertiary mb-3">Favicon</p>
              <div className="h-12 flex items-center">
                <div className="w-12">
                  {logos.find((l) => l.id === selectedLogo)?.component}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {!logos.find((l) => l.id === selectedLogo)?.isImage && (
            <div className="flex gap-4 mt-8">
              <Button
                className="flex-1"
                onClick={() => {
                  const selected = logos.find((l) => l.id === selectedLogo);
                  if (selected) {
                    handleCopySVG(selected.svg);
                  }
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar SVG
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const selected = logos.find((l) => l.id === selectedLogo);
                  if (selected) {
                    handleDownloadSVG(selected.svg, selected.id);
                  }
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar SVG
              </Button>
            </div>
          )}
          {logos.find((l) => l.id === selectedLogo)?.isImage && (
            <div className="mt-8 p-4 bg-bg-elevated rounded-lg border border-border-subtle">
              <p className="text-sm text-text-secondary text-center">
                Este logo usa uma imagem PNG. Os arquivos estão em <code className="text-primary-400">/public/logos/</code>
              </p>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="mt-8 bg-bg-elevated rounded-xl p-6 border border-border-subtle">
          <h3 className="font-semibold text-text-primary mb-3">
            Notas de Implementação
          </h3>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>• Todos os logos utilizam a paleta V2K: Electric Blue (#1A89FF), Purple (#8C1AFF), Pink (#FF1AA3)</li>
            <li>• SVGs são escaláveis e mantêm qualidade em qualquer tamanho</li>
            <li>• Fontes utilizadas: Plus Jakarta Sans (display) e Inter (subtitle)</li>
            <li>• Logos funcionam bem em fundos claros e escuros</li>
            <li>• Arquivos SVG podem ser usados diretamente ou convertidos para PNG/WebP</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
