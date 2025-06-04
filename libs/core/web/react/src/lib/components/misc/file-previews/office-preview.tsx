import { toast } from 'sonner';

export const OfficePreview = ({ url }: { url: string }) => {
  const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;

  return (
    <iframe
      src={viewerUrl}
      title="DOC Preview"
      className="h-full w-full rounded border"
      onError={() => toast.error('Failed to load document preview')}
    />
  );
};
