import { useEffect, useRef } from 'react';
import { UseFormReturn, FieldValues, Path } from 'react-hook-form';

// Union type for different input elements
type FocusableElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

// Type for form-based focus
interface UseDialogFocusWithFormProps<T extends FieldValues = FieldValues> {
  isOpen: boolean;
  dialogType: string | null;
  expectedType: string;
  form: UseFormReturn<T>;
  fieldName: Path<T>;
  shouldSelect?: boolean;
  delay?: number;
  inputRef?: never; // Exclude inputRef when using form
}

// Type for ref-based focus
interface UseDialogFocusWithRefProps {
  isOpen: boolean;
  dialogType: string | null;
  expectedType: string;
  inputRef: React.RefObject<FocusableElement>;
  shouldSelect?: boolean;
  delay?: number;
  form?: never; // Exclude form when using ref
  fieldName?: never; // Exclude fieldName when using ref
}

// Union type for overloading
type UseDialogFocusProps<T extends FieldValues = FieldValues> =
  | UseDialogFocusWithFormProps<T>
  | UseDialogFocusWithRefProps;

/**
 * Custom hook for managing focus and text selection in dialog inputs
 *
 * Can work with both React Hook Form and standalone input refs
 *
 * @param isOpen - Whether the dialog is currently open
 * @param dialogType - Current dialog type from dialog state
 * @param expectedType - Expected dialog type to trigger focus
 * @param form - React Hook Form instance (for form-based inputs)
 * @param fieldName - Name of the field to focus (for form-based inputs)
 * @param inputRef - Ref to the input element (for standalone inputs)
 * @param shouldSelect - Whether to select all text in the field (default: true)
 * @param delay - Delay in milliseconds before focusing (default: 100ms)
 */
export const useDialogFocus = <T extends FieldValues = FieldValues>(
  props: UseDialogFocusProps<T>,
) => {
  const {
    isOpen,
    dialogType,
    expectedType,
    shouldSelect = true,
    delay = 100,
  } = props;

  useEffect(() => {
    if (isOpen && dialogType === expectedType) {
      const timer = setTimeout(() => {
        // Check if we're using form or ref approach
        if ('form' in props && props.form && props.fieldName) {
          // Form-based approach
          if (shouldSelect) {
            props.form.setFocus(props.fieldName, { shouldSelect: true });
          } else {
            props.form.setFocus(props.fieldName);
          }
        } else if ('inputRef' in props && props.inputRef?.current) {
          // Ref-based approach
          const input = props.inputRef.current;
          input.focus();

          // Only select text for input and textarea elements
          if (
            shouldSelect &&
            (input instanceof HTMLInputElement ||
              input instanceof HTMLTextAreaElement)
          ) {
            // Check if the input type supports text selection
            if (input instanceof HTMLInputElement) {
              const inputType = input.type.toLowerCase();
              // Only select for text-based input types
              if (
                ['text', 'password', 'search', 'tel', 'url', 'email'].includes(
                  inputType,
                )
              ) {
                input.select();
              }
            } else {
              // HTMLTextAreaElement always supports select
              input.select();
            }
          }
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, dialogType, expectedType, shouldSelect, delay, props]);
};

/**
 * Hook that returns a ref for use with standalone inputs
 * Use this when you don't have a form and just want to focus a plain input
 *
 * @param elementType - Type of element to create ref for (default: 'input')
 */
export const useInputRef = <
  T extends FocusableElement = HTMLInputElement,
>() => {
  return useRef<T>(null);
};
