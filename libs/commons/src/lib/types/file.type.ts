export type Owner = {
  id: string;
  firstName: string;
  lastName: string;
  picture: string;
};

export type FileAncestor = {
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
  ancestors: FileAncestor[];
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
  {
    id: 'file_01hzyvhjk88pwxz7rft5lku90g',
    name: 'Meeting_Notes.docx',
    owner: {
      id: 'user_01hzyvhjk88pwxz7rft5lku90g',
      firstName: 'me',
      lastName: '',
      picture: 'https://picsum.photos/200/302',
    },
    size: 51200,
    lastModified: '2025-04-15T08:30:00Z',
    children: [],
    ancestors: [],
  },
  {
    id: 'file_01hzyvhrstqubyz3kjqh8twa9c',
    name: 'Design_Mockup.fig',
    owner: {
      id: 'user_01hzyvhrstqubyz3kjqh8twa9c',
      firstName: 'Bob',
      lastName: 'Taylor',
      picture: 'https://picsum.photos/200/303',
    },
    size: 153600,
    lastModified: '2025-04-14T14:25:00Z',
    children: [],
    ancestors: [],
  },
  {
    id: 'file_01hzyvjmqp2qwbw8vxytgrza5m',
    name: 'Sprint Backlog',
    owner: {
      id: 'user_01hzyvjmqp2qwbw8vxytgrza5m',
      firstName: 'Carol',
      lastName: 'White',
      picture: 'https://picsum.photos/200/304',
    },

    size: 30720,
    fileType: 'folder',
    lastModified: '2025-04-13T16:45:00Z',
    children: [],
    ancestors: [],
  },
  {
    id: 'file_01hzyvkp9nd5asld0yejz3ah2p',
    name: 'Contract_Agreement.pdf',
    owner: {
      id: 'user_01hzyvkp9nd5asld0yejz3ah2p',
      firstName: 'Dan',
      lastName: 'Green',
      picture: 'https://picsum.photos/200/305',
    },
    size: 256000,
    lastModified: '2025-04-12T12:00:00Z',
    children: [],
    ancestors: [],
  },
  {
    id: 'file_01hzyvm5tvs8fz60n7u4mc6xqy',
    name: 'Team_Photo.png',
    owner: {
      id: 'user_01hzyvm5tvs8fz60n7u4mc6xqy',
      firstName: 'Eva',
      lastName: 'Martinez',
      picture: 'https://picsum.photos/200/306',
    },
    size: 1024000,
    lastModified: '2025-04-11T09:20:00Z',
    children: [],
    ancestors: [],
  },
  {
    id: 'file_01hzyvn8szwljd6eb3zxtak2qk',
    name: 'Roadmap_2025.pptx',
    owner: {
      id: 'user_01hzyvn8szwljd6eb3zxtak2qk',
      firstName: 'Frank',
      lastName: 'Wilson',
      picture: 'https://picsum.photos/200/307',
    },
    size: 512000,
    lastModified: '2025-04-10T13:15:00Z',
    children: [],
    ancestors: [],
  },
  {
    id: 'file_01hzyvp25jsdkfju7a0mhzz75n',
    name: 'Sales_Report_Q1.pdf',
    owner: {
      id: 'user_01hzyvp25jsdkfju7a0mhzz75n',
      firstName: 'Grace',
      lastName: 'Nguyen',
      picture: 'https://picsum.photos/200/308',
    },
    size: 409600,
    lastModified: '2025-04-09T07:50:00Z',
    children: [],
    ancestors: [],
  },
  {
    id: 'file_01hzyvqabc8m4kvq9mzt7tw5yw',
    name: 'Technical_Specs.md',
    owner: {
      id: 'user_01hzyvqabc8m4kvq9mzt7tw5yw',
      firstName: 'Henry',
      lastName: 'Lopez',
      picture: 'https://picsum.photos/200/309',
    },
    size: 10240,
    lastModified: '2025-04-08T18:35:00Z',
    children: [],
    ancestors: [],
  },
  {
    id: 'file_01hzyvrtdvq3nep8hz3ke4x56q',
    name: 'Wireframe_Sketch.sketch',
    owner: {
      id: 'user_01hzyvrtdvq3nep8hz3ke4x56q',
      firstName: 'Ivy',
      lastName: 'Khan',
      picture: 'https://picsum.photos/200/310',
    },
    size: 768000,
    lastModified: '2025-04-07T20:15:00Z',
    children: [],
    ancestors: [],
  },
  {
    id: 'file_01hzyvt53txxwvqp6d09gh56g2',
    name: 'Customer_Feedback.xlsx',
    owner: {
      id: 'user_01hzyvt53txxwvqp6d09gh56g2',
      firstName: 'Jack',
      lastName: 'Lee',
      picture: 'https://picsum.photos/200/311',
    },
    size: 153600,
    lastModified: '2025-04-06T11:10:00Z',
    children: [],
    ancestors: [],
  },
  {
    id: 'file_01hzyvv7afg82mzq2r4s3deukx',
    name: 'QA_Results.docx',
    owner: {
      id: 'user_01hzyvv7afg82mzq2r4s3deukx',
      firstName: 'Kate',
      lastName: 'Patel',
      picture: 'https://picsum.photos/200/312',
    },
    size: 204800,
    lastModified: '2025-04-05T17:00:00Z',
    children: [],
    ancestors: [],
  },
  {
    id: 'file_01hzyvwgj9pnz0mx7tk4edwzxr',
    name: 'Marketing_Plan.pptx',
    owner: {
      id: 'user_01hzyvwgj9pnz0mx7tk4edwzxr',
      firstName: 'Leo',
      lastName: 'Kim',
      picture: 'https://picsum.photos/200/313',
    },
    size: 307200,
    lastModified: '2025-04-04T14:55:00Z',
    children: [],
    ancestors: [],
  },
  {
    id: 'file_01hzyvxxd7zpjrdke5t2b8g2ma',
    name: 'Launch_Checklist.txt',
    owner: {
      id: 'user_01hzyvxxd7zpjrdke5t2b8g2ma',
      firstName: 'Mia',
      lastName: 'Ahmed',
      picture: 'https://picsum.photos/200/314',
    },
    size: 5120,
    lastModified: '2025-04-03T10:05:00Z',
    children: [],
    ancestors: [],
  },
];

export const folders: File[] = [
  {
    id: 'folder_1',
    name: 'Wireframes',
    owner: {
      id: 'user_1',
      firstName: 'John',
      lastName: 'Doe',
      picture: 'https://example.com/john.jpg',
    },

    size: 0,
    lastModified: '2023-10-01T09:00:00Z',
    isStarred: false,
    isTrashed: false,
    fileType: 'folder',
    children: [],
    ancestors: [],
  },
  {
    id: 'folder_2',
    name: 'Bank Statements',
    owner: {
      id: 'user_1',
      firstName: 'John',
      lastName: 'Doe',
      picture: 'https://example.com/john.jpg',
    },

    size: 0,
    lastModified: '2023-10-02T09:00:00Z',
    isStarred: true,
    isTrashed: false,
    fileType: 'folder',
    children: [],
    ancestors: [],
  },
  {
    id: 'folder_3',
    name: 'Invoices',
    owner: {
      id: 'user_1',
      firstName: 'John',
      lastName: 'Doe',
      picture: 'https://example.com/john.jpg',
    },

    size: 0,
    lastModified: '2023-10-03T09:00:00Z',
    isStarred: false,
    isTrashed: false,
    fileType: 'folder',
    children: [],
    ancestors: [],
  },
  {
    id: 'folder_4',
    name: 'Expenses',
    owner: {
      id: 'user_1',
      firstName: 'John',
      lastName: 'Doe',
      picture: 'https://example.com/john.jpg',
    },

    size: 0,
    lastModified: '2023-10-04T09:00:00Z',
    isStarred: false,
    isTrashed: false,
    fileType: 'folder',
    children: [],
    ancestors: [],
  },
  {
    id: 'folder_5',
    name: 'Photos',
    owner: {
      id: 'user_1',
      firstName: 'John',
      lastName: 'Doe',
      picture: 'https://example.com/john.jpg',
    },

    size: 0,
    lastModified: '2023-10-05T09:00:00Z',
    isStarred: true,
    isTrashed: false,
    fileType: 'folder',
    children: [],
    ancestors: [],
  },
  {
    id: 'folder_6',
    name: 'Income',
    owner: {
      id: 'user_1',
      firstName: 'John',
      lastName: 'Doe',
      picture: 'https://example.com/john.jpg',
    },

    size: 0,
    lastModified: '2023-10-06T09:00:00Z',
    isStarred: false,
    isTrashed: false,
    fileType: 'folder',
    children: [],
    ancestors: [],
  },
  {
    id: 'folder_7',
    name: 'Code Base',
    owner: {
      id: 'user_1',
      firstName: 'John',
      lastName: 'Doe',
      picture: 'https://example.com/john.jpg',
    },

    size: 0,
    lastModified: '2023-10-07T09:00:00Z',
    isStarred: false,
    isTrashed: false,
    fileType: 'folder',
    children: [],
    ancestors: [],
  },
  {
    id: 'folder_8',
    name: 'Deployment Reports',
    owner: {
      id: 'user_1',
      firstName: 'John',
      lastName: 'Doe',
      picture: 'https://example.com/john.jpg',
    },

    size: 0,
    lastModified: '2023-10-08T09:00:00Z',
    isStarred: true,
    isTrashed: false,
    fileType: 'folder',
    children: [],
    ancestors: [],
  },
  {
    id: 'folder_9',
    name: 'Project Plans',
    owner: {
      id: 'user_1',
      firstName: 'John',
      lastName: 'Doe',
      picture: 'https://example.com/john.jpg',
    },

    size: 0,
    lastModified: '2023-10-09T09:00:00Z',
    isStarred: false,
    isTrashed: false,
    fileType: 'folder',
    children: [],
    ancestors: [],
  },
  {
    id: 'folder_10',
    name: 'Staff Meetings',
    owner: {
      id: 'user_1',
      firstName: 'John',
      lastName: 'Doe',
      picture: 'https://example.com/john.jpg',
    },

    size: 0,
    lastModified: '2023-10-10T09:00:00Z',
    isStarred: false,
    isTrashed: false,
    fileType: 'folder',
    children: [],
    ancestors: [],
  },
];

export const fileTreeFolders: File[] = [
  {
    id: '1',
    name: 'My Storage',
    owner: { id: 'user1', firstName: 'John', lastName: 'Doe', picture: '' },

    fileType: 'folder',
    size: 0,
    lastModified: '2025-05-03T10:00:00Z',
    ancestors: [],
    children: [
      {
        id: '1.1',
        name: 'Documents',
        owner: { id: 'user1', firstName: 'John', lastName: 'Doe', picture: '' },

        fileType: 'folder',
        size: 0,
        lastModified: '2025-05-03T10:00:00Z',
        parentId: '1',
        ancestors: [{ id: '1', name: 'My Storage' }],
        children: [
          {
            id: '1.1.1',
            name: 'Reports',
            owner: {
              id: 'user1',
              firstName: 'John',
              lastName: 'Doe',
              picture: '',
            },
            fileType: 'folder',
            size: 0,
            lastModified: '2025-05-03T10:00:00Z',
            parentId: '1.1',
            ancestors: [
              { id: '1', name: 'My Storage' },
              { id: '1.1', name: 'Documents' },
            ],
            children: [
              {
                id: 'file_01hzyvgs1xwff8ypr3d9ka5t2v.pptx',
                name: 'November 2022',
                owner: {
                  id: 'user1',
                  firstName: 'John',
                  lastName: 'Doe',
                  picture: '',
                },
                fileType: 'folder',
                size: 0,
                lastModified: '2025-05-03T10:00:00Z',
                children: [],
                ancestors: [
                  { id: '1', name: 'My Storage' },
                  { id: '1.1', name: 'Documents' },
                  { id: '1.1.1', name: 'Reports' },
                ],
                parentId: '1.1',
              },
              {
                id: 'file_01hzyvgs1xwff8ypr3d9ka5t2v',
                name: 'Reports.pptx',
                owner: {
                  id: 'user1',
                  firstName: 'John',
                  lastName: 'Doe',
                  picture: '',
                },
                fileType: 'file',
                size: 0,
                lastModified: '2025-05-03T10:00:00Z',
                children: [],
                ancestors: [
                  { id: '1', name: 'My Storage' },
                  { id: '1.1', name: 'Documents' },
                  { id: '1.1.1', name: 'Reports' },
                ],
                parentId: '1.1.1',
              },
            ],
          },
        ],
      },
      {
        id: '1.2',
        name: 'Projects',
        owner: { id: 'user1', firstName: 'John', lastName: 'Doe', picture: '' },

        fileType: 'folder',
        size: 0,
        lastModified: '2025-05-03T10:00:00Z',
        children: [],
        ancestors: [
          {
            id: '1',
            name: 'My Storage',
          },
        ],
        parentId: '1',
      },
    ],
    parentId: null,
  },
];
