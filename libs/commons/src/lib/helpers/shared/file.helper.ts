import { MimeTypes } from '../../constants/file.constant';

export class FileHelper {
  getContentType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return MimeTypes[extension || ''] ?? 'application/octet-stream';
  }

  /**
   * Convert a number to bytes based on the provided unit.
   * @param value - The numeric value to convert.
   * @param unit - The unit of measurement ('KB', 'MB', 'GB', 'TB').
   * @returns The value in bytes.
   */
  convertToBytes(value: number, unit: 'KB' | 'MB' | 'GB' | 'TB'): number {
    const unitsMap: Record<string, number> = {
      KB: 1024,
      MB: Math.pow(1024, 2),
      GB: Math.pow(1024, 3),
      TB: Math.pow(1024, 4),
    };

    if (!unitsMap[unit]) {
      throw new Error(`Invalid unit: ${unit}. Use 'KB', 'MB', 'GB', or 'TB'.`);
    }

    return value * unitsMap[unit];
  }

  /**
   * Splits a filename or file key to get the name and extension.
   * Handles keys like 'files/<fileId>/report.final.v1.pdf'.
   * @param fileKey - The full filename or S3 key.
   * @returns An object with name and format.
   */
  splitNameAndFormat(fileKey: string): { name: string; format: string } {
    const parts = fileKey.split('/');
    const fileName = parts[parts.length - 1];

    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return { name: fileName, format: '' };
    }

    return {
      name: fileName.substring(0, lastDotIndex),
      format: fileName.substring(lastDotIndex + 1).toLowerCase(),
    };
  }

  formatBytes(bytes: number, decimals = 1): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const sizedValue = bytes / Math.pow(k, i);

    return `${sizedValue.toFixed(dm)} ${sizes[i]}`;
  }
}

export default new FileHelper();
