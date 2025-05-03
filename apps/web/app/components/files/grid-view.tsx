import { File } from '@keepcloud/commons/types';
import { FileSystemItem } from './file-system-item';

interface GridViewProps {
  data: File[];
  onlyFolders?: boolean;
  group?: boolean;
}
export const GridView = ({
  data,
  onlyFolders = true,
  group = false,
}: GridViewProps) => {
  let itemsToDisplay: File[] = [];

  if (group) {
    const files = data.filter((item) => item.fileType !== 'folder');
    const folders = data.filter((item) => item.fileType === 'folder');

    return (
      <div className="flex flex-col gap-3">
        {folders.length > 0 && (
          <div>
            <h4 className="mb-2 text-16-medium text-heading">Folders</h4>
            <div className="flex flex-wrap gap-3 sm:flex-row md:gap-8">
              {folders.map((item) => (
                <FileSystemItem key={item.id} file={item} />
              ))}
            </div>
          </div>
        )}
        {files.length > 0 && (
          <div>
            <h4 className="text-16-medium-medium mb-2 text-heading">Files</h4>
            <div className="flex flex-wrap gap-3 sm:flex-row md:gap-8">
              {files.map((item) => (
                <FileSystemItem key={item.id} file={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  itemsToDisplay = onlyFolders
    ? data.filter((item) => item.fileType === 'folder')
    : data;

  return (
    <div className="flex flex-col flex-wrap gap-3 sm:flex-row md:gap-8">
      {itemsToDisplay.map((item) => (
        <FileSystemItem key={item.id} file={item} />
      ))}
    </div>
  );
};
