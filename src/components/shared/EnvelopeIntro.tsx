'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';

export function EnvelopeIntro() {
  const { setEnvelopeOpened } = useAppStore();

  const handleClick = () => {
    // 播放动画后设置状态
    setTimeout(() => {
      setEnvelopeOpened(true);
    }, 1500);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-sky-100 to-blue-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="relative cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
      >
        {/* 信封主体 - 暂用占位 */}
        <div className="relative w-96 h-64 bg-gradient-to-br from-amber-50 to-orange-100 rounded-lg shadow-2xl border-2 border-amber-200">
          {/* 火漆印占位 */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-red-600 rounded-full shadow-lg flex items-center justify-center">
            <span className="text-white text-xs font-serif">海大</span>
          </div>
          
          {/* 提示文字 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <h1 className="text-3xl font-serif text-stone-800 mb-4">
              与她的海大时光笺
            </h1>
            <p className="text-sm text-stone-600">
              点击拆开信封
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
