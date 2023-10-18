export default class Queue {
  private running = false;
  private queue: (() => Promise<any>)[] = [];
  constructor(private parallel = 1) {}

  run = async () => {
    if (!this.queue.length || this.running) return;
    this.running = true;
    const promises: Promise<any>[] = [];
    for (let i = 0; i < this.parallel; i++) {
      const fx = this.queue.shift();
      if (!fx) break;
      promises.push(fx());
    }
    await Promise.all(promises);
    this.running = false;
    this.run();
  };

  x = <T extends any>(fx: () => T | Promise<T>): Promise<Awaited<T>> =>
    new Promise((r) => {
      this.queue.push(async () => r(await fx()));
      this.run();
    });
}
