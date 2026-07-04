import { useEffect, useRef, useState } from 'react';

interface EmojiPickerProps {
  currentIcon: string;
  onSelect: (emoji: string) => void;
}

const EMOJIS = [
  '📝', '📊', '🏃', '💡', '📅', '🎯', '🚀', '⭐', '🔥', '💻',
  '🎨', '✍️', '📚', '🧠', '⚙️', '📂', '💬', '📞', '📧', '📌',
  '❤️', '🎉', '🍀', '✨', '⚡', '🛠️', '🛒', '💰', '🏠', '✈️',
  '☕', '🍕', '🐱', '🐶', '🌳', '🌍', '⏰', '🔒', '🔑', '🏷️',
];

export default function EmojiPicker({ currentIcon, onSelect }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="emoji-picker-container" ref={ref}>
      <span
        className="emoji-picker-trigger"
        onClick={() => setOpen(!open)}
        title="Change icon"
      >
        {currentIcon || '📝'}
      </span>

      {open && (
        <div className="emoji-picker-popover">
          <div className="emoji-picker-grid">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                className={`emoji-btn ${currentIcon === emoji ? 'active' : ''}`}
                onClick={() => {
                  onSelect(emoji);
                  setOpen(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
