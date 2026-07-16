export function EntryScrollHint({ onEnter }) {
  return (
    <button className="entry-scroll-hint" onClick={onEnter} type="button">
      <span className="entry-hint-label entry-hint-desktop">SCROLL TO ENTER</span>
      <span className="entry-hint-label entry-hint-mobile">SWIPE UP TO ENTER</span>
      <span aria-hidden="true" className="entry-hint-motion">
        <span className="entry-mouse"><i /></span>
        <span className="entry-arrow">↓</span>
      </span>
      <span aria-hidden="true" className="entry-hint-track"><i /></span>
    </button>
  );
}
