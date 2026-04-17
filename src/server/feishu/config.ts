import { existsSync } from 'node:fs';
import * as path from 'node:path';
import { config as loadDotenv } from 'dotenv';
import type { FeishuConnectionSettings } from './types';

export const DEFAULT_FEISHU_LOCATIONS_TABLE_ID = 'tblaMWD1PV9lwXDr';
export const DEFAULT_FEISHU_OSS_TABLE_ID = 'tblwLUNdWNzv1kZw';

export const FEISHU_REQUIRED_KEYS: Array<keyof FeishuConnectionSettings> = [
  'feishuAppId',
  'feishuAppSecret',
  'feishuAppToken',
  'feishuTableId',
  'feishuLocationsTableId',
];

export function loadWorkspaceEnv(workspaceRoot = process.cwd()): void {
  const envPath = path.join(workspaceRoot, '.env.local');
  if (existsSync(envPath)) {
    loadDotenv({ path: envPath, override: false });
  }
}

export function getEnvSettings(): FeishuConnectionSettings {
  return {
    feishuAppId: process.env.FEISHU_APP_ID,
    feishuAppSecret: process.env.FEISHU_APP_SECRET,
    feishuAppToken: process.env.FEISHU_APP_TOKEN,
    feishuTableId: process.env.FEISHU_TABLE_ID,
    feishuViewId: process.env.FEISHU_VIEW_ID,
    feishuLocationsTableId:
      process.env.FEISHU_LOCATIONS_TABLE_ID ?? DEFAULT_FEISHU_LOCATIONS_TABLE_ID,
    feishuOssTableId: process.env.FEISHU_OSS_TABLE_ID ?? DEFAULT_FEISHU_OSS_TABLE_ID,
    ossRegion: process.env.ALIYUN_OSS_REGION,
    ossBucket: process.env.ALIYUN_OSS_BUCKET,
    ossAccessKeyId: process.env.ALIYUN_OSS_ACCESS_KEY_ID,
    ossAccessKeySecret: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET,
  };
}

export function mergeSettings(
  ...sources: Array<Partial<FeishuConnectionSettings> | undefined>
): FeishuConnectionSettings {
  const merged: FeishuConnectionSettings = {};

  for (const source of sources) {
    if (!source) continue;
    for (const [key, value] of Object.entries(source) as Array<
      [keyof FeishuConnectionSettings, string | undefined]
    >) {
      if (typeof value === 'string' && value.trim()) {
        merged[key] = value.trim();
      }
    }
  }

  return merged;
}

export function getMissingRequiredSettings(
  settings: FeishuConnectionSettings,
  keys = FEISHU_REQUIRED_KEYS
): string[] {
  return keys.filter((key) => !settings[key]?.trim());
}

export function canUploadWithOss(settings: FeishuConnectionSettings): boolean {
  return Boolean(
    settings.ossRegion &&
      settings.ossBucket &&
      settings.ossAccessKeyId &&
      settings.ossAccessKeySecret
  );
}
