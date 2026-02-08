'use client';

import { motion, useAnimationControls } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function EnvelopeIntro() {
  const { setEnvelopeOpened } = useAppStore();
  const [isOpening, setIsOpening] = useState(false);
  const controls = useAnimationControls();

  const handleOpen = async () => {
    if (isOpening) return;
    setIsOpening(true);

    // 1. 播放开信动画序列 (约 1.7s)
    void controls.start('open');
    
    // 2. 等待信纸抽出 (1.7s) + 悬停 (0.2s) = 1.9s
    await new Promise((resolve) => setTimeout(resolve, 1900));

    // 3. 信封下落 (0.6s)
    void controls.start('drop_envelope');
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    // 4. 信纸放大 (0.8s)
    void controls.start('expand_letter');
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 5. 切换状态
    setEnvelopeOpened(true);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#fdfbf7] overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      {/* 背景氛围：光影与噪点 */}
      <div className="absolute inset-0 opacity-30 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-transparent to-blue-50/30 pointer-events-none" />

      {/* 信封容器 */}
      <motion.div
        className="relative w-[340px] h-[240px] md:w-[480px] md:h-[320px] perspective-1000"
        initial="idle"
        animate={isOpening ? undefined : "idle"}
        variants={{
          idle: {
            y: [0, -10, 0],
            rotate: [0, 1, 0, -1, 0],
            transition: {
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }
        }}
      >
        <motion.div
          className="relative w-full h-full preserve-3d"
          animate={controls}
          variants={{
            open: {
              y: 100,
              scale: 1.1,
              transition: { duration: 0.8, ease: "backOut" }
            },
            exit: {
              opacity: 0,
              scale: 1.5,
              filter: "blur(10px)",
              transition: { duration: 0.8 }
            }
          }}
        >
          {/* 信封背面 (Inside) */}
          <motion.div 
            className="absolute inset-0 bg-[#e6ded5] rounded-lg shadow-2xl" 
            variants={{
              drop_envelope: { y: 1000, opacity: 0, transition: { duration: 0.6, ease: "easeIn" } },
              expand_letter: { y: 1000, opacity: 0, transition: { duration: 0 } } // 保持下落状态
            }}
          />

          {/* 信纸 (Letter) */}
          <motion.div
            className="absolute left-4 right-4 top-4 bottom-4 bg-white shadow-sm flex flex-col items-center justify-center p-8 text-center origin-bottom z-10"
            variants={{
              open: {
                y: -150,
                transition: { delay: 0.7, duration: 1, type: "spring", bounce: 0.3 } 
              },
              drop_envelope: {
                y: -150, // 保持在 open 状态的位置，不随信封下落（注意：这里可能需要微调，因为父级没动，子级继承父级位置，所以只要不设为 0，就会保持）
                         // 实际上，如果信封其他部件下落了，信纸也应该保持不动。
                         // 但如果信纸是 absolute，且没有 animated y，它会停在原处吗？
                         // 不，之前的 open 状态 y: -150。
                         // 所以这里我们需要显式保持 y: -150。
                transition: { duration: 0.6 } 
              },
              expand_letter: {
                scale: 5,  // 放大到全屏
                y: 0,      // 回到中心
                opacity: 0, // 放大后淡出，展示新页面
                transition: { duration: 0.8, ease: "easeInOut" }
              }
            }}
          >
            <div className="w-full h-full border-2 border-dashed border-stone-200 p-4 flex flex-col items-center justify-center">
              <h2 className="font-serif text-2xl text-stone-800 mb-2 tracking-widest">时光笺</h2>
              <p className="font-sans text-xs text-stone-500 uppercase tracking-widest">Hainan University</p>
              <div className="mt-4 w-12 h-[1px] bg-stone-300" />
              <p className="mt-4 text-xs text-stone-400 font-serif italic">
                "献给每一段无法复刻的青春"
              </p>
            </div>
          </motion.div>

          {/* 信封正面 (Front Flaps) */}
          {/* 底部三角形 */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#f0eadd] z-20" 
            style={{ clipPath: "polygon(0 100%, 50% 0, 100% 100%)" }} 
            variants={{
              drop_envelope: { y: 1000, opacity: 0, transition: { duration: 0.6, ease: "easeIn" } },
              expand_letter: { y: 1000, opacity: 0, transition: { duration: 0 } }
            }}
          />
          {/* 左侧三角形 */}
          <motion.div 
            className="absolute left-0 top-0 bottom-0 w-1/2 bg-[#f5efe4] z-20" 
            style={{ clipPath: "polygon(0 0, 0 100%, 100% 50%)" }} 
            variants={{
              drop_envelope: { y: 1000, opacity: 0, transition: { duration: 0.6, ease: "easeIn" } },
              expand_letter: { y: 1000, opacity: 0, transition: { duration: 0 } }
            }}
          />
          {/* 右侧三角形 */}
          <motion.div 
            className="absolute right-0 top-0 bottom-0 w-1/2 bg-[#efe8dc] z-20" 
            style={{ clipPath: "polygon(100% 0, 100% 100%, 0 50%)" }} 
            variants={{
              drop_envelope: { y: 1000, opacity: 0, transition: { duration: 0.6, ease: "easeIn" } },
              expand_letter: { y: 1000, opacity: 0, transition: { duration: 0 } }
            }}
          />

          {/* 顶部封盖 (Top Flap) - 关键动画部件 */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-1/2 bg-[#e8e0d5] origin-top z-30 shadow-md"
            style={{ 
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              transformStyle: "preserve-3d"
            }}
            variants={{
              open: {
                rotateX: 180,
                zIndex: 0,
                transition: { 
                  rotateX: { duration: 0.6, ease: "easeInOut" },
                  zIndex: { delay: 0.3 } // 在 90 度垂直时切换层级，避免穿模
                }
              },
              drop_envelope: {
                y: 1000,
                opacity: 0,
                transition: { duration: 0.6, ease: "easeIn" }
              },
              expand_letter: {
                y: 1000,
                opacity: 0,
                transition: { duration: 0 }
              }
            }}
          >
             {/* 封盖内侧纹理 (翻开后可见) */}
             <div className="absolute inset-0 bg-[#ded6ca] backface-hidden rotate-x-180" />
          </motion.div>

          {/* 火漆印 (Wax Seal) - 交互按钮 */}
          <motion.button
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40",
              "w-16 h-16 md:w-20 md:h-20 rounded-full",
              "bg-red-800 shadow-xl flex items-center justify-center",
              "border-4 border-red-700/50",
              "cursor-pointer hover:bg-red-700 transition-colors",
              isOpening && "pointer-events-none"
            )}
            onClick={handleOpen}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            variants={{
              open: {
                opacity: 0,
                scale: 1.5,
                filter: "blur(4px)",
                transition: { duration: 0.3 }
              },
              drop_envelope: {
                y: 1000,
                opacity: 0,
                transition: { duration: 0.6, ease: "easeIn" }
              },
              expand_letter: {
                y: 1000,
                opacity: 0,
                transition: { duration: 0 }
              }
            }}
          >
            {/* 火漆印纹理 */}
            <div className="absolute inset-1 rounded-full border border-red-900/30 opacity-50" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/20 to-white/10" />
            
            {/* Logo/文字 */}
            <span className="font-serif text-amber-100/90 text-xl md:text-2xl font-bold tracking-tighter drop-shadow-md">
              HNU
            </span>
          </motion.button>
          
          {/* 点击提示 */}
          <motion.p
            className="absolute -bottom-12 left-0 right-0 text-center text-stone-400 text-sm font-serif tracking-widest"
            variants={{
              idle: { opacity: [0.5, 1, 0.5], transition: { duration: 2, repeat: Infinity } },
              open: { opacity: 0 }
            }}
            animate={isOpening ? "open" : "idle"}
          >
            点击开启
          </motion.p>

        </motion.div>
      </motion.div>
    </motion.div>
  );
}
