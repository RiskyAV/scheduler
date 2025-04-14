# SQL Database-Based Task Scheduler

A robust and scalable task scheduler system that utilizes a SQL database for persistent storage and coordination. This system is capable of managing tasks by storing their details, scheduling them based on configurable parameters (time, priority), executing them reliably, handling failures with retries, and providing an API for management and monitoring.

## Features

- **Reliability**: Tasks are processed accurately and persistently stored with robust error handling and retries.
- **Scalability**: The architecture supports multiple worker instances processing tasks concurrently.
- **Maintainability**: Clean code practices, modular design, and clear documentation.
- **Extensibility**: Easy addition of new task types.
- **Manageability**: APIs for task submission, status checking, and control.

## System Architecture

The system follows a standard distributed task queue pattern leveraging a central database:

### Components

1. **API Service**:
   - Exposes a RESTful HTTP interface for external interactions
   - Handles task submission, status queries, cancellation, and rescheduling requests
   - Validates input and interacts with the database

2. **SQL Database**:
   - Acts as the central source of truth and coordination point
   - Stores task definitions, schedules, current status, retry information, and locking details
   - Uses PostgreSQL with features like JSONB and SELECT ... FOR UPDATE SKIP LOCKED

3. **Worker Service(s)**:
   - Polls the database for due tasks (pending or failed tasks ready for retry)
   - Acquires atomic locks on tasks to prevent concurrent processing
   - Executes the task logic based on task_name
   - Updates task status and retry information in the database

## Setup & Configuration

### Prerequisites

- Node.js
- npm/yarn
- PostgreSQL database

### Environment Variables

Configure the following environment variables in a `.env` file:

```
DATABASE_URL=postgres://username:password@localhost:5432/scheduler
API_PORT=3001
WORKER_PORT=3002
WORKER_POLLING_INTERVAL_MS=5000
WORKER_MAX_CONCURRENT_TASKS=10
WORKER_ID=worker-1
RETRY_BASE_DELAY_MS=1000
LOG_LEVEL=info
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   yarn install
   ```
3. Set up the database:
   ```
   yarn run migrate:up
   ```
4. Build the application:
   ```
   yarn run build
   ```

### Running the Application

1. Start the API service:
   ```
   yarn run start:api
   ```

2. Start the Worker service:
   ```
   yarn run start:worker
   ```

## API Endpoints

### Task Management

- **POST /tasks**
  - Create a new task
  - Request Body: `{ "task_name": string, "payload"?: any, "scheduled_at"?: string (ISO 8601), "priority"?: number, "max_retries"?: number }`
  - Response: 201 Created with `{ "id": string }`

- **GET /tasks/:id**
  - Retrieve task details
  - Response: 200 OK with task details

- **DELETE /tasks/:id**
  - Cancel a task (only if pending)
  - Response: 204 No Content

- **PATCH /tasks/:id**
  - Reschedule a task (only if pending)
  - Request Body: `{ "scheduled_at": string (ISO 8601) }`
  - Response: 200 OK with updated task details

### Monitoring

- **GET /monitor/health**
  - Health check endpoint
  - Response: 200 OK with `{ "status": "ok" }`

- **GET /monitor/stats**
  - Task statistics
  - Response: 200 OK with counts per status

## Adding New Task Types

To add a new task type:

1. Create a new handler class in `apps/workers/src/worker/handlers/` that implements the `TaskHandler` interface
2. Register the handler in the `WorkerModule`
3. Submit tasks via the API using the new task name

Example:

```typescript
@Injectable()
export class MyNewTaskHandler implements TaskHandler, OnModuleInit {
  static readonly TASK_NAME = 'my-new-task';

  constructor(
    private readonly logger: LoggerService,
    private readonly taskRegistry: TaskRegistryService,
  ) {}

  onModuleInit() {
    this.taskRegistry.register(MyNewTaskHandler.TASK_NAME, this);
  }

  async execute(payload: any, taskId: string): Promise<void> {
    // Implement task logic here
  }
}
```

## Error Handling & Retries

The system implements exponential backoff with jitter for retries:

- Failed tasks are retried automatically based on their `max_retries` setting
- Retry delay increases exponentially with each attempt
- Random jitter is added to prevent thundering herd problems
- Permanent failures (after max retries) are logged for investigation

## License

This project is [MIT licensed](LICENSE).
