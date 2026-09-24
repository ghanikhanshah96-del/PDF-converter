/** Soft browser-side limit for client PDF tools (bytes). */
export const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB

export const MAX_FILE_LABEL = "50 MB";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileTooLargeMessage(fileName: string, size: number): string {
  return `"${fileName}" is ${formatBytes(size)}. Maximum file size is ${MAX_FILE_LABEL}. Please choose a smaller file or compress it first.`;
}

export function assertFilesWithinLimit(files: File[]): void {
  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      throw new Error(fileTooLargeMessage(file.name, file.size));
    }
  }
}
