import { ArrowUpRight, BracketsCurly, CirclesThreePlus, Flask, Graph } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { capabilities } from "../data/capabilities";

const icons = { BracketsCurly, CirclesThreePlus, Flask, Graph };
const previewNodes = [
  [18, 50], [48, 24], [78, 42], [53, 68], [89, 76], [22, 82], [70, 91],
];
const previewLinks = [[0, 1], [1, 2], [0, 3], [3, 4], [3, 5], [5, 6], [2, 6]];

function NetworkPreview({ index }) {
  return (
    <svg aria-hidden="true" className="capability-preview" viewBox="0 0 108 108">
      <g className="capability-preview-links">
        {previewLinks.map(([source, target]) => (
          <line key={`${source}-${target}`} x1={previewNodes[source][0]} x2={previewNodes[target][0]} y1={previewNodes[source][1]} y2={previewNodes[target][1]} />
        ))}
      </g>
      <g className="capability-preview-nodes">
        {previewNodes.map(([x, y], nodeIndex) => (
          <circle cx={x} cy={y} key={`${x}-${y}`} r={nodeIndex === index + 1 ? 4.5 : 2.7} style={{ "--delay": `${nodeIndex * -0.42}s` }} />
        ))}
      </g>
    </svg>
  );
}

export function KnowledgeNetwork() {
  return (
    <div className="focus-grid capability-entry-grid">
      {capabilities.map((capability, index) => {
        const Icon = icons[capability.icon];
        return (
          <Link className="focus-card capability-entry-card reveal-item" key={capability.slug} to={`/capabilities/${capability.slug}`}>
            <span className="capability-number">{capability.number}</span>
            <Icon className="capability-icon" size={31} weight="duotone" />
            <NetworkPreview index={index} />
            <div className="capability-card-copy">
              <p>{capability.title}</p>
              <h3>{capability.titleZh}</h3>
              <span>{capability.description}</span>
            </div>
            <strong className="capability-card-link">探索知识图谱 <ArrowUpRight size={16} /></strong>
          </Link>
        );
      })}
    </div>
  );
}
