Map.prototype.concatBySum = function (map2) {
  for (const [key, intValue] of map2) {
    const previousInt = this.get(key) || 0;
    this.set(key, previousInt + intValue);
  }

  return this;
};
