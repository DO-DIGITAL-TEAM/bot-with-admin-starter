export function enumToArray<T extends Record<string, string>>(e: T): string[] {
  return Object.values(e);
}
