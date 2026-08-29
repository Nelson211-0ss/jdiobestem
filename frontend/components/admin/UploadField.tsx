'use client';

import FileDropzone from '@/components/FileDropzone';

/**
 * The dashboard's upload control.
 *
 * A thin wrapper now: every upload in the app — admin and website — goes
 * through the same dropzone, so they behave identically and there is one place
 * to change how uploading works.
 */
export default function UploadField({
  id,
  value,
  folder,
  disabled,
  onChange,
}: {
  id: string;
  value: string;
  folder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  // Folders that hold documents rather than artwork get the file wording and
  // accept PDFs first; everything else is a picture.
  const documentish = ['documents', 'newsletter', 'receipts', 'cv'].includes(folder);

  return (
    <FileDropzone
      id={id}
      value={value}
      onChange={onChange}
      endpoint="/api/admin/upload"
      folder={folder}
      disabled={disabled}
      kind={documentish ? 'file' : 'image'}
      accept={
        documentish
          ? 'application/pdf,image/jpeg,image/png,image/webp'
          : 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml,application/pdf'
      }
      supports={documentish ? 'PDF, JPG, PNG or WebP · up to 15 MB' : 'JPG, PNG, WebP, GIF or SVG · up to 15 MB'}
    />
  );
}
