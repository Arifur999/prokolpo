type FieldMeta = { errors: unknown[]; isBlurred: boolean };

// The design's rule (board RegisterStates): an error shows once the person has left the
// field or pressed submit, and clears as soon as the value is fixed. A server error for
// the field shows until the field is edited.
export const visibleFieldError = (meta: FieldMeta, submitted: boolean, serverError?: string): string | undefined => {
  if (serverError) return serverError;
  if (!meta.isBlurred && !submitted) return undefined;
  const first = meta.errors[0];
  if (typeof first === "string") return first;
  if (first && typeof first === "object" && "message" in first && typeof first.message === "string") return first.message;
  return undefined;
};
