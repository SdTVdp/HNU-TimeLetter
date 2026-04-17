import type { Metadata } from 'next';
import CreationBoardPage from '@/components/creation/CreationBoardPage';
import creationData from '@/data/creation-board.json';
import type { CreationIdea } from '@/lib/types';

export const metadata: Metadata = {
  title: '创作公示板 | 与她的海大时光笺',
  description: '汇总群友灵感，公开展示共创线索，欢迎在已有灵感上继续扩写与衍生',
};

export default function CreationPage() {
  const ideas = (creationData as { ideas: CreationIdea[] }).ideas;

  return <CreationBoardPage ideas={ideas} />;
}
