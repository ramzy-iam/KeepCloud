import { useTheme } from '../../ui';

interface PdfIconProps {
  size?: 'small' | 'medium';
}

const Icon = {
  small: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="2" width="16" height="16" rx="4" fill="#FFCA28" />
      <path
        d="M6 10H7C7.26522 10 7.51957 9.89464 7.70711 9.70711C7.89464 9.51957 8 9.26522 8 9C8 8.73478 7.89464 8.48043 7.70711 8.29289C7.51957 8.10536 7.26522 8 7 8H6V12M13 10H14.5M15 8H13V12M9.5 8V12H10.5C10.7652 12 11.0196 11.8946 11.2071 11.7071C11.3946 11.5196 11.5 11.2652 11.5 11V9C11.5 8.73478 11.3946 8.48043 11.2071 8.29289C11.0196 8.10536 10.7652 8 10.5 8H9.5Z"
        stroke="#B56D00"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  medium: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="28" height="28" rx="4" fill="#FFCA28" />
      <path
        d="M6.5 14H8.16667C8.60869 14 9.03262 13.8244 9.34518 13.5118C9.65774 13.1993 9.83333 12.7754 9.83333 12.3333C9.83333 11.8913 9.65774 11.4674 9.34518 11.1548C9.03262 10.8423 8.60869 10.6667 8.16667 10.6667H6.5V17.3333M18.1667 14H20.6667M21.5 10.6667H18.1667V17.3333M12.3333 10.6667V17.3333H14C14.442 17.3333 14.866 17.1577 15.1785 16.8452C15.4911 16.5326 15.6667 16.1087 15.6667 15.6667V12.3333C15.6667 11.8913 15.4911 11.4674 15.1785 11.1548C14.866 10.8423 14.442 10.6667 14 10.6667H12.3333Z"
        stroke="#B56D00"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

export const PdfIcon = ({ size = 'small' }: PdfIconProps) => {
  return Icon[size];
};
