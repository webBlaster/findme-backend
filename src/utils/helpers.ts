// Utility functions for the backend

export function generateId(): string {
  return crypto.randomUUID();
}

export function parseJson<T>(jsonString: string): T {
  return JSON.parse(jsonString) as T;
}

export function stringifyJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
