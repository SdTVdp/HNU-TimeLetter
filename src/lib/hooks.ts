'use client';

import { useState, useEffect } from 'react';

/**
 * 响应式媒体查询 Hook
 * 用于检测屏幕宽度，避免 SSR Hydration 问题
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // 初始化时设置状态
    setMatches(media.matches);

    // 监听变化
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/**
 * 检测是否为移动端
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}
