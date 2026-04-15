import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/admin/auth';
import { getAdminConfig, updateAdminConfig } from '@/lib/admin/config';
import { startSyncJob, stopSyncJob, runSyncTask } from '@/lib/admin/scheduler';

export async function GET() {
  const isAuth = await checkAuth();
  if (!isAuth) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const config = getAdminConfig();
  return NextResponse.json(config);
}

export async function POST(request: Request) {
  const isAuth = await checkAuth();
  if (!isAuth) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { action, cron, enabled } = body;

    if (action === 'trigger') {
      // 异步执行同步
      runSyncTask();
      return NextResponse.json({ message: 'Sync triggered' });
    }

    if (action === 'update') {
      const currentConfig = getAdminConfig();
      const newConfig = updateAdminConfig({
        sync: {
          ...currentConfig.sync,
          enabled: enabled !== undefined ? enabled : currentConfig.sync.enabled,
          cron: cron || currentConfig.sync.cron,
        }
      });

      // Update scheduler
      if (newConfig.sync.enabled) {
        startSyncJob(newConfig.sync.cron);
      } else {
        stopSyncJob();
      }

      return NextResponse.json(newConfig);
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
