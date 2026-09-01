export function PagerNav({
  label,
  onPrev,
  onNext,
  prevAriaLabel = "Previous",
  nextAriaLabel = "Next",
}) {
  return (
    <div className="pager-nav">
      <button type="button" onClick={onPrev} aria-label={prevAriaLabel}>
        ‹
      </button>
      <h2>{label}</h2>
      <button type="button" onClick={onNext} aria-label={nextAriaLabel}>
        ›
      </button>
    </div>
  );
}
