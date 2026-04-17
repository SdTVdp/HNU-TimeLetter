'use client';

import type { CreationEntry } from '@/lib/types';
import Image from 'next/image';

interface CreationNoteEntryProps {
  entry: CreationEntry;
  isLast: boolean;
}

/** 标签颜色映射 */
const TAG_STYLES: Record<string, string> = {
  '灵感': 'bg-amber-100 text-amber-700',
  '故事': 'bg-blue-100 text-blue-700',
  '画面描述': 'bg-emerald-100 text-emerald-700',
  '参考图': 'bg-violet-100 text-violet-700',
  '其他': 'bg-stone-200 text-stone-600',
};

export default function CreationNoteEntry({ entry, isLast }: CreationNoteEntryProps) {
  const isReferenceImage = entry.tags === '参考图';
  const tagStyle = TAG_STYLES[entry.tags] ?? TAG_STYLES['其他'];

  return (
    <div className={`px-4 py-3 ${isLast ? '' : 'border-b border-black/[0.06]'}`}>
      {/* 头部：左上 author / 右上 tag 胶囊 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-serif text-ink-muted truncate max-w-[60%]">
          {entry.author || '匿名'}
        </span>
        {entry.tags && (
          <span
            className={`inline-block text-[10px] leading-none px-2 py-1 ${tagStyle}`}
            style={{ borderRadius: '9999px' }}
          >
            {entry.tags}
          </span>
        )}
      </div>

      {/* 主体 */}
      {isReferenceImage && entry.images.length > 0 ? (
        <div className="space-y-2">
          {entry.images.map((src, i) => (
            <div key={i} className="relative w-full overflow-hidden" style={{ borderRadius: 0 }}>
              <Image
                src={src}
                alt={`参考图 ${i + 1}`}
                width={400}
                height={300}
                className="w-full h-auto object-cover"
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-ink whitespace-pre-wrap break-words">
          {entry.content}
        </p>
      )}
    </div>
  );
}
