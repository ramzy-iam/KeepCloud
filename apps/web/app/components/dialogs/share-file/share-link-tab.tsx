import { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Separator,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@keepcloud/web-core/react';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { FilePermissionRole } from '@prisma/client';
import {
  Copy,
  Link,
  Globe,
  Calendar,
  Eye,
  Edit,
  Check,
  ExternalLink,
  Shield,
  Users,
  AlertTriangle,
} from 'lucide-react';
import {
  useCreateShareLink,
  useGetShareLink,
  useUpdateShareLink,
  useDeleteShareLink,
} from '../../../hooks/sharing.hook';

interface ShareLinkTabProps {
  item: FileMinViewDto;
}

export function ShareLinkTab({ item }: ShareLinkTabProps) {
  const [linkAccess, setLinkAccess] = useState<'restricted' | 'anyone'>(
    'restricted',
  );
  const [linkRole, setLinkRole] = useState<FilePermissionRole>(
    FilePermissionRole.VIEWER,
  );
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expirationDate, setExpirationDate] = useState('');
  const [copied, setCopied] = useState(false);

  const createShareLink = useCreateShareLink();
  const updateShareLink = useUpdateShareLink();
  const deleteShareLink = useDeleteShareLink();

  const {
    data: shareLink,
    isLoading: isLoadingLink,
    refetch: refetchLink,
  } = useGetShareLink(item.id);

  const handleCreateLink = async () => {
    try {
      await createShareLink.mutateAsync({
        fileId: item.id,
        access: linkAccess,
        role: linkRole,
        expiresAt: hasExpiration ? new Date(expirationDate) : null,
      });
      refetchLink();
    } catch (error) {
      console.error('Failed to create share link:', error);
    }
  };

  const handleUpdateLink = async () => {
    if (!shareLink) return;

    try {
      await updateShareLink.mutateAsync({
        linkId: shareLink.id,
        access: linkAccess,
        role: linkRole,
        expiresAt: hasExpiration ? new Date(expirationDate) : null,
      });
      refetchLink();
    } catch (error) {
      console.error('Failed to update share link:', error);
    }
  };

  const handleDeleteLink = async () => {
    if (!shareLink) return;

    try {
      await deleteShareLink.mutateAsync({
        fileId: item.id,
        linkId: shareLink.id,
      });
      refetchLink();
    } catch (error) {
      console.error('Failed to delete share link:', error);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getShareUrl = () => {
    if (!shareLink) return '';
    return `${window.location.origin}/share/${shareLink.token}`;
  };

  const formatExpirationDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const isExpired = shareLink?.expiresAt
    ? new Date(shareLink.expiresAt) < new Date()
    : false;

  // Initialize form values when shareLink loads
  useEffect(() => {
    if (shareLink) {
      setLinkAccess(shareLink.access);
      setLinkRole(shareLink.role);
      setHasExpiration(!!shareLink.expiresAt);
      if (shareLink.expiresAt) {
        const date = new Date(shareLink.expiresAt);
        setExpirationDate(date.toISOString().slice(0, 16)); // Format for datetime-local input
      }
    }
  }, [shareLink]);

  if (isLoadingLink) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-1/3 rounded bg-muted"></div>
          <div className="h-10 rounded bg-muted"></div>
          <div className="h-20 rounded bg-muted"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {shareLink ? (
        <>
          {/* Existing Link */}
          <Card
            className={`${isExpired ? 'border-destructive bg-destructive/5' : ''}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  <CardTitle className="text-sm">Share Link</CardTitle>
                  {shareLink.access === 'anyone' ? (
                    <Badge variant="secondary" className="text-xs">
                      <Globe className="mr-1 h-3 w-3" />
                      Anyone with the link
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      <Users className="mr-1 h-3 w-3" />
                      People in your organization
                    </Badge>
                  )}
                </div>
                {isExpired && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Expired
                  </Badge>
                )}
              </div>
              {shareLink.expiresAt && (
                <CardDescription className="text-xs">
                  <Calendar className="mr-1 inline h-3 w-3" />
                  {isExpired ? 'Expired on' : 'Expires on'}{' '}
                  {formatExpirationDate(new Date(shareLink.expiresAt))}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={getShareUrl()}
                  className="flex-1 bg-muted font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(getShareUrl())}
                  disabled={isExpired}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(getShareUrl(), '_blank')}
                  disabled={isExpired}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {shareLink.role === FilePermissionRole.EDITOR ? (
                    <>
                      <Edit className="h-4 w-4 text-orange-500" />
                      <span>Can edit</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 text-blue-500" />
                      <span>Can view</span>
                    </>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  Used {shareLink.accessCount || 0} times
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Toggle edit mode or show settings
                  }}
                  className="flex-1"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Change permissions
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteLink}
                  disabled={deleteShareLink.isPending}
                  className="text-destructive hover:text-destructive"
                >
                  Remove link
                </Button>
              </div>
            </CardContent>
          </Card>

          <Separator />
        </>
      ) : null}

      {/* Link Configuration */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">
          {shareLink ? 'Update link settings' : 'Create a shareable link'}
        </h3>

        {/* Access Level */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Who can access</label>
          <Select
            value={linkAccess}
            onValueChange={(value) =>
              setLinkAccess(value as 'restricted' | 'anyone')
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="restricted">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <div>
                    <div>People in your organization</div>
                    <div className="text-xs text-muted-foreground">
                      Only members of your organization can access
                    </div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="anyone">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <div>
                    <div>Anyone with the link</div>
                    <div className="text-xs text-muted-foreground">
                      Anyone can access with the link
                    </div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Permission Level */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Permission level</label>
          <Select
            value={linkRole}
            onValueChange={(value) => setLinkRole(value as FilePermissionRole)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FilePermissionRole.VIEWER}>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <div>
                    <div>Viewer</div>
                    <div className="text-xs text-muted-foreground">
                      Can view only
                    </div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value={FilePermissionRole.EDITOR}>
                <div className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  <div>
                    <div>Editor</div>
                    <div className="text-xs text-muted-foreground">
                      Can view and edit
                    </div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Expiration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Set expiration</label>
            <Switch
              checked={hasExpiration}
              onCheckedChange={setHasExpiration}
            />
          </div>
          {hasExpiration && (
            <Input
              type="datetime-local"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {shareLink ? (
            <Button
              onClick={handleUpdateLink}
              disabled={updateShareLink.isPending}
              className="flex-1"
            >
              Update link
            </Button>
          ) : (
            <Button
              onClick={handleCreateLink}
              disabled={createShareLink.isPending}
              className="flex-1"
            >
              <Link className="mr-2 h-4 w-4" />
              Create link
            </Button>
          )}
        </div>
      </div>

      {/* Security Notice */}
      {linkAccess === 'anyone' && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-orange-600" />
              <div className="text-sm">
                <p className="font-medium text-orange-800 dark:text-orange-200">
                  Link sharing is enabled
                </p>
                <p className="mt-1 text-orange-700 dark:text-orange-300">
                  Anyone with this link can access this{' '}
                  {item.isFolder ? 'folder' : 'file'}. Only share with people
                  you trust.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
