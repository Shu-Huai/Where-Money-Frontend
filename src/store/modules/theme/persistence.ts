export function resolveThemeTabVisible(savedValue: unknown, defaultValue: boolean): boolean {
    return typeof savedValue === "boolean" ? savedValue : defaultValue;
}
