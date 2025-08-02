import { MimeTypes, SYSTEM_FILE } from '../../constants/file.constant';

export class FileHelper {
  getContentType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return MimeTypes[extension || ('' as any)] ?? 'application/octet-stream';
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

  formatBytes(bytes: number, decimals = 1, forceUnit?: string): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

    if (forceUnit) {
      const unitIndex = sizes.indexOf(forceUnit.toUpperCase());
      if (unitIndex !== -1) {
        const sizedValue = bytes / Math.pow(k, unitIndex);
        return `${sizedValue.toFixed(dm)} ${sizes[unitIndex]}`;
      }
    }

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const sizedValue = bytes / Math.pow(k, i);

    return `${sizedValue.toFixed(dm)} ${sizes[i]}`;
  }

  isUploadComplete(progress: number): boolean {
    return progress === 100;
  }

  isSystemFile(fileId?: string) {
    const systemFileIds = Object.values(SYSTEM_FILE).map((file) => file.id);

    return systemFileIds.some((id) => id === fileId);
  }

  isRootFolder(fileId: string) {
    return (
      fileId === SYSTEM_FILE.MY_STORAGE.id ||
      fileId === SYSTEM_FILE.MY_STORAGE.code
    );
  }

  getValidParentId(parentId: string | undefined | null): string {
    if (!parentId || this.isSystemFile(parentId)) {
      return SYSTEM_FILE.MY_STORAGE.id;
    }

    return parentId;
  }

  getSystemFileName(fileCode: string): string {
    const systemFile = Object.values(SYSTEM_FILE).find(
      (file) => file.code === fileCode,
    );
    return systemFile ? systemFile.name : '';
  }

  /**
   * Extract the unit from a bytes value for consistent formatting
   * @param bytes - The bytes value to get unit for
   * @returns The unit (B, KB, MB, GB, TB)
   */
  getUnit(bytes: number): string {
    if (bytes === 0) return 'B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return sizes[i];
  }

  /**
   * Format used and total storage with consistent units
   * @param usedBytes - Used storage in bytes
   * @param totalBytes - Total storage in bytes
   * @param decimals - Number of decimal places
   * @returns Object with formatted used and total storage with consistent units
   */
  formatStorageConsistent(
    usedBytes: number,
    totalBytes: number,
    usedBytesDecimals = 0,
    totalBytesDecimals = 0,
  ): { used: string; total: string; unit: string } {
    const totalUnit = this.getUnit(totalBytes);
    const usedFormatted = this.formatBytes(
      usedBytes,
      usedBytesDecimals,
      totalUnit,
    );
    const totalFormatted = this.formatBytes(totalBytes, totalBytesDecimals);

    return {
      used: usedFormatted,
      total: totalFormatted,
      unit: totalUnit,
    };
  }
}

export default new FileHelper();
