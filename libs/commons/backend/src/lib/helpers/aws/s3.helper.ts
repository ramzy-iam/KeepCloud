import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
  PutObjectCommandInput,
  _Object,
  GetObjectCommandOutput,
  HeadObjectCommandOutput,
  ObjectCannedACL,
  ListObjectsCommand,
  CopyObjectCommand,
  CopyObjectCommandOutput,
  PutObjectTaggingCommand,
  GetObjectTaggingCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PresignedPost, createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { Readable } from 'stream';
import { FileHelper } from '@keepcloud/commons/helpers';
import AwsServiceHelper from './base.helper';
import { Logger } from '../logger.helper';
import { DispositionType } from '@keepcloud/commons/types';

interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  acl?: string;
  encryption?: string;
  additionalParams?: Partial<PutObjectCommandInput>;
  tags?: Record<string, string>;
}

interface UploadResult {
  success: boolean;
  etag: string;
  location: string;
  key: string;
  bucket: string;
}

interface PresignedGetOptions {
  bucket: string;
  expiresIn?: number;
  contentDisposition?: DispositionType;
}

interface PresignedPostOptions {
  contentType?: string;
  maxFileSize?: number;
  acl?: string;
  expiresIn?: number;
  conditions?: any[];
  fields?: Record<string, string>;
  tags?: Record<string, string>;
}

export interface PresignedPostResult {
  url: string;
  fields: Record<string, string>;
  key: string;
  headers?: Record<string, string>;
}

interface DeleteResult {
  success: boolean;
  key: string;
  bucket: string;
}

interface FileMetadata {
  contentType?: string;
  contentLength?: number;
  lastModified?: Date;
  etag?: string;
  metadata?: Record<string, string>;
  storageClass?: string;
}

export class S3Helper extends AwsServiceHelper {
  protected client: S3Client;
  protected static instanceMap = new Map<string, S3Helper>();
  private logger = new Logger(S3Helper.name);

  protected constructor(
    accessKeyId: string,
    secretAccessKey: string,
    region: string,
  ) {
    super(accessKeyId, secretAccessKey, region);
    this.client = new S3Client({
      ...this.getCredentials(),
      region: this.getRegion(),
    });
    this.logger.debug(`S3Helper initialized for region: ${region}`);
  }

  public static getInstance(region?: string): S3Helper {
    return super._getInstance(
      S3Helper as unknown as { new (...args: any[]): S3Helper },
      region,
    );
  }

  /**
   * Upload a file to S3
   * @param key - The S3 key (file path)
   * @param body - File content
   * @param options - Upload options
   * @returns Upload result
   */
  async uploadFile(
    bucket: string,
    key: string,
    body: Buffer | Uint8Array | string | Readable,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    this.logger.debug('Starting file upload', {
      bucket,
      key,
      contentType: options.contentType,
      metadata: options.metadata ? Object.keys(options.metadata) : undefined,
      tags: options.tags,
    });

    try {
      const tagString = options.tags
        ? Object.entries(options.tags)
            .map(
              ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`,
            )
            .join('&')
        : undefined;

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: options.contentType || FileHelper.getContentType(key),
        Metadata: options.metadata || {},
        ACL: (options.acl as ObjectCannedACL) ?? 'private',
        Tagging: tagString, // ← Include tags here
        ...options.additionalParams,
      });

      const result = await this.client.send(command);
      this.logger.debug('File uploaded successfully', {
        bucket,
        key,
        etag: result.ETag,
        size: body instanceof Buffer ? body.length : undefined,
      });

      return {
        success: true,
        etag: result.ETag!,
        location: `https://${bucket}.s3.amazonaws.com/${key}`,
        key,
        bucket,
      };
    } catch (error) {
      this.logger.error('Uploading file failed', {
        bucket,
        key,
        error: (error as Error).message,
        stack: (error as Error).stack,
      });
      throw new Error(`Upload failed: ${(error as Error).message}`);
    }
  }

  /**
   *
   * @param bucketName
   * @param fileName
   * @returns
   */
  public async readFile(
    bucketName: string,
    fileName: string,
  ): Promise<GetObjectCommandOutput | undefined> {
    this.logger.debug('Reading file from S3', { bucketName, fileName });
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: fileName,
      });
      const data = await this.client.send(command);
      this.logger.debug('File read successfully', {
        bucketName,
        fileName,
        contentLength: data.ContentLength,
      });
      return data;
    } catch (error) {
      this.logger.error('Failed to read file', {
        bucketName,
        fileName,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  public async createPresignedGet(
    fileKey: string,
    {
      bucket,
      expiresIn = 3600, // 1 hour default
      contentDisposition = 'attachment',
    }: PresignedGetOptions,
  ): Promise<string> {
    this.logger.debug('Creating presigned GET URL', {
      bucket,
      fileKey,
      expiresIn,
      contentDisposition,
    });
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: fileKey,
        ResponseContentDisposition: contentDisposition,
      });
      const url = await getSignedUrl(this.client, command, {
        expiresIn,
      });
      this.logger.debug('Presigned GET URL created', {
        bucket,
        fileKey,
        url: url.substring(0, 50) + '...', // Log partial URL for security
      });
      return url;
    } catch (error) {
      this.logger.error('Failed to create presigned GET URL', {
        bucket,
        fileKey,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Create a presigned POST for browser uploads
   * @param key - The S3 key
   * @param options - POST options
   * @returns Presigned POST data
   */
  async createPresignedPost(
    bucket: string,
    key: string,
    options: PresignedPostOptions = {},
  ): Promise<Omit<PresignedPostResult, 'fields'>> {
    this.logger.debug('Creating presigned POST', {
      bucket,
      key,
      options: {
        ...options,
        maxFileSize: options.maxFileSize,
      },
    });

    try {
      let tagString = '';
      if (options.tags) {
        tagString = Object.entries(options.tags)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join('&');
      }

      const putObjectCommandParams: PutObjectCommandInput = {
        Bucket: bucket,
        Key: key,

        ...(tagString ? { Tagging: tagString } : {}),
      };

      const putObjectCommand = new PutObjectCommand(putObjectCommandParams);
      const url = await getSignedUrl(this.client, putObjectCommand, {
        unhoistableHeaders: new Set(['x-amz-tagging']),
        expiresIn: options.expiresIn || 3600,
      });

      this.logger.debug('Presigned POST created', {
        bucket,
        key,
        url,
      });

      const headers: Record<string, string> = {
        'x-amz-tagging': tagString,
      };
      return {
        url,
        key,
        headers,
      };
    } catch (error) {
      this.logger.error('Failed to create presigned POST', {
        bucket,
        key,
        error: (error as Error).message,
      });
      throw new Error(
        `Failed to create presigned POST: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Create a presigned POST for browser uploads
   * @param key - The S3 key
   * @param options - POST options
   * @returns Presigned POST data
   */
  async _createPresignedPost(
    bucket: string,
    key: string,
    options: PresignedPostOptions = {},
  ): Promise<PresignedPostResult> {
    this.logger.debug('Creating presigned POST', {
      bucket,
      key,
      options: {
        ...options,
        maxFileSize: options.maxFileSize,
      },
    });
    try {
      const DEFAULT_MAX_FILE_SIZE = FileHelper.convertToBytes(1, 'GB');
      const conditions = [
        [
          'content-length-range',
          0,
          options.maxFileSize || DEFAULT_MAX_FILE_SIZE,
        ],
        ...(options.conditions || []),
      ];

      const fields = {
        'Content-Type': options.contentType || FileHelper.getContentType(key),
        acl: options.acl || 'private',
        ...(options.fields || {}),
      };

      const presignedPost: PresignedPost = await createPresignedPost(
        this.client,
        {
          Bucket: bucket,
          Key: key,
          Conditions: conditions,
          Fields: fields,
          Expires: options.expiresIn || 3600,
        },
      );

      this.logger.debug('Presigned POST created', {
        bucket,
        key,
        url: presignedPost.url,
        fields: Object.keys(presignedPost.fields),
      });

      return {
        url: presignedPost.url,
        fields: presignedPost.fields,
        key,
      };
    } catch (error) {
      this.logger.error('Failed to create presigned POST', {
        bucket,
        key,
        error: (error as Error).message,
      });
      throw new Error(
        `Failed to create presigned POST: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Delete a file from S3
   * @param key - The S3 key
   * @param options - Delete options
   * @returns Delete result
   */
  async deleteFile(bucket: string, key: string): Promise<DeleteResult> {
    this.logger.debug('Deleting file from S3', { bucket, key });
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await this.client.send(command);
      this.logger.debug('File deleted successfully', { bucket, key });

      return {
        success: true,
        key,
        bucket,
      };
    } catch (error) {
      this.logger.error('Failed to delete file', {
        bucket,
        key,
        error: (error as Error).message,
      });
      throw new Error(`Delete failed: ${(error as Error).message}`);
    }
  }

  /**
   * Delete multiple files from S3 in a single batch operation (up to 1000 files)
   * @param bucket - The bucket name
   * @param keys - Array of S3 keys to delete
   * @returns Results with successful and failed deletions
   */
  async deleteMultipleFiles(
    bucket: string,
    keys: string[],
  ): Promise<{
    successfulDeletes: string[];
    errors: Array<{ key: string; code?: string; message?: string }>;
  }> {
    this.logger.debug('Deleting multiple files from S3', {
      bucket,
      fileCount: keys.length,
    });

    if (keys.length === 0) {
      return { successfulDeletes: [], errors: [] };
    }

    if (keys.length > 1000) {
      throw new Error('Cannot delete more than 1000 objects in a single batch');
    }

    try {
      const command = new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: keys.map((key) => ({ Key: key })),
          Quiet: false, // Return info about both successful and failed deletes
        },
      });

      const result = await this.client.send(command);

      const successfulDeletes =
        result.Deleted?.map((obj) => obj.Key).filter(
          (key): key is string => typeof key === 'string',
        ) || [];
      const errors =
        result.Errors?.map((error) => ({
          key: error.Key!,
          code: error.Code,
          message: error.Message,
        })) || [];

      this.logger.debug('Batch delete completed', {
        bucket,
        successful: successfulDeletes.length,
        failed: errors.length,
      });

      if (errors.length > 0) {
        this.logger.warn('Some files failed to delete', {
          bucket,
          failedFiles: errors,
        });
      }

      return { successfulDeletes, errors };
    } catch (error) {
      this.logger.error('Failed to delete multiple files', {
        bucket,
        fileCount: keys.length,
        error: (error as Error).message,
      });
      throw new Error(`Batch delete failed: ${(error as Error).message}`);
    }
  }

  /**
   * Check if a file exists in S3
   * @param key - The S3 key
   * @param options - Options
   * @returns Whether file exists
   */
  async fileExists(bucket: string, key: string): Promise<boolean> {
    this.logger.debug('Checking if file exists', {
      key,
      bucket,
    });
    try {
      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await this.client.send(command);
      this.logger.debug('File exists', { bucket, key });
      return true;
    } catch (error: any) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        this.logger.debug('File does not exist', {
          key,

          bucket,
        });
        return false;
      }
      this.logger.error('Error checking file existence', {
        key,
        bucket,
        error: error.message,
      });
      throw error;
    }
  }

  /***
   *  @param bucketName: string
   *  @param prefix: string
   *  @return Contents of all files
   */
  public async listObjectsFromBucket(
    bucketName: string,
    prefix: string,
  ): Promise<_Object[] | undefined> {
    this.logger.debug('Listing objects from bucket', { bucketName, prefix });
    try {
      const command = new ListObjectsCommand({
        Bucket: bucketName,
        EncodingType: 'url',
        Delimiter: '/',
        Prefix: prefix,
      });
      const data = await this.client.send(command);
      this.logger.debug('Objects listed successfully', {
        bucketName,
        prefix,
        count: data.Contents?.length,
      });
      return data.Contents;
    } catch (error) {
      this.logger.error('Failed to list objects', {
        bucketName,
        prefix,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Get file metadata without downloading
   * @param key - The S3 key
   * @param options - Options
   * @returns File metadata
   */
  public async getFileMetadata(
    bucket: string,
    key: string,
  ): Promise<FileMetadata> {
    this.logger.debug('Getting file metadata', { bucket, key });
    try {
      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response: HeadObjectCommandOutput = await this.client.send(command);

      this.logger.debug('Retrieved file metadata', {
        bucket,
        key,
        metadata: {
          contentType: response.ContentType,
          contentLength: response.ContentLength,
          lastModified: response.LastModified,
        },
      });

      return {
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
        etag: response.ETag,
        metadata: response.Metadata,
        storageClass: response.StorageClass,
      };
    } catch (error) {
      this.logger.error('Failed to get file metadata', {
        bucket,
        key,
        error: (error as Error).message,
      });
      throw new Error(`Get metadata failed: ${(error as Error).message}`);
    }
  }

  /**
   * Get file from S3 and return it as a buffer
   * @param bucketName The name of the S3 bucket
   * @param fileKey The key (path) of the file in S3
   * @returns Promise<Buffer> The file content as a Buffer
   */
  public async getFileAsBuffer(
    bucketName: string,
    fileKey: string,
  ): Promise<Buffer> {
    this.logger.debug('Getting file as buffer', { bucketName, fileKey });
    try {
      const fileData = await this.readFile(bucketName, fileKey);

      if (!fileData?.Body) {
        this.logger.error('File content is empty', { bucketName, fileKey });
        throw new Error('File content is empty');
      }

      const byteArray = await fileData.Body.transformToByteArray();
      const buffer = Buffer.from(byteArray);
      this.logger.debug('File retrieved as buffer', {
        bucketName,
        fileKey,
        size: buffer.length,
      });
      return buffer;
    } catch (error) {
      this.logger.error('Failed to get file as buffer', {
        bucketName,
        fileKey,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  public async copyFile(
    destinationBucket: string,
    key: string,
    oldSource: string,
    acl: ObjectCannedACL = 'private',
  ): Promise<CopyObjectCommandOutput> {
    try {
      const command = new CopyObjectCommand({
        Bucket: destinationBucket,
        Key: key,
        CopySource: oldSource,
        ACL: acl,
      });
      return await this.client.send(command);
    } catch (error) {
      this.logger.error(
        `We faced this error while copying the object ${error}}`,
      );
      throw error;
    }
  }

  /**
   * Add or update tags on an existing S3 object
   * @param bucket - The bucket name
   * @param key - The object key
   * @param tags - Key-value pairs of tags
   */
  public async putObjectTagging(
    bucket: string,
    key: string,
    tags: Record<string, string>,
  ): Promise<void> {
    this.logger.debug('Setting object tags', {
      bucket,
      key,
      tags,
    });

    try {
      const tagSet = Object.entries(tags).map(([Key, Value]) => ({
        Key,
        Value,
      }));

      const command = new PutObjectTaggingCommand({
        Bucket: bucket,
        Key: key,
        Tagging: {
          TagSet: tagSet,
        },
      });

      await this.client.send(command);

      this.logger.debug('Object tags set successfully', {
        bucket,
        key,
        tagCount: tagSet.length,
      });
    } catch (error) {
      this.logger.error('Failed to set object tags', {
        bucket,
        key,
        error: (error as Error).message,
      });
      throw new Error(`Tagging failed: ${(error as Error).message}`);
    }
  }

  /**
   * Remove all tags from an S3 object
   * @param bucket - The bucket name
   * @param key - The object key
   */
  public async removeAllObjectTags(bucket: string, key: string): Promise<void> {
    this.logger.debug('Removing all object tags', {
      bucket,
      key,
    });

    try {
      const command = new PutObjectTaggingCommand({
        Bucket: bucket,
        Key: key,
        Tagging: {
          TagSet: [],
        },
      });

      await this.client.send(command);
      this.logger.debug('All object tags removed successfully', {
        bucket,
        key,
      });
    } catch (error) {
      this.logger.error('Failed to remove all object tags', {
        bucket,
        key,
        error: (error as Error).message,
      });
      throw new Error(`Remove tags failed: ${(error as Error).message}`);
    }
  }

  /**
   * Remove specific tags from an S3 object
   * @param bucket - The bucket name
   * @param key - The object key
   * @param tagKeys - Array of tag keys to remove
   */
  public async removeObjectTags(
    bucket: string,
    key: string,
    tagKeys: string[],
  ): Promise<void> {
    this.logger.debug('Removing specific object tags', {
      bucket,
      key,
      tagKeys,
    });

    try {
      // First get existing tags
      const existingTags = await this.getObjectTags(bucket, key);

      // Filter out the tags we want to remove
      const updatedTags = Object.entries(existingTags || {})
        .filter(([key]) => !tagKeys.includes(key))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      // Update the object with remaining tags
      await this.putObjectTagging(bucket, key, updatedTags);

      this.logger.debug('Specific object tags removed successfully', {
        bucket,
        key,
        removedTags: tagKeys,
        remainingTags: Object.keys(updatedTags),
      });
    } catch (error) {
      this.logger.error('Failed to remove specific object tags', {
        bucket,
        key,
        tagKeys,
        error: (error as Error).message,
      });
      throw new Error(
        `Remove specific tags failed: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Get all tags for an S3 object
   * @param bucket - The bucket name
   * @param key - The object key
   * @returns Object with tag key-value pairs
   */
  public async getObjectTags(
    bucket: string,
    key: string,
  ): Promise<Record<string, string> | undefined> {
    this.logger.debug('Getting object tags', {
      bucket,
      key,
    });

    try {
      const command = new GetObjectTaggingCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await this.client.send(command);
      const tags = response.TagSet?.reduce(
        (acc, tag) => {
          const key = tag.Key as string;
          acc[key] = tag.Value as string;
          return acc;
        },
        {} as Record<string, string>,
      );

      this.logger.debug('Retrieved object tags', {
        bucket,
        key,
        tagCount: response.TagSet?.length,
      });

      return tags;
    } catch (error) {
      this.logger.error('Failed to get object tags', {
        bucket,
        key,
        error: (error as Error).message,
      });
      throw new Error(`Get tags failed: ${(error as Error).message}`);
    }
  }
}
