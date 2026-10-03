type ClassNamePart = string | false | null | undefined;

export function joinClassNames(...parts: ClassNamePart[]): string {
  return parts.filter(Boolean).join(' ');
}
