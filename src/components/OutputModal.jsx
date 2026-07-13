import { useEffect, useRef } from "react";
import { ArrowSquareOut, X } from "@phosphor-icons/react";

const typeLabels = {
  paper: "PAPER",
  patent: "PATENT",
  report: "REPORT",
  software: "SOFTWARE",
  demo: "DEMO",
  dataset: "DATASET",
};

export function OutputModal({ output, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!output) return undefined;
    const previous = document.activeElement;
    const dialog = dialogRef.current;
    document.body.classList.add("modal-open");
    dialog?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !dialog) return;
      const focusable = [...dialog.querySelectorAll("button, a[href]")];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKeyDown);
      previous?.focus?.();
    };
  }, [onClose, output]);

  if (!output) return null;

  return (
    <div className="modal-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section aria-labelledby="output-title" aria-modal="true" className="output-modal" ref={dialogRef} role="dialog" tabIndex={-1}>
        <button aria-label="关闭成果详情" className="icon-button modal-close" onClick={onClose} type="button">
          <X size={20} weight="bold" />
        </button>
        <p className="signal-label">{typeLabels[output.type] || output.type.toUpperCase()}</p>
        <h2 id="output-title">{output.title}</h2>
        <div className="output-meta">
          <span>{output.year}</span>
          {output.status ? <span>{output.status}</span> : null}
          {output.venue ? <span>{output.venue}</span> : null}
        </div>
        {output.authors?.length ? <p className="output-authors">{output.authors.join(", ")}</p> : null}
        <div className="modal-section">
          <h3>{output.type === "patent" ? "Core Idea" : "Abstract"}</h3>
          <p>{output.summary}</p>
        </div>
        {output.contribution?.length ? (
          <div className="modal-section">
            <h3>My Contribution</h3>
            <ul>{output.contribution.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        ) : null}
        <div className="modal-section related-project">
          <h3>Related Project</h3>
          <p>{output.relatedProject}</p>
        </div>
        <div className="modal-actions">
          {output.paperUrl ? <a className="button button-primary" href={output.paperUrl} rel="noreferrer" target="_blank">View Paper <ArrowSquareOut size={17} /></a> : null}
          {output.codeUrl ? <a className="button button-secondary" href={output.codeUrl} rel="noreferrer" target="_blank">View Code <ArrowSquareOut size={17} /></a> : null}
          {!output.isPublic ? <span className="private-note">非公开成果仅展示摘要信息</span> : null}
        </div>
      </section>
    </div>
  );
}

