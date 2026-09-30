'use client';

import { useRef } from 'react';
const EMOJI = [
  '✨',
  '🚀',
  '🌱',
  '💡',
  '🎉',
  '❤️',
  '👋',
  '☕',
  '🐦',
  '🧵',
  '👀',
  '🙌',
  '💻',
  '🌙',
  '🔥',
  '😊',
];
export default function EmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const ref = useRef<HTMLDetailsElement>(null);
  return (
    <details className="emoji-picker" ref={ref}>
      <summary aria-label="Add emoji">☺ Emoji</summary>
      <div className="emoji-grid" aria-label="Choose an emoji">
        {EMOJI.map((emoji) => (
          <button
            key={emoji}
            type="button"
            aria-label={`Insert ${emoji}`}
            onClick={() => {
              onSelect(emoji);
              if (ref.current) ref.current.open = false;
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </details>
  );
}
