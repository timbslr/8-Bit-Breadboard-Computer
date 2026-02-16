export interface Statistic<T> {
  readonly name: string;
  value(): T;
  formatted(): string;
}
