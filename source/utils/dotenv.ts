export namespace Dotenv {
  export function getString(key: string): string {
    const value = process.env[key];

    if (!value || value.trim() === '')
      throw new Error(`Missing required environment variable: ${key}`);

    return value;
  }
}
