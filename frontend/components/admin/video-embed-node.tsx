'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';

import { embedSrc, posterFor, videoMarker } from '@/lib/embeds';

/**
 * A video in a story, as a block the editor can show and move.
 *
 * It survives the trip to Markdown and back as
 * `<div data-video="…"></div>` — see lib/embeds.ts for why that marker rather
 * than a bespoke syntax.
 *
 * In the editor it is drawn as a still with a play badge rather than a live
 * iframe. A real player inside a text editor swallows clicks meant for placing
 * the cursor, and an editor that will not let you put the caret after a video
 * is worse than one that shows a picture of it.
 */

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    videoEmbed: {
      setVideoEmbed: (attrs: { url: string }) => ReturnType;
    };
  }
}

function VideoView({ node, selected, deleteNode, editor }: NodeViewProps) {
  const url = (node.attrs.url as string) ?? '';
  const poster = posterFor(url);
  const playable = Boolean(embedSrc(url));

  return (
    <NodeViewWrapper
      className={`story-editor__video${selected ? ' is-selected' : ''}`}
      data-drag-handle
    >
      <div className="story-editor__video-frame">
        {poster ? <img src={poster} alt="" /> : <div className="story-editor__video-blank" />}
        <span className="story-editor__video-badge">{playable ? '▶ Video' : 'Unrecognised link'}</span>
      </div>
      <div className="story-editor__video-meta">
        <span className="truncate">{url}</span>
        {editor.isEditable ? (
          <button type="button" onClick={() => deleteNode()} className="shrink-0 underline">
            Remove
          </button>
        ) : null}
      </div>
    </NodeViewWrapper>
  );
}

export const VideoEmbed = Node.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      url: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-video]',
        getAttrs: (element) => ({ url: (element as HTMLElement).getAttribute('data-video') ?? '' }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-video': HTMLAttributes.url })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoView);
  },

  addCommands() {
    return {
      setVideoEmbed:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },

  // How it is written into the story body, and read back out of it.
  addStorage() {
    return {
      markdown: {
        serialize(state: { write: (s: string) => void; closeBlock: (n: unknown) => void }, node: { attrs: { url: string } }) {
          state.write(videoMarker(node.attrs.url));
          state.closeBlock(node);
        },
        parse: {},
      },
    };
  },
});
