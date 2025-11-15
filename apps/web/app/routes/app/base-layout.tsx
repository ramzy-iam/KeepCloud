import {
  Navigate,
  Outlet,
  isRouteErrorResponse,
  useNavigate,
} from 'react-router';
import {
  ModeToggle,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
  ROUTE_PATH,
  useAuth,
  useInitializeFolderViewMode,
  Button,
} from '@keepcloud/web-core/react';
import { UserProfileDto } from '@keepcloud/commons/dtos';
import {
  AppDialogsWrapper,
  AppSidebar,
  GlobalSearch,
  UserProfileIcon,
} from '../../components';
import ScreenLoader from './loader';
import { UploadProvider } from '../../contexts/upload-context';

const ProfileIcon = ({ user }: { user: UserProfileDto }) => {
  const { isMobile } = useSidebar();
  if (!isMobile) return null;
  return (
    <UserProfileIcon user={user} isIcon avatarClassName="h-[30px] w-[30px]" />
  );
};

export function ErrorBoundary({ error }: { error: unknown }) {
  const navigate = useNavigate();
  const isDev = import.meta.env.DEV;

  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex h-svh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <h1 className="bg-primary-gradient bg-clip-text text-[100px] leading-none font-black text-transparent drop-shadow-md">
          {error.status}
        </h1>
        <p className="text-xl font-semibold">{error.statusText}</p>
        {isDev && (
          <details className="max-w-xl rounded bg-muted p-4 text-left text-xs text-muted-foreground">
            <summary className="cursor-pointer font-semibold">Details</summary>
            <pre className="mt-2 break-all whitespace-pre-wrap">
              {JSON.stringify(error, null, 2)}
            </pre>
          </details>
        )}
        <Button variant="primary" onClick={() => navigate('/')}>
          Go Home
        </Button>
      </div>
    );
  }

  if (error instanceof Error) {
    return (
      <div className="flex h-svh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <h1 className="bg-primary-gradient bg-clip-text text-[72px] font-black text-transparent drop-shadow-md">
          Error
        </h1>
        <p className="text-xl font-semibold">Something went wrong</p>
        <p className="text-sm">An unexpected error has occurred.</p>
        {isDev && (
          <details className="max-w-xl rounded bg-muted p-4 text-left text-xs text-muted-foreground">
            <summary className="cursor-pointer font-semibold">Details</summary>
            <pre className="mt-2 break-all whitespace-pre-wrap">
              {error.message}
              {'\n'}
              {error.stack}
            </pre>
          </details>
        )}
        <Button variant="primary" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-svh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <h1 className="bg-primary-gradient bg-clip-text text-[72px] font-black text-transparent drop-shadow-md">
        Unknown Error
      </h1>
      <p className="text-sm">An unexpected error has occurred.</p>
      {isDev && (
        <details className="max-w-xl rounded bg-muted p-4 text-left text-xs text-muted-foreground">
          <summary className="cursor-pointer font-semibold">Details</summary>
          <pre className="mt-2 break-all whitespace-pre-wrap">
            {JSON.stringify(error, null, 2)}
          </pre>
        </details>
      )}
      <Button variant="primary" onClick={() => window.location.reload()}>
        Reload
      </Button>
    </div>
  );
}

export default function BaseLayout() {
  const { user, authChecked, redirect, isLoading } = useAuth();
  useInitializeFolderViewMode();

  if (redirect) return <Navigate to={ROUTE_PATH.login} />;
  if (!authChecked || isLoading) return <ScreenLoader />;

  return (
    <div className="h-svh overflow-hidden">
      <UploadProvider>
        <SidebarProvider className="h-full">
          <AppSidebar user={user} />
          <main className="flex h-full w-full flex-col border-0 border-x border-section-border">
            <div className="flex h-[72px] items-center justify-between border-b border-section-border px-2 py-5 md:px-8">
              <div className="flex items-center gap-2.5 text-14">
                <SidebarTrigger />
                <GlobalSearch />
              </div>
              <div className="flex items-center gap-2.5">
                <ProfileIcon user={user} />
                <ModeToggle />
              </div>
            </div>
            <div className="mt-6 mb-2 grid h-[calc(100%-72px)] max-h-[calc(100%-72px)] grid-rows-12 overflow-x-hidden">
              <Outlet />
            </div>
          </main>
          <AppDialogsWrapper />
        </SidebarProvider>
      </UploadProvider>
    </div>
  );
}
