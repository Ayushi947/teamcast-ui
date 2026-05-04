'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

export type ScrollCard = {
  step: number;
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  src: string;
};

/** Breakpoint (px) matching Tailwind md */
const MD_BREAKPOINT = 768;

/** Responsive: smaller peek/card on narrow/short viewports so deck doesn’t overflow */
const PEEK_MOBILE = 32;
const PEEK_DESKTOP = 44;
const CARD_VH_MOBILE = 68;
const CARD_VH_DESKTOP = 74;

function useIsMd() {
  const [isMd, setIsMd] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${MD_BREAKPOINT}px)`);
    const set = () => setIsMd(mql.matches);
    set();
    mql.addEventListener('change', set);
    return () => mql.removeEventListener('change', set);
  }, []);
  return isMd;
}

const StackCard = ({
  card,
  i,
  total,
  peek,
  cardVh,
  scrollYProgress,
}: {
  card: ScrollCard;
  i: number;
  total: number;
  peek: number;
  cardVh: number;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}) => {
  /*
    Top-peek stacking transform — each card i permanently lands at y = i×PEEK.

    Visual result:
      ┌─────────────────────────────────┐  ← deck top
      │ card 0 badge strip (PEEK px)    │  z=1
      ├─────────────────────────────────┤
      │ card 1 badge strip (PEEK px)    │  z=2
      ├─────────────────────────────────┤
      │ card 2 badge strip (PEEK px)    │  z=3
      │   …                             │
      ├─────────────────────────────────┤
      │ card N-1 — full content visible │  z=N  (topmost, fully in view)
      └─────────────────────────────────┘

    Each card i has z = i+1, so card i+1 covers card i starting at y=(i+1)×PEEK,
    leaving exactly PEEK px of card i's top (badge row) visible above it.

    Animation: simple two-keyframe entry per card.
      card 0  : constant '0px' (anchor, always at the deck top)
      card i>0: y '2000px' → `${i×PEEK}px` over scroll [(i−1)/(N−1), i/(N−1)]

    All values are in px — no mixed CSS units — so Framer Motion interpolates
    them cleanly. Clamping at range boundaries means:
      scroll < segStart_i → y clamped at '2000px' (off-screen, clipped)
      scroll > segEnd_i   → y clamped at i×PEEK   (final peek position)
    Reverse-scroll naturally unwinds each card back off-screen.
  */
  const yInput: number[] =
    i === 0 ? [0, 1] : [(i - 1) / (total - 1), i / (total - 1)];

  const yOutput: string[] =
    i === 0 ? ['0px', '0px'] : ['2000px', `${i * peek}px`];

  const y = useTransform(scrollYProgress, yInput, yOutput);

  return (
    <motion.div
      style={{
        y,
        zIndex: i + 1,
        height: `${cardVh}vh`,
      }}
      className={`border-border/50 bg-background absolute top-0 right-0 left-0 flex flex-col overflow-hidden rounded-2xl border sm:rounded-3xl${i > 0 ? 'shadow-[0_-6px_24px_rgba(0,0,0,0.12),0_20px_50px_-12px_rgba(0,0,0,0.25)]' : ''}`}
    >
      {/* Gradient overlay */}
      <div className="from-background/70 via-background/10 pointer-events-none absolute inset-0 z-0 bg-gradient-to-b to-transparent" />

      {/* Card header — compact top padding on mobile so badge fits in peek strip */}
      <div className="relative z-10 flex shrink-0 flex-col gap-y-2 px-4 pt-2 pb-3 sm:px-10 sm:pt-4 sm:pb-4">
        <div className="flex flex-row items-center gap-x-2">
          <div
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-xs font-semibold text-black"
            style={{ backgroundColor: card.badgeColor }}
          >
            {card.step}
          </div>
          <p className="text-muted-foreground text-sm font-medium">
            {card.badge}
          </p>
        </div>
        <h4 className="text-foreground mt-0.5 text-xl font-medium sm:mt-1 sm:text-2xl md:text-3xl">
          {card.title}
        </h4>
        <p className="text-muted-foreground w-full text-sm sm:w-3/5 sm:text-base">
          {card.description}
        </p>
      </div>

      {/* Illustration — fills remaining height */}
      <div className="relative z-10 min-h-0 flex-1 px-4 pb-4 sm:px-10 sm:pb-8">
        <img
          src={card.src}
          alt={card.title}
          className="h-full w-full object-contain"
          loading={i === 0 ? 'eager' : 'lazy'}
        />
      </div>
    </motion.div>
  );
};

export const ImagesScrollingAnimation = ({
  items,
}: {
  items: ScrollCard[];
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMd = useIsMd();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const peek = isMd ? PEEK_DESKTOP : PEEK_MOBILE;
  const cardVh = isMd ? CARD_VH_DESKTOP : CARD_VH_MOBILE;

  /*
    Deck height = card height + space for (total−1) badge peek strips at the top.
      cardVh vh  +  (total−1) × peek px

    The last card (i = total−1) sits at y = (total−1)×peek and its bottom edge
    equals the container bottom. overflow-hidden clips any card still at
    y = 2000px (off-screen) and reveals badge strips once cards reach i×peek.
  */
  const maxPeekPx = (items.length - 1) * peek;
  const deckHeight = `calc(${cardVh}vh + ${maxPeekPx}px)`;

  return (
    <div
      ref={containerRef}
      className="relative w-full px-4 sm:px-6 lg:px-8"
      style={{ height: `${items.length * 100}vh` }}
    >
      {/*
        top-[calc(3.5rem+8px)] on mobile  = 56px navbar + 8px gap
        md:top-[calc(5rem+12px)] on desktop = 80px navbar + 12px gap
        Keeps the deck clearly below the fixed navbar with breathing room.
      */}
      <div
        className="sticky top-[calc(3.5rem+8px)] w-full md:top-[calc(5rem+12px)]"
        style={{ height: deckHeight }}
      >
        <div
          className="relative mx-auto w-full max-w-7xl overflow-hidden"
          style={{ height: deckHeight }}
        >
          {items.map((card, i) => (
            <StackCard
              key={card.step}
              card={card}
              i={i}
              total={items.length}
              peek={peek}
              cardVh={cardVh}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
