/**
 * Ambient modules for packages without perfect Next/TS resolution.
 */
declare module "mammoth" {
  export function extractRawText(input: {
    arrayBuffer: ArrayBuffer;
  }): Promise<{ value: string; messages: unknown[] }>;
}
