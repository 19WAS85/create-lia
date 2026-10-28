const SLOT = /\{\{([a-zA-Z][a-zA-Z0-9]*)\}\}/g;

export function interpolate(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(SLOT, (_match, key: string) => {
    const value = values[key];
    if (value === undefined) {
      throw new Error(`Unknown template slot: {{${key}}}`);
    }
    return value;
  });
}
