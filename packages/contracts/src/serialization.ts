function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  if (obj === null) {
    return null;
  }
  if (typeof obj === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    if (typeof obj === 'number' && !Number.isFinite(obj)) {
      throw new Error(`Non-finite numbers are not allowed in canonical serialization: ${obj}`);
    }
    return obj;
  }
  throw new Error(`Unsupported serialization type: ${typeof obj}`);
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(sortObjectKeys(value));
}
