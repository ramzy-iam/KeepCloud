export type Owner = {
  id: string;
  firstName: string;
  lastName: string;
  picture: string;
};

export type FileAncestorDto = {
  id: string;
  name: string;
};

export type File = {
  id: string;
  name: string;
  owner: Owner;
  size: number;
  lastModified: string;
  isStarred?: boolean;
  isTrashed?: boolean;
  sharedWith?: string[];
  fileType?: 'folder' | 'file' | 'image' | 'video';
  parent?: File;
  parentId?: string | null;
  children: File[];
  ancestors: FileAncestorDto[];
  isFolder?: boolean;
};

export type FileMainCategory = 'folder' | 'file' | 'all';

export const files: File[] = [
  {
    id: 'file_01hzyvffsdvwb4xyqz6a2cbx0g',
    name: 'Project_Plan.pdf',
    owner: {
      id: 'user_01hzyvffsdvwb4xyqz6a2cbx0g',
      firstName: 'John',
      lastName: 'Doe',
      picture: 'https://picsum.photos/200/300',
    },
    size: 102400,
    lastModified: '2025-04-18T15:42:10Z',
    children: [],
    ancestors: [],
  },
  {
    id: 'file_01hzyvgg1xwff8ypr3d9ka5t2v',
    name: 'Budget_2025.xlsx',
    owner: {
      id: 'user_01hzyvgg1xwff8ypr3d9ka5t2v',
      firstName: 'Jane',
      lastName: 'Smith',
      picture: 'https://picsum.photos/200/301',
    },
    size: 204800,
    lastModified: '2025-04-17T10:15:00Z',
    children: [],
    ancestors: [],
  },
];
