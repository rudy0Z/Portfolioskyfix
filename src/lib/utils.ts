export function cn(...classes: (string | undefined | null | false | Record<string, boolean>)[]): string {
  const result: string[] = [];
  for (const c of classes) {
    if (!c) continue;
    if (typeof c === "string") {
      result.push(c);
    } else if (typeof c === "object") {
      for (const [k, v] of Object.entries(c)) {
        if (v) result.push(k);
      }
    }
  }
  return result.join(" ");
}
