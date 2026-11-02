import type { ComponentProps, ReactNode } from "react";
import { FieldMessage } from "./FieldMessage";
import { FormField } from "./FormField";
import { PasswordInput } from "./PasswordInput";
import { TextInput } from "./TextInput";

type LabeledInputProps = Omit<ComponentProps<typeof TextInput>, "id" | "invalid"> & {
  id: string;
  label: ReactNode;
  labelNote?: ReactNode;
  labelAside?: ReactNode;
  error?: string;
  // Grey help under the input, shown only while there is no error.
  hint?: ReactNode;
  // Green confirmation under the input ("will be saved as ...").
  success?: ReactNode;
  // Extra content between the input and its message, e.g. a strength meter.
  below?: ReactNode;
  password?: boolean;
  className?: string;
};

// One labelled input with its single message line, wired for screen readers.
export function LabeledInput({ id, label, labelNote, labelAside, error, hint, success, below, password = false, className, ...inputProps }: LabeledInputProps) {
  const messageId = `${id}-msg`;
  const message = error ? (
    <FieldMessage id={messageId} tone="error">
      {error}
    </FieldMessage>
  ) : success ? (
    <FieldMessage id={messageId} tone="success">
      {success}
    </FieldMessage>
  ) : hint ? (
    <FieldMessage id={messageId} tone="hint">
      {hint}
    </FieldMessage>
  ) : null;
  const Input = password ? PasswordInput : TextInput;

  return (
    <FormField id={id} label={label} labelNote={labelNote} labelAside={labelAside} className={className}>
      <Input id={id} invalid={Boolean(error)} aria-describedby={message ? messageId : undefined} {...inputProps} />
      {below}
      {message}
    </FormField>
  );
}
