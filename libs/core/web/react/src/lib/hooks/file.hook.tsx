import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CreateFileDto,
  CreatePresignedPostBody,
  FileMinViewDto,
  PresignedGetResultDto,
  PresignedPostResultDto,
  FileDetailsDto,
} from '@keepcloud/commons/dtos';
import { ApiError, FileService } from '../services';
import { toast } from 'sonner';
import { useGetActiveFolder } from './folder.hook';
import { FileHelper } from '@keepcloud/commons/helpers';
import { useRefreshStorageData, useRefreshSuggestions } from './storage.hook';
import { queryKeys } from '../query-keys';
import { insertFileToList } from './use-file-list-updater.hook';

interface UploadFileProps {
  onProgress?: (progress: number, file: File) => void;
}

interface FileWithUploadMeta extends FileMinViewDto {
  __uploadTargetParentId?: string;
}

export const useUploadFile = ({ onProgress }: UploadFileProps) => {
  const { mutateAsync: getPresignedPost } = useGetPresignedPost();
  const { mutateAsync: createFile } = useCreateFile();
  const { activeFolder } = useGetActiveFolder();
  const queryClient = useQueryClient();

  return useMutation<
    FileWithUploadMeta,
    ApiError,
    { file: File; abortController?: AbortController }
  >({
    mutationFn: async ({ file, abortController }) => {
      // Capture the active folder at the time of operation start
      const targetParentId = FileHelper.getValidParentId(activeFolder.id);

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

              const result = await createFile({
                storagePath: presignedPost.key,
                parentId: targetParentId, // Use the folder that was active when operation started
                filename: file.name,
              });

              // Store the target parent ID in the result for the onSuccess callback
              const resultWithTargetFolder = {
                ...result,
                __uploadTargetParentId: targetParentId,
              };

              clearInterval(timer);
              onProgress?.(100, file); // Jump to 100% once done
              resolve(resultWithTargetFolder);
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

        xhr.send(file);
      });
    },
    onSuccess: (data, variables) => {
      const targetParentId = data.__uploadTargetParentId;

      insertFileToList(data, targetParentId, 'start');
      setTimeout(() => {
        if (targetParentId)
          queryClient.refetchQueries({
            queryKey: queryKeys.folder.children(targetParentId),
          });
        queryClient.refetchQueries({ queryKey: queryKeys.storage.myStorage });
      }, 1000);
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

const useCreateFile = () => {
  const refreshStorageData = useRefreshStorageData();
  const refetchSuggestedFiles = useRefreshSuggestions();

  return useMutation<FileMinViewDto, ApiError, CreateFileDto>({
    mutationFn: (dto) => FileService.create(dto),
    onSuccess: () => {
      refetchSuggestedFiles();
      refreshStorageData();
    },
  });
};

interface UseGeneratePresignedGetProps {
  fileId?: string;
  enabled?: boolean;
}
export const useGeneratePresignedGet = ({
  fileId,
  enabled = true,
}: UseGeneratePresignedGetProps) => {
  return useQuery<PresignedGetResultDto, ApiError>({
    queryKey: queryKeys.file.presignedGet(fileId as string),
    queryFn: async () => {
      return FileService.generatePresignedGet(fileId as string);
    },
    enabled: Boolean(fileId) && enabled,
    retry: false,
    staleTime: 60_000,
  });
};

interface GetFileProps {
  id: string;
  enabled?: boolean;
}

export const useGetFile = ({ id, enabled = true }: GetFileProps) => {
  return useQuery<FileDetailsDto, ApiError>({
    queryKey: queryKeys.file.detail(id),
    queryFn: () => FileService.getOne(id),
    enabled: enabled && !!id,
    retry: false,
  });
};
