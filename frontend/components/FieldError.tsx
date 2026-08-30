/**
 * The message under a field that failed validation.
 *
 * `role="alert"` so a screen reader announces it when it appears, and a stable
 * id so the input can point at it with `aria-describedby` — an outline in a
 * colour is not a message if you cannot see the colour.
 */
export default function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span id={id} role="alert" className="field-error">
      {message}
    </span>
  );
}
