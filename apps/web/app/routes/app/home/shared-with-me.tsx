import { TableView } from '../../../components';
import { files } from '@keepcloud/commons/types';

export default function SharedWithMeComponent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h3 className="sticky -top-[1px] z-[1] bg-background p-1.5 text-18-medium text-heading">
          Shared with me
        </h3>
        <TableView data={files} />
      </div>
    </div>
  );
}
