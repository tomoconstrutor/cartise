export const FORM_ENDPOINT = "https://formsubmit.co/ajax/tiago.linares@cartise.pt";

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
  payload.set("_cc", "tomas.ferreira@cartise.pt");
  payload.set("request_type", type === "driver" ? "driver" : "campaign");
  payload.set("language", lang);
  return payload;
}

export async function submitLead(payload, fetchImplementation = fetch) {
  const response = await fetchImplementation(FORM_ENDPOINT, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: payload,
  });

  if (!response.ok) {
    throw new Error(`Form submission failed with status ${response.status}`);
  }

  return response;
}
