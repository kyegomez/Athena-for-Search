export class WorkerPool {
    private workers: (() => Promise<any>)[] = [];
    private maxWorkers: number;
  
    constructor(maxWorkers: number) {
      this.maxWorkers = maxWorkers;
    }
  
    async execute(tasks: (() => Promise<any>)[]): Promise<any[]> {
      const results: any[] = [];
      for (const task of tasks) {
        this.workers.push(task);
        if (this.workers.length >= this.maxWorkers) {
          const result = await Promise.all(this.workers.map((worker) => worker()));
          results.push(...result);
          this.workers = [];
        }
      }
      if (this.workers.length > 0) {
        const remainingResults = await Promise.all(this.workers.map((worker) => worker()));
        results.push(...remainingResults);
      }
      return results;
    }
}

