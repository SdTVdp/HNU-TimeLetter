'use client';

import { motion, useAnimationControls } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

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
      className={cn(
        "fixed inset-0 z-50 bg-[#fdfbf7] snap-y snap-mandatory scroll-smooth",
        isOpening ? "overflow-hidden" : "overflow-y-auto"
      )}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      {/* 第一屏：启封 */}
      <section className="w-full h-screen snap-start relative flex items-center justify-center overflow-hidden">
        {/* 背景氛围：光影与噪点 */}
        <div className="absolute inset-0 opacity-30 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-transparent to-blue-50/30 pointer-events-none" />

        {/* 标题 */}
        <motion.div 
          className="absolute top-[15%] md:top-[18%] left-0 right-0 text-center z-40 px-4 pointer-events-none space-y-3"
          initial={{ opacity: 0, y: -20 }}
          animate={isOpening ? { opacity: 0, y: -50, filter: "blur(10px)" } : { opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <h1 className="font-serif text-3xl md:text-5xl text-stone-800 font-bold tracking-[0.2em] drop-shadow-sm">
            与她的海大时光笺
          </h1>
          <p className="font-sans text-xs md:text-sm text-stone-500 tracking-[0.4em] uppercase opacity-80">
            Hainan University TimeLetter
          </p>
        </motion.div>

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
                expand_letter: { y: 1000, opacity: 0, transition: { duration: 0 } }
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
                  y: -150,
                  transition: { duration: 0.6 } 
                },
                expand_letter: {
                  scale: 5,
                  y: 0,
                  opacity: 0,
                  transition: { duration: 0.8, ease: "easeInOut" }
                }
              }}
            >
              <div className="w-full h-full border-2 border-dashed border-stone-200 p-4 flex flex-col items-center justify-center">
                <h2 className="font-serif text-2xl text-stone-800 mb-2 tracking-widest">时光笺</h2>
                <p className="font-sans text-xs text-stone-500 uppercase tracking-widest">Hainan University</p>
                <div className="mt-4 w-12 h-[1px] bg-stone-300" />
                <p className="mt-4 text-xs text-stone-400 font-serif italic">
                  &quot;献给每一段无法复刻的青春&quot;
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

            {/* 顶部封盖 (Top Flap) */}
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
                    zIndex: { delay: 0.3 }
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
               <div className="absolute inset-0 bg-[#ded6ca] backface-hidden rotate-x-180" />
            </motion.div>

            {/* 火漆印 (Wax Seal) */}
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
              <div className="absolute inset-1 rounded-full border border-red-900/30 opacity-50" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/20 to-white/10" />
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

        {/* 下滑提示 */}
        <motion.div 
          className="absolute bottom-8 left-0 right-0 flex flex-col items-center justify-center text-stone-400 gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <span className="text-xs font-serif tracking-widest">关于项目</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </motion.div>
      </section>

      {/* 第二屏：关于项目 */}
      <section className="w-full h-screen snap-start relative flex items-center justify-center bg-[#fdfbf7] p-8">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150 mix-blend-multiply" />
        <div className="max-w-2xl text-center space-y-8 z-10">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-serif text-stone-800">关于项目</h2>
            <p className="text-stone-400 font-serif italic">Project Vision</p>
          </div>
          
          <div className="w-16 h-[1px] bg-stone-300 mx-auto" />
          
          <p className="text-stone-600 leading-loose font-serif text-lg">
            这是一个基于海南大学校园地图的交互式视觉叙事网站。<br/>
            我们打破次元壁，将 Galgame 风格的二次元角色融入海大实景——<br/>
            思源学堂、东坡湖、图书馆……<br/>
            这里不仅有风景，更有属于我们的情感记忆。
          </p>
          
          <p className="text-stone-600 leading-loose font-serif text-lg">
            通过“图+文”的形式，<br/>
            我们共同书写属于我们的“海大故事”。
          </p>
        </div>
        
        <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center justify-center text-stone-400 gap-2">
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </div>
      </section>

      {/* 第三屏：关于我们 */}
      <section className="w-full h-screen snap-start relative flex items-center justify-center bg-[#f5efe4] p-8">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150 mix-blend-multiply" />
        <div className="max-w-3xl text-center space-y-12 z-10">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-serif text-stone-800">关于我们</h2>
            <p className="text-stone-400 font-serif italic">Our Team</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-stone-700 font-serif border-b border-stone-300 pb-2">策划与开发</h3>
              <ul className="space-y-2 text-stone-600 font-sans">
                <li className="flex justify-between"><span>基础设施 & 运维</span> <span className="text-stone-400">Dev A</span></li>
                <li className="flex justify-between"><span>PC端体验</span> <span className="text-stone-400">Dev B</span></li>
                <li className="flex justify-between"><span>移动端体验</span> <span className="text-stone-400">Dev C</span></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-stone-700 font-serif border-b border-stone-300 pb-2">特别鸣谢</h3>
              <ul className="space-y-2 text-stone-600 font-sans">
                <li>所有为海大留下美好瞬间的摄影师们</li>
                <li>以及每一个热爱海大的你</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 text-stone-400 text-sm font-serif">
            © 2026 与她的海大时光笺 · Hainan University
          </div>
        </div>
      </section>
    </motion.div>
  );
}
