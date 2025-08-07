import { useMutation, useQuery } from '@tanstack/react-query';
import {
  CreateFileDto,
  CreatePresignedPostBody,
  FileMinViewDto,
  PresignedGetResultDto,
  PresignedPostResultDto,
} from '@keepcloud/commons/dtos';
import { ApiError, FileService } from '../services';
import { toast } from 'sonner';
import { useGetActiveFolder } from './folder.hook';
import { useFileListUpdater } from './use-file-list-updater.hook';
import { FileHelper } from '@keepcloud/commons/helpers';
import { useRefreshStorageData } from './storage.hook';

interface UploadFileProps {
  onProgress?: (progress: number, file: File) => void;
}

export const useUploadFile = ({ onProgress }: UploadFileProps) => {
  const { mutateAsync: getPresignedPost } = useGetPresignedPost();
  const { mutateAsync: createFile } = useCreateFile();
  const { activeFolder } = useGetActiveFolder();
  const parentId = activeFolder.id;
  const refreshStorageData = useRefreshStorageData();

  const finalParentId = FileHelper.getValidParentId(parentId);
  const { insertItem } = useFileListUpdater(finalParentId);

  return useMutation<
    FileMinViewDto,
    ApiError,
    { file: File; abortController?: AbortController }
  >({
    mutationFn: async ({ file, abortController }) => {
      // Step 1: Get presigned URL
      onProgress?.(5, file);
      const presignedPost = await getPresignedPost({ filename: file.name });

      // Step 2: Upload to S3 with progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open('PUT', presignedPost.url, true);

        // Set headers for PUT request with tagging
        if (presignedPost.headers) {
          Object.entries(presignedPost.headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        // Set content type for the file
        xhr.setRequestHeader(
          'Content-Type',
          file.type || 'application/octet-stream',
        );
        // Handle abort signal
        abortController?.signal.addEventListener('abort', () => {
          xhr.abort();
          reject(new Error('Upload cancelled'));
        });

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            // Progress scaled 5% to 90%
            const uploadProgress = Math.round(
              (event.loaded / event.total) * 85,
            );
            onProgress?.(5 + uploadProgress, file);
          }
        };

        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              // Start progress at 90%
              let currentProgress = 90;
              onProgress?.(currentProgress, file);

              // Smooth increment from 90 to 95 while createFile runs
              const targetProgress = 95;
              const increment = 1;
              const intervalMs = 100;

              const timer = setInterval(() => {
                if (currentProgress < targetProgress) {
                  currentProgress += increment;
                  if (currentProgress > targetProgress)
                    currentProgress = targetProgress;
                  onProgress?.(currentProgress, file);
                }
              }, intervalMs);

              // Wait for backend createFile call
              const result = await createFile({
                storagePath: presignedPost.key,
                parentId: activeFolder.id,
                filename: file.name,
              });

              clearInterval(timer);
              onProgress?.(100, file); // Jump to 100% once done
              resolve(result);
            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error('Failed to upload file to S3'));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.onabort = () => reject(new Error('Upload canceled'));

        if (abortController) {
          abortController.signal.addEventListener('abort', () => {
            xhr.abort();
          });
        }

        // Send the raw file data for PUT request
        xhr.send(file);
      });
    },
    onSuccess: (data, variables) => {
      insertItem(data, 'start');
      refreshStorageData();
    },

    onError: (error, variables) => {
      const message = error.details?.[0]?.message || 'An error occurred';
      toast.error(`Upload failed for "${variables.file.name}": ${message}`);
    },
  });
};

const useGetPresignedPost = () =>
  useMutation<PresignedPostResultDto, ApiError, CreatePresignedPostBody>({
    mutationFn: (dto) => FileService.getPresignedPost(dto),
  });

const useCreateFile = () =>
  useMutation<FileMinViewDto, ApiError, CreateFileDto>({
    mutationFn: (dto) => FileService.create(dto),
  });

interface UseGeneratePresignedGetProps {
  fileId?: string;
  enabled?: boolean;
}
export const useGeneratePresignedGet = ({
  fileId,
  enabled = true,
}: UseGeneratePresignedGetProps) => {
  return useQuery<PresignedGetResultDto, ApiError>({
    queryKey: ['file', fileId, 'presigned-get'],
    queryFn: async () => {
      return FileService.generatePresignedGet(fileId as string);
    },
    enabled: Boolean(fileId) && enabled,
    retry: false,
    staleTime: 60_000,
  });
};
