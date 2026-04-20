'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useIsMobile } from '@/lib/hooks';
import { useVirtualScroll } from '@/lib/useVirtualScroll';
import { EnvelopeIntro } from '@/components/shared/EnvelopeIntro';
import { InteractiveMap } from '@/components/desktop/InteractiveMap';
import { MobileExperience } from '@/components/mobile/MobileExperience';
import { ScrollSections } from '@/components/sections/ScrollSections';
import { Footer } from '@/components/sections/Footer';
import { CustomScrollbar } from '@/components/shared/CustomScrollbar';

export default function Home() {
  const { isEnvelopeOpened, isTransitioning, setTransitioning, isIntroReady } =
    useAppStore();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lenis = useVirtualScroll(
    mounted && !isEnvelopeOpened && !isMobile && isIntroReady,
  );
  const scrollbarEnabled =
    mounted && !isEnvelopeOpened && !isMobile && isIntroReady;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.add('home-scrollbar-hidden');
    document.body.classList.add('home-scrollbar-hidden');

    return () => {
      document.documentElement.classList.remove('home-scrollbar-hidden');
      document.body.classList.remove('home-scrollbar-hidden');
    };
  }, []);

  useEffect(() => {
    const locked = mounted && !isEnvelopeOpened && !isIntroReady;
    if (!locked) return;

    document.documentElement.classList.add('intro-scroll-locked');
    document.body.classList.add('intro-scroll-locked');

    return () => {
      document.documentElement.classList.remove('intro-scroll-locked');
      document.body.classList.remove('intro-scroll-locked');
    };
  }, [mounted, isEnvelopeOpened, isIntroReady]);

  useEffect(() => {
    if (!isEnvelopeOpened || !isTransitioning) return;

    transitionTimerRef.current = setTimeout(() => {
      setTransitioning(false);
    }, 1400);

    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, [isEnvelopeOpened, isTransitioning, setTransitioning]);

  if (!mounted) {
    return <div className="page-paper fixed inset-0" />;
  }

  return (
    <main className="relative min-h-screen w-full">
      <Footer />

      <AnimatePresence mode="wait">
        {!isEnvelopeOpened ? (
          <motion.div
            key="intro-flow"
            className="relative w-full"
            style={{ zIndex: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          >
            <EnvelopeIntro />
            <ScrollSections />
            <FooterSpacer />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            className="relative z-10 min-h-screen w-full"
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            {isMobile ? <MobileExperience /> : <InteractiveMap />}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            key="transition-overlay"
            className="page-paper fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          >
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="block h-2.5 w-2.5 rounded-full bg-[#c23643]"
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
            <motion.p
              className="font-serif text-lg tracking-[0.22em] text-muted-foreground"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              加载中...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <CustomScrollbar enabled={scrollbarEnabled} lenis={lenis} />
    </main>
  );
}

function FooterSpacer() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const measure = () => setHeight(footer.offsetHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(footer);

    return () => observer.disconnect();
  }, []);

  return <div style={{ height }} aria-hidden="true" />;
}
