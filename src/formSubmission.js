import { isLocalPreview } from './analytics.js';

export const FORM_ENDPOINT = "https://formsubmit.co/ajax/hello@cartise.pt";

const subjects = {
  proposal: {
    pt: "Cartise — Pedido de campanha",
    en: "Cartise — Campaign proposal request",
  },
  driver: {
    pt: "Cartise — Adesão à rede TVDE",
    en: "Cartise — TVDE network application",
  },
};

export function createLeadPayload(form, type, lang) {
  const payload = new FormData(form);
  payload.set("_subject", subjects[type]?.[lang] ?? subjects.proposal.pt);
  payload.set("_template", "table");
  payload.set("request_type", type === "driver" ? "driver" : "campaign");
  payload.set("language", lang);
  return payload;
}

export async function submitLead(payload, fetchImplementation = fetch, { simulation = 'success', hostname = globalThis.location?.hostname ?? '' } = {}) {
  // Local previews never send test contact details to the external delivery service.
  if (isLocalPreview(hostname)) {
    if (simulation === 'error') throw new Error('Simulated delivery error');
    return { ok: true, simulated: true };
  }
  const response = await fetchImplementation(FORM_ENDPOINT, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: payload,
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Form submission failed with status ${response.status}`);
  }

  const result = await response.json();
  if (result.success !== true && result.success !== 'true') throw new Error('Delivery service did not accept the request');
  return response;
}
