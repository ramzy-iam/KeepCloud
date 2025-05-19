import { useAtom } from 'jotai';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { DialogType, dialogAtom } from '../store';

interface OpenDialogOptions {
  type: DialogType;
  folderId?: string | null; // For createFolder
  item?: FileMinViewDto; // For rename
}

export function useDialog() {
  const [dialogState, setDialogState] = useAtom(dialogAtom);

  const openDialog = ({ type, folderId, item }: OpenDialogOptions) => {
    setDialogState({
      isOpen: true,
      type,
      context: { folderId, item },
    });
  };

  const closeDialog = () => {
    setDialogState((prev) => ({
      ...prev,
      isOpen: false,
      type: null,
      context: {},
    }));
  };

  return {
    openDialog,
    closeDialog,
    dialogState,
  };
}
