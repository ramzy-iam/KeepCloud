export const APP_LOCAL_QUEUES = {
  system: {
    name: 'system-queue',
    jobName: 'system-queue-job',
  },
};

export enum ProcessorAction {
  MOVE_FILE_AFTER_CREATE = 'MOVE_FILE_AFTER_CREATE',
}
