import { parentPort, workerData } from 'worker_threads';

// This script runs in a worker thread.
// It receives the task type and data from the main thread.
// Sends a message back to the main thread to perform the actual operation.
// Then waits for the result and sends it back to the main thread.

async function main() {
  const { taskId, taskName, type, payload } = workerData;

  try {
    // Send a message to the main thread to perform the actual operation
    parentPort.postMessage({
      type: 'execute',
      taskId,
      taskName,
      taskType: type,
      data: payload
    });

    // Wait for the result from the main thread
    const result = await new Promise((resolve, reject) => {
      parentPort.on('message', (message) => {
        if (message.type === 'result') {
          resolve(message.data);
        } else if (message.type === 'error') {
          reject(new Error(message.error));
        }
      });
    });

    // Send the result back to the main thread
    parentPort.postMessage({
      type: 'complete',
      data: result
    });
  } catch (error) {
    // Send the error back to the main thread
    parentPort.postMessage({
      type: 'error',
      error: error.message,
      stack: error.stack
    });
  }
}

main().catch(() => {
  process.exit(1);
});
