import { toast } from 'sonner';

export const PDFPreview = ({ url }: { url: string }) => {
  const googleViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;

  return (
    <iframe
      src={googleViewerUrl}
      title="PDF Preview"
      className="h-full w-full rounded border"
      allow="fullscreen"
      onError={() => toast.error('Failed to load PDF preview')}
    />
  );
};
