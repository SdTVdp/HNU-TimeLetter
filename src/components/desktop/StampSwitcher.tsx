'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StampSwitcherProps {
  stories: any[]; 
  currentIndex: number;
  onChange: (index: number) => void;
}

export default function StampSwitcher({ stories, currentIndex, onChange }: StampSwitcherProps) {
  // 如果没有故事，就不渲染
  if (!stories || stories.length === 0) return null;

  const currentStory = stories[currentIndex];

  // 点击左侧箭头：如果已经是第一张，就跳到最后一张；否则往前翻
  const handlePrev = () => {
    onChange(currentIndex === 0 ? stories.length - 1 : currentIndex - 1);
  };

  // 点击右侧箭头：如果已经是最后一张，就跳到第一张；否则往后翻
  const handleNext = () => {
    onChange(currentIndex === stories.length - 1 ? 0 : currentIndex + 1);
  };

  return (
    <div className="flex items-center justify-center gap-6 h-24 mb-4 border-b border-gray-200 border-dashed pb-4 overflow-hidden">
      
      {stories.length > 1 && (
        <button onClick={handlePrev} className="p-2 text-gray-400 hover:text-gray-800 transition-all rounded-full hover:bg-gray-100 z-10">
          <ChevronLeft size={24} />
        </button>
      )}

      {/* 核心动画区 */}
      <div className="relative flex flex-col items-center group cursor-pointer w-24">
        {/* AnimatePresence 负责管理组件的退出动画，mode="wait" 表示先退场，再进场，避免排版错乱 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex} // 这里的 key 是魔法！当 currentIndex 改变，就会触发动画
            initial={{ x: 20, opacity: 0 }} // 初始：偏右、透明
            animate={{ x: 0, opacity: 1 }}  // 正常：回正、完全显示
            exit={{ x: -20, opacity: 0 }}   // 退出：往左滑走、变透明
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center"
          >
            {/* 拟物化邮票边框 */}
            <div className="w-16 h-16 bg-white p-1 shadow-md border-[2px] border-gray-200 border-dotted rounded-sm transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <div className="relative w-full h-full overflow-hidden bg-gray-100">
                <Image 
                  src={currentStory.avatarUrl || '/images/avatar.png'} 
                  alt={currentStory.characterName}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            {/* 角色名字 */}
            <span className="text-xs text-gray-400 mt-3 font-serif tracking-widest uppercase">
              {currentStory.characterName}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {stories.length > 1 && (
        <button onClick={handleNext} className="p-2 text-gray-400 hover:text-gray-800 transition-all rounded-full hover:bg-gray-100 z-10">
          <ChevronRight size={24} />
        </button>
      )}
      
    </div>
  );
}