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

export function FolderNotFoundDialog() {
  const [dialogState, setDialogState] = useAtom(dialogAtom);
  const { isOpen, type, context } = dialogState;
  const navigate = useNavigate();

  const code = context?.code;

  if (!isOpen || type !== 'folderNotFound') return null;

  if (code !== ErrorCode.FOLDER_NOT_FOUND) return null;

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setDialogState({ isOpen: false, type: null, context: {} });
          navigate(ROUTE_PATH.explorer); // You can change this to a fallback route
        }
      }}
    >
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left text-18-medium text-heading">
            Folder Not Found
          </AlertDialogTitle>
          <AlertDialogDescription className="py-2">
            The folder you're trying to access could not be found. It may have
            been deleted.
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
