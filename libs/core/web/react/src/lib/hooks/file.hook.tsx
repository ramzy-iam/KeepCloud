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

interface UploadFileProps extends KeyToInvalidate {}

const useGetPresignedPost = () => {
  return useMutation<PresignedPostResultDto, ApiError, CreatePresignedPostBody>(
    {
      mutationFn: async (dto) => FileService.getPresignedPost(dto),
    },
  );
};

const useCreateFile = () => {
  return useMutation<FileMinViewDto, ApiError, CreateFileDto>({
    mutationFn: async (dto) => FileService.create(dto),
  });
};

export const useUploadFile = ({ keysToInvalidate }: UploadFileProps) => {
  const { mutateAsync: getPresignedPost } = useGetPresignedPost();
  const { mutateAsync: createFile } = useCreateFile();
  const queryClient = useQueryClient();
  const { activeFolder } = useGetActiveFolder();

  return useMutation<FileMinViewDto, ApiError, { file: File }>({
    mutationFn: async ({ file }) => {
      // 1. Get presigned URL
      const presignedPost = await getPresignedPost({
        filename: file.name,
      });

      // 2. Upload to S3
      const formData = new FormData();
      Object.entries(presignedPost.fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('file', file);

      const uploadResponse = await fetch(presignedPost.url, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
      }

      // 3. Save file in database
      return createFile({
        storagePath: presignedPost.key,
        parentId: activeFolder.isSystem ? null : activeFolder.id,
        filename: file.name,
      });
    },
    onSuccess: () => {
      toast.success('File uploaded successfully');
    },
    onError: (error) => {
      const message = error.details[0]?.message || 'An error occurred';
      toast.error(`Upload failed: ${message}`);
    },
    onSettled: () => {
      keysToInvalidate.map((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};
