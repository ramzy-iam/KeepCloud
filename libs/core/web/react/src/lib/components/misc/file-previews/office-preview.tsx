import { toast } from 'sonner';

function getViewerUrl(url: string): string {
  const lower = url.toLowerCase();

  if (lower.includes('.xls') || lower.includes('.xlsx')) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  }

  if (
    lower.includes('.doc') ||
    lower.includes('.docx') ||
    lower.includes('.ppt') ||
    lower.includes('.pptx')
  ) {
    return `https://docs.google.com/gview?url=${encodeURIComponent(
      url,
    )}&embedded=true`;
  }

  return url;
}

export const OfficePreview = ({ url }: { url: string }) => {
  const viewerUrl = getViewerUrl(url);

  return (
    <iframe
      src={viewerUrl}
      title="Document Preview"
      className="h-full w-full rounded border"
      onError={() => toast.error('Failed to load document preview')}
    />
  );
};
