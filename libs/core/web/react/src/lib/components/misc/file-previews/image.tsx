import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const ImagePreview = ({
  url,
  file,
}: {
  url: string;
  file: FileMinViewDto;
}) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error('Image URL expired or invalid. Please try again.');
    }
  }, [error]);

  return (
    <img
      src={url}
      alt={file.name}
      className="max-h-[70vh] max-w-full object-contain"
      onError={() => setError(true)}
    />
  );
};
