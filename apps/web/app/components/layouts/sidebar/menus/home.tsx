import { MenuButton } from '@keepcloud/web-core/react';
import { LayoutGridIcon } from 'lucide-react';
import { NavLink } from 'react-router';

import { createLucideIcon } from 'lucide-react';
// export const FoobarIcon = createLucideIcon('foobar', [
//   [
//     'path',
//     {
//       d: 'M14.6667 13.18V10.4867C14.6667 9.42667 14.24 9 13.18 9H10.4867C9.42667 9 9 9.42667 9 10.4867V13.18C9 14.24 9.42667 14.6667 10.4867 14.6667H13.18C14.24 14.6667 14.6667 14.24 14.6667 13.18Z',
//       key: '37abs2',
//     },
//   ],
//   [
//     'path',
//     {
//       d: 'M14.6667 5.68004V2.65337C14.6667 1.71337 14.24 1.33337 13.18 1.33337H10.4867C9.42667 1.33337 9 1.71337 9 2.65337V5.67337C9 6.62004 9.42667 6.99337 10.4867 6.99337H13.18C14.24 7.00004 14.6667 6.62004 14.6667 5.68004Z',
//       key: '1k9rvp',
//     },
//   ],
//   [
//     'path',
//     {
//       d: 'M7 13.18V10.4867C7 9.42667 6.57334 9 5.51334 9H2.82C1.76 9 1.33334 9.42667 1.33334 10.4867V13.18C1.33334 14.24 1.76 14.6667 2.82 14.6667H5.51334C6.57334 14.6667 7 14.24 7 13.18Z',
//       key: '4gbgcw',
//     },
//   ],
//   [
//     'path',
//     {
//       d: 'M7 5.68004V2.65337C7 1.71337 6.57334 1.33337 5.51334 1.33337H2.82C1.76 1.33337 1.33334 1.71337 1.33334 2.65337V5.67337C1.33334 6.62004 1.76 6.99337 2.82 6.99337H5.51334C6.57334 7.00004 7 6.62004 7 5.68004Z',
//       key: 'rdd92m',
//     },
//   ],
// ]);

export const ImageIcon = createLucideIcon('image', [
  [
    'path',
    {
      d: 'M10.667 14.667 14 11.333h-3',
      key: 'd2dlct',
    },
  ],
  [
    'path',
    {
      d: 'M14 11.333v3',
      key: 'fmo956',
    },
  ],
  [
    'path',
    {
      d: 'M4 14v-1.333A2.67 2.67 0 0 1 6.667 10h2',
      key: '1r2r66',
    },
  ],
  [
    'circle',
    {
      cx: '8',
      cy: '4.667',
      r: '2.667',
      key: '157qpr',
    },
  ],
]);

const Links = [
  {
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14.6667 5.68004V2.65337C14.6667 1.71337 14.24 1.33337 13.18 1.33337H10.4867C9.42667 1.33337 9 1.71337 9 2.65337V5.67337C9 6.62004 9.42667 6.99337 10.4867 6.99337H13.18C14.24 7.00004 14.6667 6.62004 14.6667 5.68004Z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.6667 13.18V10.4867C14.6667 9.42667 14.24 9 13.18 9H10.4867C9.42667 9 9 9.42667 9 10.4867V13.18C9 14.24 9.42667 14.6667 10.4867 14.6667H13.18C14.24 14.6667 14.6667 14.24 14.6667 13.18Z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 5.68004V2.65337C7 1.71337 6.57334 1.33337 5.51334 1.33337H2.82C1.76 1.33337 1.33334 1.71337 1.33334 2.65337V5.67337C1.33334 6.62004 1.76 6.99337 2.82 6.99337H5.51334C6.57334 7.00004 7 6.62004 7 5.68004Z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 13.18V10.4867C7 9.42667 6.57334 9 5.51334 9H2.82C1.76 9 1.33334 9.42667 1.33334 10.4867V13.18C1.33334 14.24 1.76 14.6667 2.82 14.6667H5.51334C6.57334 14.6667 7 14.24 7 13.18Z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    label: 'All Folder',
    path: '#',
  },
  {
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 14V12.6667C4 11.9594 4.28095 11.2811 4.78105 10.781C5.28115 10.281 5.95942 10 6.66667 10H8.66667M10.6667 14.6667L14 11.3333M14 11.3333V14.3333M14 11.3333H11M5.33333 4.66667C5.33333 5.37391 5.61428 6.05219 6.11438 6.55229C6.61448 7.05238 7.29276 7.33333 8 7.33333C8.70724 7.33333 9.38552 7.05238 9.88562 6.55229C10.3857 6.05219 10.6667 5.37391 10.6667 4.66667C10.6667 3.95942 10.3857 3.28115 9.88562 2.78105C9.38552 2.28095 8.70724 2 8 2C7.29276 2 6.61448 2.28095 6.11438 2.78105C5.61428 3.28115 5.33333 3.95942 5.33333 4.66667Z"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    label: 'Shared',
    path: '#',
  },
  {
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13.3333 8.33337V4.53337C13.3333 3.41327 13.3333 2.85322 13.1153 2.42539C12.9236 2.04907 12.6176 1.74311 12.2413 1.55136C11.8135 1.33337 11.2534 1.33337 10.1333 1.33337H5.86666C4.74656 1.33337 4.18651 1.33337 3.75868 1.55136C3.38236 1.74311 3.0764 2.04907 2.88465 2.42539C2.66666 2.85322 2.66666 3.41327 2.66666 4.53337V11.4667C2.66666 12.5868 2.66666 13.1469 2.88465 13.5747C3.0764 13.951 3.38236 14.257 3.75868 14.4487C4.18651 14.6667 4.74653 14.6667 5.86657 14.6667H8.33333M9.33333 7.33337H5.33333M6.66666 10H5.33333M10.6667 4.66671H5.33333M10 12.6667L12 14.6667M12 14.6667L14 12.6667M12 14.6667V10.6667"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    label: 'File Requests',
    path: '#',
  },
  {
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 2H10M2 4H14M12.6667 4L12.1991 11.0129C12.129 12.065 12.0939 12.5911 11.8667 12.99C11.6666 13.3412 11.3648 13.6235 11.0011 13.7998C10.588 14 10.0607 14 9.00623 14H6.99377C5.93927 14 5.41202 14 4.99889 13.7998C4.63517 13.6235 4.33339 13.3412 4.13332 12.99C3.90607 12.5911 3.871 12.065 3.80086 11.0129L3.33333 4"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    label: 'Trash',
    path: '#',
  },
];

export const HomeMenu = () => {
  return (
    <div>
      {Links.map((link) => (
        <MenuButton
          key={link.label}
          asChild
          className="stroke-foreground px-3! py-1! hover:stroke-sidebar-accent-foreground hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:stroke-sidebar-accent-foreground dark:hover:stroke-white-light"
        >
          <NavLink to={link.path} end>
            <div className="flex items-center gap-2">
              {link.icon}
              <span className="icon">{link.label}</span>
            </div>
          </NavLink>
        </MenuButton>
      ))}
    </div>
  );
};
