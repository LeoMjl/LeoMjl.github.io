import { Check } from "@phosphor-icons/react";
import { allOutputs, experiences } from "../data/portfolio";
import { useReveal } from "../hooks/useReveal";

export function ExperiencePage() {
  useReveal("experience");
  return (
    <div className="route-page">
      <header className="route-hero reveal-item is-visible"><p className="signal-label">EXPERIENCE / 02</p><h1>Building agents at supercomputing scale.</h1><p>仅展示我在山东省计算中心（国家超算济南中心）承担的大模型应用与智能体研发工作。</p></header>
      <div className="full-timeline">
        {experiences.map((item, index) => {
          const outputs = allOutputs.filter((output) => item.outputs.includes(output.id));
          return (
            <article className="full-timeline-item reveal-item" key={item.id}>
              <div className="timeline-index">0{index + 1}</div>
              <div className="timeline-date"><span>{item.period}</span><small>{item.type}</small></div>
              <div className="timeline-main"><p className="signal-label">{item.organization}</p><h2>{item.role}</h2><p>{item.summary}</p><ul>{item.details.map((detail) => <li key={detail}><Check size={16} />{detail}</li>)}</ul>{outputs.length ? <div className="experience-outputs"><span>Outputs</span>{outputs.map((output) => <div key={output.id}><small>{output.type}</small><strong>{output.title}</strong></div>)}</div> : null}</div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
