import { useAtom } from 'jotai';
import { dialogAtom } from '@keepcloud/web-core/react';
import {
  CreateFolderDialog,
  RenameResourceDialog,
  ResourceTrashedDialog,
} from '../dialogs';
import { useEffect } from 'react';

export function GlobalPointerEventsHandler() {
  const [dialogState] = useAtom(dialogAtom);
  const { isOpen } = dialogState;

  useEffect(() => {
    if (!isOpen) {
      document.body.style.pointerEvents = 'auto';
    }
  }, [isOpen]);

  return null;
}

export const AppDialogs = () => {
  const [dialogState] = useAtom(dialogAtom);

  if (!dialogState.isOpen || !dialogState.type) return null;

  switch (dialogState.type) {
    case 'rename':
      return <RenameResourceDialog />;
    case 'createFolder':
      return <CreateFolderDialog />;

    case 'resourceTrashed':
      return <ResourceTrashedDialog />;

    default:
      return null;
  }
};

export const AppDialogsWrapper = () => {
  return (
    <>
      <GlobalPointerEventsHandler />
      <AppDialogs />
    </>
  );
};
