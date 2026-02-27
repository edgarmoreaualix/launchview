export function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}
