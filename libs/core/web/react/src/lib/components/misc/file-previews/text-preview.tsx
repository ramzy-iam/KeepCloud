import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const TextPreview = ({ url }: { url: string }) => {
  const [text, setText] = useState('');

  useEffect(() => {
    fetch(url)
      .then((res) => res.text())
      .then(setText)
      .catch(() => toast.error('Failed to load TXT preview'));
  }, [url]);

  return (
    <pre className="h-full max-h-full w-full overflow-auto rounded bg-gray-50 p-4 whitespace-pre-wrap text-neutral-900">
      {text}
    </pre>
  );
};
