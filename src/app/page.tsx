'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useIsMobile } from '@/lib/hooks';
import { EnvelopeIntro } from '@/components/shared/EnvelopeIntro';
import { DesktopExperience } from '@/components/desktop/DesktopExperience';
import { MobileExperience } from '@/components/mobile/MobileExperience';

export default function Home() {
  const { isEnvelopeOpened } = useAppStore();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  // 避免 SSR Hydration 问题
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 bg-background" />
    );
  }

  return (
    <>
      <AnimatePresence>
        {!isEnvelopeOpened && <EnvelopeIntro />}
      </AnimatePresence>

      {isEnvelopeOpened && (
        <>
          {isMobile ? <MobileExperience /> : <DesktopExperience />}
        </>
      )}
    </>
  );
}
