Map.prototype.concatBySum = function (map2) {
  const mergedMap = new Map(this);
  for (const [key, intValue] of map2) {
    const previousInt = this.get(key) || 0;
    mergedMap.set(key, previousInt + intValue);
  }

  return mergedMap;
};
