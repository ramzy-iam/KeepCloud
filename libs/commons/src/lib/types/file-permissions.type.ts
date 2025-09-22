export enum FilePermissionRole {
  OWNER = 'OWNER', // full control of specific file/folder (delete, manage permissions)
  EDITOR = 'EDITOR', // can create/update/delete files inside folder, cannot restructure tree
  VIEWER = 'VIEWER', // read-only access
}
