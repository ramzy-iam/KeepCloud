export enum ContentType {
  PDF = 'application/pdf',
  JPEG = 'image/jpeg',
  JPG = 'image/jpg',
  PNG = 'image/png',
  GIF = 'image/gif',
  SVG = 'image/svg+xml',
  MP4 = 'video/mp4',
  WEBM = 'video/webm',
  OGG = 'video/ogg',
  WAV = 'audio/wav',
  MP3 = 'audio/mpeg',
  JSON = 'application/json',
  XML = 'application/xml',
  TXT = 'text/plain',
  xls = 'application/vnd.ms-excel',
  xlsx = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  DOC = 'application/msword',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  PPT = 'application/vnd.ms-powerpoint',
  PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  CSV = 'text/csv',
  ZIP = 'application/zip',
}

export enum FileFormat {
  PDF = 'pdf',
  JPEG = 'jpeg',
  JPG = 'jpg',
  PNG = 'png',
  GIF = 'gif',
  SVG = 'svg',
  MP4 = 'mp4',
  WEBM = 'webm',
  OGG = 'ogg',
  WAV = 'wav',
  MP3 = 'mp3',
  JSON = 'json',
  XML = 'xml',
  TXT = 'txt',
  xls = 'xls',
  xlsx = 'xlsx',
  DOC = 'doc',
  DOCX = 'docx',
  PPT = 'ppt',
  PPTX = 'pptx',
  CSV = 'csv',
  ZIP = 'zip',
}

export enum FilePermission {
  VIEW = 'view',
  EDIT = 'edit',
  COMMENT = 'comment',
}

export enum FileSortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  IS_FOLDER = 'isFolder',
}

export enum SystemFolder {
  MY_STORAGE = 'My Storage',
  SHARED_WITH_ME = 'shared-with-me',
  TRASH = 'trash',
}
