import { File } from '@keepcloud/commons/types';
import { FileSystemItem } from './file-system-item';

interface GridViewProps {
  data: File[];
}

export const GridView = ({ data }: GridViewProps) => {
  const sortedItems = [...data].sort((a, b) => {
    if (a.isFolder === b.isFolder) return 0;
    return a.isFolder ? -1 : 1;
  });

  return (
    <div className="flex flex-col flex-wrap gap-3 sm:flex-row md:gap-8">
      {sortedItems.map((item) => (
        <FileSystemItem key={item.id} file={item} />
      ))}
    </div>
  );
};
