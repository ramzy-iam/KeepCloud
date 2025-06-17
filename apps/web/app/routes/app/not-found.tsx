import { Button } from '@keepcloud/web-core/react';
import { useNavigate } from 'react-router';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="bg-primary-gradient bg-clip-text text-[100px] leading-none font-black text-transparent drop-shadow-md">
        404
      </h1>
      <p className="text-xl font-semibold">Page not found</p>
      <p className="mt-2 text-sm">
        The page you are looking for does not exist.
      </p>

      <Button variant="primary" onClick={() => navigate('/')}>
        Go Home
      </Button>
    </div>
  );
}
