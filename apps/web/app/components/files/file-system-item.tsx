import {
  Button,
  ROUTE_PATH,
  TooltipProviderWrapper,
  cn,
  useFileMenu,
  useGetActiveFolder,
  useTrashedFileMenu,
} from '@keepcloud/web-core/react';
import { FileTextIcon, EllipsisVerticalIcon } from 'lucide-react';
import { FolderIconOutline } from '../ui';
import { useNavigate } from 'react-router';
import { FileMinViewDto, TrashedFileDto } from '@keepcloud/commons/dtos';

interface FileSystemItemProps {
  file: FileMinViewDto;
  className?: string;
  CustomMenu?: React.FC<{ children: React.ReactNode }>;
  clickable?: boolean;
}

const buttonSecondaryClassName =
  'inline-flex items-center cursor-pointer px-[24px] py-[13px] justify-center gap-2 whitespace-nowrap shadow-[0px_4px_8px_rgba(0, 0, 0, 0.16)] rounded-[8px] border border-1 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-non shrink-0 [&_svg]:shrink-0 outline-none  text-secondary-foreground bg-white-light border-stroke-300 hover:bg-[#f0f0f0]/20 shadow-[0_4px_8px_rgba(0, 0, 0, 0.4)] dark:bg-neutral-800 dark:border-neutral-600';

export const FileSystemItem = ({
  file,
  className,
  CustomMenu,
  clickable = true,
}: FileSystemItemProps) => {
  const { FileMenu: DefaultFileMenu } = useFileMenu({ file });
  const isFolder = file.isFolder;
  const navigate = useNavigate();
  const { setActiveFolder } = useGetActiveFolder();

  const Menu = CustomMenu || DefaultFileMenu;

  const handleClick = () => {
    if (!clickable) return;
    if (isFolder) {
      setActiveFolder(file);
      navigate(ROUTE_PATH.folderDetails(file.id));
    }
  };

  return (
    <div
      className={cn(
        buttonSecondaryClassName,
        'flex h-[38px] w-full items-center justify-between gap-2 px-3 py-1 sm:w-[150px] md:w-[194px]',
        className,
      )}
      onClick={handleClick}
    >
      <TooltipProviderWrapper content={file.name} sideOffset={12}>
        <div className="flex max-w-[calc(100%-24px)] items-center gap-2 overflow-hidden">
          {isFolder ? (
            <FolderIconOutline />
          ) : (
            <FileTextIcon className="h-4 w-4 text-app-accent" />
          )}
          <p className="truncate text-left text-14-medium text-secondary-foreground">
            {file.name}
          </p>
        </div>
      </TooltipProviderWrapper>

      <Menu>
        <Button
          variant="text"
          size="icon"
          className="size-[24px] rounded-full p-1 hover:bg-stroke-200 dark:hover:bg-white/5"
          aria-label={`More options for ${file.name}`}
          onClick={(e) => e.stopPropagation()}
        >
          <EllipsisVerticalIcon className="h-4 w-4" />
        </Button>
      </Menu>
    </div>
  );
};

export const TrashedSystemItem = ({ file }: { file: FileMinViewDto }) => {
  const Menu = useTrashedFileMenu(file).FileMenu;

  return <FileSystemItem file={file} CustomMenu={Menu} clickable={false} />;
};
