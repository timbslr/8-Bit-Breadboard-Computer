declare global {
  interface Map<K, V> {
    /**
     * Concatenates two maps by summing values of the same keys.
     *
     * The map this function is called on is modified and returned.
     */
    concatBySum(this: Map<K, number>, map2: Map<K, number>): this;
  }
}

Map.prototype.concatBySum = function (map2) {
  for (const [key, intValue] of map2) {
    const previousInt = this.get(key) || 0;
    this.set(key, previousInt + intValue);
  }

  return this;
};

export {};
