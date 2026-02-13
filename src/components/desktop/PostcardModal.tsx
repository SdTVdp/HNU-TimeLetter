'use client';

import { useState } from 'react'; // 新增这个
import Image from 'next/image';
import { X } from 'lucide-react';
import StampSwitcher from './StampSwitcher'; // 新增这个引入
import { motion, AnimatePresence } from 'framer-motion';


// 定义接收的属性类型
interface PostcardModalProps {
  location: any; // 接收当前点击的地点数据
  onClose: () => void; // 接收关闭弹窗的函数
}

export default function PostcardModal({ location, onClose }: PostcardModalProps) {
  // 暂时先默认显示这个地点的第一个故事
  // 记住当前显示的故事索引，默认是 0 (第一个)
  const [currentIndex, setCurrentIndex] = useState(0);

  // 根据当前的索引，获取对应的故事数据
  const currentStory = location.stories[currentIndex];

  return (
    // 背景遮罩：深色半透明 + 毛玻璃效果 (backdrop-blur-md)
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300"
      onClick={onClose} // 点击背景关闭
    >
      {/* 核心明信片卡片：限制最大宽度，设置比例，米白色背景 */}
      <motion.div 
        // 1. 初始状态：透明、稍微缩小、往下偏移一点点
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        // 2. 登场状态：完全不透明、原始大小、回到原位
        animate={{ opacity: 1, scale: 1, y: 0 }}
        // 3. 过渡时间：0.4秒，使用一种类似于“弹簧”或“缓出”的流畅节奏
        transition={{ duration: 0.4, ease: "easeOut" }}
  
        className="relative flex w-full max-w-5xl aspect-[16/9] md:aspect-auto md:h-[70vh] max-h-[800px] bg-[#fdfbf7] rounded-xl overflow-hidden shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
        >
        {/* 关闭按钮 (右上角) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-800 transition-colors bg-white/50 hover:bg-white/80 rounded-full backdrop-blur-sm"
        >
          <X size={24} />
        </button>

        {/* 左栏：视觉区 (60%) */}
        <div className="relative w-[60%] h-full bg-gray-200 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex} // 再次使用 key 魔法
              initial={{ opacity: 0, scale: 1.05 }} // 进场：透明且稍微放大
              animate={{ opacity: 1, scale: 1 }}    // 正常：清晰且恢复原比例
              exit={{ opacity: 0 }}                 // 退场：直接变透明
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <Image 
                src={currentStory.mainImageUrl || '/images/scene.jpg'} 
                alt={currentStory.characterName}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>
          {/* 胶片滤镜保留在外面 */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        </div>

        {/* 右栏：叙事区 (40%) */}
        <div className="w-[40%] h-full flex flex-col p-10 md:p-14 overflow-y-auto">
          {/* 顶部：邮票切换器占位 (这是你的下一步任务) */}
          <div className="h-20 mb-6 border-b border-gray-200 border-dashed flex items-center justify-center text-gray-400 text-sm">
            {/* 顶部：邮票切换器 */}
            <StampSwitcher 
                stories={location.stories} 
                currentIndex={currentIndex} 
                onChange={(newIndex) => setCurrentIndex(newIndex)} 
          />
          </div>

          {/* 中部：故事文本 */}
          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }} // 文字从下面稍微浮现
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}   // 文字往上飘走
                transition={{ duration: 0.3 }}
                className="absolute inset-0 overflow-y-auto pr-4 pb-4"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-6 tracking-wider">
                  {currentStory.characterName}
                </h3>
                <p className="text-gray-600 leading-loose text-justify whitespace-pre-wrap">
                  {currentStory.content} 
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 底部：作者与日期 */}
          <div className="mt-8 text-right text-sm text-gray-400">
            <p>—— {currentStory.author || "佚名"}</p>
            <p className="mt-1">{currentStory.date || currentStory.content.date}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}