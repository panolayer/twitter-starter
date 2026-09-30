import Link from 'next/link';

export default function PostText({ text }: { text: string }) {
  return (
    <p className="post-text">
      {text.split(/(#[a-zA-Z][a-zA-Z0-9_]*|@[a-zA-Z][a-zA-Z0-9_]*)/g).map((part, index) => {
        if (part.startsWith('#'))
          return (
            <Link key={index} className="text-link" href={`/explore?q=${encodeURIComponent(part)}`}>
              {part}
            </Link>
          );
        if (part.startsWith('@'))
          return (
            <Link
              key={index}
              className="text-link"
              href={`/profile/${part.slice(1).toLowerCase()}`}
            >
              {part}
            </Link>
          );
        return part;
      })}
    </p>
  );
}
