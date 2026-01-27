declare global {
  interface Array<T> {
    sum(this: Array<T>): number;
  }
}

Array.prototype.sum = function () {
  return this.reduce((acc, curr) => acc + curr, 0);
};

export {};
