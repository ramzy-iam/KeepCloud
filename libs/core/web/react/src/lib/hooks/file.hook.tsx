import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreateFileDto,
  CreatePresignedPostBody,
  FileMinViewDto,
  PresignedPostResultDto,
} from '@keepcloud/commons/dtos';
import { ApiError, FileService, KeyToInvalidate } from '../services';
import { toast } from 'sonner';
import { useGetActiveFolder } from './folder.hook';

interface UploadFileProps extends KeyToInvalidate {
  onProgress?: (progress: number, file: File) => void;
}

export const useUploadFile = ({
  keysToInvalidate,
  onProgress,
}: UploadFileProps) => {
  const { mutateAsync: getPresignedPost } = useGetPresignedPost();
  const { mutateAsync: createFile } = useCreateFile();
  const queryClient = useQueryClient();
  const { activeFolder } = useGetActiveFolder();

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
      const formData = new FormData();
      Object.entries(presignedPost.fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('file', file);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', presignedPost.url, true);

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
                parentId: activeFolder.isSystem ? null : activeFolder.id,
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

        xhr.send(formData);
      });
    },
    onSuccess: (data, variables) => {
      keysToInvalidate.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key }),
      );
    },

    onError: (error, variables) => {
      const message = error.details?.[0]?.message || 'An error occurred';
      toast.error(`Upload failed for "${variables.file.name}": ${message}`);
      keysToInvalidate.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key }),
      );
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
