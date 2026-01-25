export interface InstructionStatistic<T> {
  readonly name: string;
  value(): T;
  formatted(): string;
}
