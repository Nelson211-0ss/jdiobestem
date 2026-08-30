import Image from '@tiptap/extension-image';

/**
 * A picture in a story, serialized as its own Markdown block.
 *
 * tiptap-markdown writes an image without closing the block after it, so
 * whatever follows is glued onto the same line:
 *
 *     ![a](photo.jpg)## The next heading
 *
 * Markdown then reads that heading as ordinary text in the paragraph, and the
 * story silently loses a heading the moment anyone puts a photograph above one.
 * Overriding the serializer to close the block is the fix; everything else
 * about the extension is left alone.
 */
export const StoryImage = Image.extend({
  addStorage() {
    return {
      markdown: {
        serialize(
          state: {
            write: (s: string) => void;
            closeBlock: (n: unknown) => void;
            esc: (s: string) => string;
          },
          node: { attrs: { src?: string; alt?: string; title?: string } }
        ) {
          const alt = state.esc(node.attrs.alt ?? '');
          const src = node.attrs.src ?? '';
          const title = node.attrs.title ? ` "${node.attrs.title}"` : '';
          state.write(`![${alt}](${src}${title})`);
          state.closeBlock(node);
        },
        parse: {},
      },
    };
  },
});
