export enum TaskStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
}

export enum TaskType {
    SAMPLE_TASK = 'sample-task',
    CONSOLE_LOG = 'console-log',
    SUCCESS_TEST = 'success-test',
    FAILURE_TEST = 'failure-test',
    // Add more task types as needed
}

export enum TaskEventType {
    STARTED = 'started',
    SUCCEEDED = 'succeeded',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
    LOCKED = 'locked',
    UNLOCKED = 'unlocked',
    RESCHEDULED = 'rescheduled',
}
