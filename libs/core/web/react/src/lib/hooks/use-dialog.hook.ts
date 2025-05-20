import { useAtom } from 'jotai';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { DialogType, DialogContext, dialogAtom } from '../store';

interface OpenDialogOptions {
  type: DialogType;
  folderId?: string | null; // For createFolder
  item?: FileMinViewDto; // For rename
  context?: DialogContext;
}

export function useDialog() {
  const [dialogState, setDialogState] = useAtom(dialogAtom);

  const openDialog = ({
    type,
    folderId,
    item,
    context = {},
  }: OpenDialogOptions) => {
    setDialogState({
      isOpen: true,
      type,
      context: { folderId, item, ...context },
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
