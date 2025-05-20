import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  dialogAtom,
  ROUTE_PATH,
} from '@keepcloud/web-core/react';
import { useAtom } from 'jotai';
import { ErrorCode } from '@keepcloud/commons/constants';
import { useNavigate } from 'react-router';

export function ResourceTrashedDialog() {
  const [dialogState, setDialogState] = useAtom(dialogAtom);
  const { isOpen, type, context } = dialogState;
  const navigate = useNavigate();

  const code = context?.code;
  const isFolder = context?.isFolder;

  const title = isFolder ? 'Folder is in the Trash' : 'File is in the Trash';

  const descriptionMap: Record<string, string> = {
    [ErrorCode.FOLDER_TRASHED]: `The ${isFolder ? 'folder' : 'file'} is in the Trash and cannot be accessed. Please restore this ${isFolder ? 'folder' : 'file'} from the Trash to continue.`,
    [ErrorCode.FILE_TRASHED]:
      'The file is in the Trash and cannot be accessed. Please restore it to continue.',
    [ErrorCode.PARENT_FOLDER_TRASHED]: `A parent folder of this ${isFolder ? 'folder' : 'file'} is trashed. Please restore the parent folder from the Trash to regain access.`,
  };

  const description =
    descriptionMap[code ?? ''] ?? 'This resource is not available.';

  if (!isOpen || type !== 'resourceTrashed') return null;

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setDialogState({ isOpen: false, type: null, context: {} });
          navigate(ROUTE_PATH.trash);
        }
      }}
    >
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left text-18-medium text-heading">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="py-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-row justify-end space-x-2">
          <AlertDialogCancel asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
