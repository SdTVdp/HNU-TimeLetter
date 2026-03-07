import * as fs from 'fs';
import * as path from 'path';

const CONFIG_PATH = path.resolve(process.cwd(), 'src/config/admin.json');

export interface AdminConfig {
  sync: {
    enabled: boolean;
    cron: string;
    lastRun?: string;
    status: 'idle' | 'running' | 'success' | 'failed';
    lastMessage?: string;
  };
}

export function getAdminConfig(): AdminConfig {
  if (!fs.existsSync(CONFIG_PATH)) {
    return {
      sync: {
        enabled: false,
        cron: '0 0 * * *',
        status: 'idle',
      },
    };
  }
  const content = fs.readFileSync(CONFIG_PATH, 'utf-8');
  try {
    return JSON.parse(content);
  } catch {
    return {
      sync: {
        enabled: false,
        cron: '0 0 * * *',
        status: 'idle',
      },
    };
  }
}

export function updateAdminConfig(newConfig: Partial<AdminConfig>) {
  const current = getAdminConfig();
  const updated = { ...current, ...newConfig };
  // Merge deep properties for sync
  if (newConfig.sync && current.sync) {
      updated.sync = { ...current.sync, ...newConfig.sync };
  }
  
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}
