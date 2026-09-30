'use client';
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="welcome-panel" role="alert">
      <span className="welcome-icon">☁</span>
      <h2>A brief interruption.</h2>
      <p>Chirp could not load this view. Try again in a moment.</p>
      <button type="button" className="compose-submit" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
