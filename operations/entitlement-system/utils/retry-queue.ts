// Retry Queue Interface: For failed Discord syncs, etc.
export interface RetryTask {
  id: string;
  type: 'discord-sync';
  payload: any;
  attempts: number;
  lastAttempt: number;
}

export async function enqueueRetry(task: RetryTask): Promise<void> {
  // TODO: Add task to retry queue
}

export async function processRetryQueue(): Promise<void> {
  // TODO: Process and retry failed tasks
}
