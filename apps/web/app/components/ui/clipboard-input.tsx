import { useState } from 'react';
import { Input, Button } from '@keepcloud/web-core/react';
import { Check } from 'lucide-react';

interface ClipboardInputProps {
  value: string;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  onCopy?: (value: string) => void;
}

const CopyIcon = () => (
  <svg
    width="16"
    height="17"
    viewBox="0 0 16 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.99967 1.83524C6.54964 1.84134 6.27947 1.86739 6.06102 1.9787C5.81014 2.10653 5.60616 2.3105 5.47833 2.56139C5.36703 2.77984 5.34097 3.05001 5.33487 3.50004M12.9997 1.83524C13.4497 1.84134 13.7199 1.86739 13.9383 1.9787C14.1892 2.10653 14.3932 2.3105 14.521 2.56139C14.6323 2.77984 14.6584 3.05 14.6645 3.50003M14.6645 9.50003C14.6584 9.95007 14.6323 10.2202 14.521 10.4387C14.3932 10.6896 14.1892 10.8936 13.9383 11.0214C13.7199 11.1327 13.4497 11.1587 12.9997 11.1648M14.6663 5.83337V7.1667M9.33304 1.83337H10.6663M3.46634 15.1667H8.53301C9.27974 15.1667 9.65311 15.1667 9.93833 15.0214C10.1892 14.8936 10.3932 14.6896 10.521 14.4387C10.6663 14.1535 10.6663 13.7801 10.6663 13.0334V7.96671C10.6663 7.21997 10.6663 6.8466 10.521 6.56139C10.3932 6.3105 10.1892 6.10653 9.93833 5.9787C9.65311 5.83337 9.27974 5.83337 8.53301 5.83337H3.46634C2.7196 5.83337 2.34624 5.83337 2.06102 5.9787C1.81014 6.10653 1.60616 6.3105 1.47833 6.56139C1.33301 6.8466 1.33301 7.21997 1.33301 7.96671V13.0334C1.33301 13.7801 1.33301 14.1535 1.47833 14.4387C1.60616 14.6896 1.81014 14.8936 2.06102 15.0214C2.34624 15.1667 2.7196 15.1667 3.46634 15.1667Z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function ClipboardInput({
  value,
  placeholder = 'Enter text to copy',
  className,
  readOnly = true,
  onCopy,
}: ClipboardInputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onCopy?.(value);

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const copyButton = (
    <button type="button" className="cursor-pointer" onClick={handleCopy}>
      {copied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <span className="text-primary">
          <CopyIcon />
        </span>
      )}
    </button>
  );

  return (
    <Input
      value={value}
      placeholder={placeholder}
      readOnly={readOnly}
      rightIcon={copyButton}
      className={className}
    />
  );
}
