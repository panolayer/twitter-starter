export default function Loading() {
  return (
    <div className="loading-skeleton" role="status" aria-label="Loading Chirp">
      <div className="skeleton-title" />
      {[0, 1, 2, 3].map((item) => (
        <div className="skeleton-post" key={item}>
          <div className="skeleton-avatar" />
          <div>
            <div className="skeleton-line" />
            <div className="skeleton-line long" />
            <div className="skeleton-line" />
          </div>
        </div>
      ))}
    </div>
  );
}
