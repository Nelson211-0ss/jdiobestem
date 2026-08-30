'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Markdown } from 'tiptap-markdown';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Heading2,
  Redo2,
  Undo2,
  Heading3,
  Image as ImageIcon,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Video,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { embedSrc, posterFor, videoMarker } from '@/lib/embeds';
import { uploadFile } from '@/lib/upload';
import { StoryImage } from './story-image';
import { VideoEmbed } from './video-embed-node';

/**
 * The story editor.
 *
 * Bodies are still Markdown in the database — the website renders them with the
 * same parser it always has, and every story written before this keeps working.
 * What changed is the surface: a heading now looks like a heading while it is
 * being written, rather than reading `## Heading` and being told to imagine it.
 *
 * Pictures and video sit in the flow where they will appear, because deciding
 * that a photograph belongs after the third paragraph is a judgement about the
 * story, and it cannot be made against a wall of monospace.
 */

/** The document as Markdown. Typed here because the extension does not. */
function markdownOf(editor: Editor): string {
  const storage = editor.storage as unknown as {
    markdown?: { getMarkdown: () => string };
  };
  return storage.markdown?.getMarkdown() ?? '';
}

function ToolButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
        'text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50',
        active && 'bg-muted text-foreground'
      )}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  disabled,
  ariaLabelledBy,
}: {
  /** Markdown. */
  value: string;
  onChange: (markdown: string) => void;
  disabled?: boolean;
  ariaLabelledBy?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // What we last handed upstream. Compared on the way back in so that a parent
  // re-render does not reset the document under the cursor.
  const lastEmitted = useRef(value);

  const editor = useEditor({
    // Rendered on the client only: the editor reads the DOM as it mounts, and
    // letting the server render a different tree first causes a hydration
    // mismatch on every load.
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: false,
      }),
      Link.configure({ openOnClick: false, autolink: true }),
      StoryImage.configure({ inline: false }),
      VideoEmbed,
      Markdown.configure({ html: true, transformPastedText: true, linkify: false }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'story-editor__surface',
        ...(ariaLabelledBy ? { 'aria-labelledby': ariaLabelledBy } : {}),
      },
    },
    onUpdate: ({ editor: e }) => {
      const markdown = markdownOf(e);
      lastEmitted.current = markdown;
      onChange(markdown);
    },
  });

  // Content arriving from outside — a record loading, a draft restored.
  useEffect(() => {
    if (!editor) return;
    if (value === lastEmitted.current) return;
    lastEmitted.current = value;
    editor.commands.setContent(value || '', { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  const addImage = useCallback(
    async (file: File) => {
      if (!editor) return;
      setUploadError('');
      setUploading(true);
      try {
        const { url } = await uploadFile(file, { folder: 'news' });
        // Alt text is the file's name to begin with — a placeholder that is
        // wrong is still better than an empty alt, because it is visible and
        // gets corrected, where an empty one is silently shipped.
        editor
          .chain()
          .focus()
          .setImage({ src: url, alt: file.name.replace(/\.[^.]+$/, '') })
          .run();
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'That image would not upload.');
      } finally {
        setUploading(false);
      }
    },
    [editor]
  );

  const insertVideo = () => {
    if (!editor) return;
    const src = embedSrc(videoUrl);
    if (!src) return;
    editor.chain().focus().setVideoEmbed({ url: videoUrl.trim() }).run();
    setVideoUrl('');
    setVideoOpen(false);
  };

  const setLink = () => {
    if (!editor) return;
    const existing = editor.getAttributes('link').href as string | undefined;
    const href = window.prompt('Link address', existing ?? 'https://');
    if (href === null) return;
    if (!href.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: href.trim() }).run();
  };

  if (!editor) {
    return (
      <div className="story-editor">
        <div className="story-editor__surface text-muted-foreground">Loading the editor…</div>
      </div>
    );
  }

  const videoPreview = embedSrc(videoUrl);

  return (
    <div className={cn('story-editor', disabled && 'is-readonly')}>
      <div className="story-editor__bar">
        {/* First, because undo is what you reach for fastest and looking for
            it is the moment you have already lost the paragraph. */}
        <ToolButton
          label="Undo"
          disabled={disabled || !editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Redo"
          disabled={disabled || !editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="h-4 w-4" />
        </ToolButton>

        <span className="story-editor__divider" aria-hidden="true" />

        <ToolButton
          label="Heading"
          disabled={disabled}
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Sub-heading"
          disabled={disabled}
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Bold"
          disabled={disabled}
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Italic"
          disabled={disabled}
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolButton>
        <ToolButton label="Link" disabled={disabled} active={editor.isActive('link')} onClick={setLink}>
          <Link2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Bulleted list"
          disabled={disabled}
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Numbered list"
          disabled={disabled}
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Quote"
          disabled={disabled}
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolButton>

        <span className="story-editor__divider" aria-hidden="true" />

        <ToolButton
          label="Indent"
          disabled={disabled || !editor.can().sinkListItem('listItem')}
          onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
        >
          <IndentIncrease className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Outdent"
          disabled={disabled || !editor.can().liftListItem('listItem')}
          onClick={() => editor.chain().focus().liftListItem('listItem').run()}
        >
          <IndentDecrease className="h-4 w-4" />
        </ToolButton>

        <span className="story-editor__divider" aria-hidden="true" />

        <ToolButton
          label="Insert a picture"
          disabled={disabled || uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
        </ToolButton>
        <ToolButton label="Insert a video" disabled={disabled} onClick={() => setVideoOpen(true)}>
          <Video className="h-4 w-4" />
        </ToolButton>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) void addImage(file);
        }}
      />

      <EditorContent editor={editor} />

      {uploadError ? (
        <p role="alert" className="px-4 pb-3 text-xs font-medium text-destructive">
          {uploadError}
        </p>
      ) : null}

      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a video</DialogTitle>
            <DialogDescription>
              Paste a YouTube or Vimeo link.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="video-url">Video link</Label>
            <Input
              id="video-url"
              className="h-12"
              placeholder="https://www.youtube.com/watch?v=…"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && videoPreview) {
                  e.preventDefault();
                  insertVideo();
                }
              }}
            />
            {videoUrl.trim() && !videoPreview ? (
              <p className="text-xs font-medium text-destructive">
                That is not a YouTube or Vimeo link we recognise.
              </p>
            ) : null}
            {videoPreview ? (
              <img
                src={posterFor(videoUrl)}
                alt=""
                className="mt-2 w-full rounded-lg bg-muted object-cover"
              />
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setVideoOpen(false)}>
              Cancel
            </Button>
            <Button onClick={insertVideo} disabled={!videoPreview}>
              Add it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { videoMarker };
