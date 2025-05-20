import { SYSTEM_FILE } from '@keepcloud/commons/constants';
import {
  TrashEmpty,
  FolderView,
  TrashedSystemItem,
} from '../../../../components';
import { columns } from './columns';
import { useGetTrashedItems } from '@keepcloud/web-core/react';
import { ColumnDef } from '@tanstack/react-table';
import { FileMinViewDto } from '@keepcloud/commons/dtos';

export default function TrashComponent() {
  const { data, isLoading } = useGetTrashedItems();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <FolderView
          items={data?.items}
          title={SYSTEM_FILE.TRASH.name}
          columns={columns as ColumnDef<FileMinViewDto>[]}
          defaultViewMode="table"
          isLoading={isLoading}
          noDataComponent={<TrashEmpty />}
          CustomFileSystemItem={TrashedSystemItem}
        />
      </div>
    </div>
  );
}
