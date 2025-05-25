import { ChevronDown, ChevronUp, Folder, X } from 'lucide-react';
import {
  Button,
  CircularProgress,
  TooltipProviderWrapper,
  useTheme,
} from '../ui';
import { useState } from 'react';
import { FileHelper } from '@keepcloud/commons/helpers';
import { FileAncestorDto, FileMinViewDto } from '@keepcloud/commons/dtos';
import { useNavigate } from 'react-router';
import { ROUTE_PATH } from '../../constants';
import { FolderIconOutline, CheckIcon } from './index';
import { UploadEntry } from '../../hooks/upload-manager.hook';

export const UploadFileStatus = ({
  uploadFile,
}: {
  uploadFile: FileMinViewDto;
}) => {
  const ancestor = uploadFile.ancestors.at(-1) as FileAncestorDto;
  const navigate = useNavigate();
  const { selectedTheme } = useTheme();
  const handleNavigate = () => {
    const route = ancestor.isSystem
      ? ROUTE_PATH.system(ancestor.code)
      : ROUTE_PATH.folderDetails(ancestor.id);

    navigate(route);
  };

  return (
    <div className="group relative flex items-center">
      <CheckIcon className="group-hover:pointer-events-none group-hover:hidden" />
      <TooltipProviderWrapper content={'Display file location'}>
        <Button
          variant="outline"
          size="icon"
          className="hidden size-[25px] rounded-full border-none text-muted-foreground group-hover:flex"
          onClick={handleNavigate}
          aria-label="Open folder"
        >
          {selectedTheme === 'dark' ? <FolderIconOutline /> : <Folder />}
        </Button>
      </TooltipProviderWrapper>
    </div>
  );
};

export const UploadTray = ({
  uploads,
  onCancel,
  onClear,
}: {
  uploads: UploadEntry[];
  onCancel: (file: File) => void;
  onClear?: () => void;
}) => {
  const [expanded, setExpanded] = useState(true);
  const uploadsLength = uploads.length;
  if (uploadsLength === 0) return null;

  const allUploaded = uploads.every((u) =>
    FileHelper.isUploadComplete(u.progress),
  );
  const doneCount = uploads.filter((u) =>
    FileHelper.isUploadComplete(u.progress),
  ).length;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex max-h-[200px] w-[90vw] max-w-[400px] -translate-x-1/2 flex-col rounded-lg border bg-background py-4 shadow-lg sm:right-4 sm:left-auto sm:ml-auto sm:w-[400px] sm:translate-x-0">
      <h4
        onClick={() => setExpanded((prev) => !prev)}
        className="sticky top-0 z-10 flex cursor-pointer items-center justify-between bg-background px-4 py-1 text-sm font-semibold text-heading select-none"
        title={expanded ? 'Collapse upload tray' : 'Expand upload tray'}
      >
        <span>
          {allUploaded
            ? `${doneCount} upload${doneCount > 1 ? 's' : ''} completed`
            : `Uploading ${uploadsLength} item${uploadsLength > 1 ? 's' : ''}`}
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-none shadow-none"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((prev) => !prev);
            }}
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </Button>

          {allUploaded && onClear && (
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-none shadow-none"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              aria-label="Clear upload tray"
            >
              <X size={16} />
            </Button>
          )}
        </div>
      </h4>
      {expanded && (
        <div className="mt-2 flex-1 space-y-3 overflow-y-auto px-4 pb-4">
          {uploads.map((upload) => {
            const isCompleted = FileHelper.isUploadComplete(upload.progress);
            return (
              <div
                key={upload.id}
                className="flex items-center justify-between gap-3"
              >
                <CircularProgress size={16} value={upload.progress} />
                <div className="flex-1 overflow-hidden">
                  <TooltipProviderWrapper content={upload.file.name}>
                    <p className="truncate text-sm">{upload.file.name}</p>
                  </TooltipProviderWrapper>
                </div>

                {upload.uploadFile ? (
                  <UploadFileStatus uploadFile={upload.uploadFile} />
                ) : (
                  !isCompleted && (
                    <Button
                      variant="text"
                      className="h-0 p-0 text-xs text-primary-foreground"
                      onClick={() => onCancel(upload.file)}
                    >
                      Cancel
                    </Button>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
