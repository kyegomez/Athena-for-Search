/**
 * Represents a worker pool that can execute tasks concurrently.
 */
export class WorkerPool {
  private workers: (() => Promise<any>)[] = [];
  private maxWorkers: number;

  /**
   * Creates a new instance of WorkerPool.
   * @param maxWorkers The maximum number of workers in the pool.
   */
  constructor(maxWorkers: number) {
    this.maxWorkers = maxWorkers;
  }

  /**
   * Executes an array of tasks concurrently using the worker pool.
   * @param tasks An array of tasks to be executed.
   * @returns A promise that resolves to an array of results from the tasks.
   */
  async execute(tasks: (() => Promise<any>)[]): Promise<any[]> {
    const results: any[] = [];
    for (const task of tasks) {
      this.workers.push(task);
      if (this.workers.length >= this.maxWorkers) {
        const workerPromises = this.workers.map((worker) => worker());
        try {
          const workerResults = await Promise.allSettled(workerPromises);
          for (const result of workerResults) {
            if (result.status === 'fulfilled') {
              results.push(result.value);
            } else {
              // Handle error here
              console.error(result.reason);
            }
          }
        } catch (error) {
          // Handle error here
          console.error(error);
        }
        this.workers = [];
      }
    }
    if (this.workers.length > 0) {
      const remainingPromises = this.workers.map((worker) => worker());
      try {
        const remainingResults = await Promise.allSettled(remainingPromises);
        for (const result of remainingResults) {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            // Handle error here
            console.error(result.reason);
          }
        }
      } catch (error) {
        // Handle error here
        console.error(error);
      }
    }
    return results;
  }
}
