export namespace Dotenv {
  export function getString(key: string): string {
    const value = process.env[key];

    if (!value || value.trim() === '')
      throw new Error(`Missing required environment variable: ${key}`);

    return value;
  }

  export function getNumber(key: string): number {
    const value = process.env[key];

    if (!value || value.trim() === '')
      throw new Error(`Missing required environment variable: ${key}`);

    return Number(value);
  }

  export function getArray(key: string, separator: string = ','): string[] {
    const value = process.env[key];

    if (!value || value.trim() === '')
      throw new Error(`Missing required environment variable: ${key}`);

    return value.split(separator);
  }
}
