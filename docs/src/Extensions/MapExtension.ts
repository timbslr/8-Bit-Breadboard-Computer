declare global {
  interface Map<K, V> {
    /**
     * Concatenates two maps by summing the quantities of the same keys and taking the union of the originLists with the same keys
     *
     * The map this function is called on is modified and returned.
     */
    concatPartMap(this: Map<K, { quantity: number; originList: Set<string> }>, map2: Map<K, { quantity: number; originList: Set<string> }>): this;
  }
}

Map.prototype.concatPartMap = function (map2) {
  for (const [key, { quantity, originList }] of map2) {
    const previousQuantity = this.get(key)?.quantity || 0;
    const newQuantity = previousQuantity + quantity;

    const previousOriginList = this.get(key)?.originList || new Set<string>();
    const newOriginList = new Set<string>([...previousOriginList, ...originList]);

    this.set(key, { quantity: newQuantity, originList: newOriginList });
  }

  return this;
};

export {};
