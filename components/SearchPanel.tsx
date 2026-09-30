'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchPanel({ initialQuery = '' }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  return (
    <form
      className="search-form"
      onSubmit={(event) => {
        event.preventDefault();
        router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
      }}
    >
      <label className="sr-only" htmlFor="search-query">
        Search chirps
      </label>
      <input
        id="search-query"
        type="search"
        maxLength={100}
        placeholder="Search ideas, people, and topics"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <button className="compose-submit" type="submit">
        Search
      </button>
    </form>
  );
}
