import { TableView, GridView } from '../../../components';
import { files, folders } from '@keepcloud/commons/types';

export default function ExplorerComponent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h3 className="sticky -top-[1px] z-[1] bg-background p-1.5 text-18-medium text-heading">
          Suggested Folders
        </h3>
        <GridView data={folders} />
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="sticky -top-[1px] z-[1] bg-background p-1.5 text-18-medium text-heading">
          Suggested Files
        </h3>
        <TableView data={files} />
      </div>
    </div>
  );
}
