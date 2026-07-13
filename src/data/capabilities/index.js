import { agentOrchestration } from "./agentOrchestration";
import { dataWorkflows } from "./dataWorkflows";
import { llmApplications } from "./llmApplications";
import { researchPrototyping } from "./researchPrototyping";

export const capabilities = [agentOrchestration, llmApplications, dataWorkflows, researchPrototyping];
export const capabilityBySlug = Object.fromEntries(capabilities.map((capability) => [capability.slug, capability]));
