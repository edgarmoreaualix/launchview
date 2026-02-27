export class TTLCache<T> {
  private readonly ttlMs: number;
  private value: T | null = null;
  private expiresAt = 0;

  constructor(ttlMs: number) {
    this.ttlMs = ttlMs;
  }

  get(): T | null {
    if (this.value === null) {
      return null;
    }

    if (Date.now() >= this.expiresAt) {
      this.clear();
      return null;
    }

    return this.value;
  }

  set(value: T): void {
    this.value = value;
    this.expiresAt = Date.now() + this.ttlMs;
  }

  clear(): void {
    this.value = null;
    this.expiresAt = 0;
  }
}
