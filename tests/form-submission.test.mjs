import test from "node:test";
import assert from "node:assert/strict";
import {
  FORM_ENDPOINT,
  createLeadPayload,
  submitLead,
} from "../src/formSubmission.js";

function formWith(values) {
  const form = new FormData();
  for (const [name, value] of Object.entries(values)) form.set(name, value);
  return form;
}

test("creates a differentiated campaign payload", () => {
  const input = formWith({ name: "Test User", email: "test@example.com", company: "Agency", city: "Lisbon" });
  const form = { [Symbol.iterator]: input[Symbol.iterator].bind(input) };
  const OriginalFormData = globalThis.FormData;

  globalThis.FormData = class extends OriginalFormData {
    constructor(source) {
      super();
      for (const [key, value] of source) this.set(key, value);
    }
  };

  try {
    const payload = createLeadPayload(form, "proposal", "pt");
    assert.equal(payload.get("_subject"), "Cartise — Pedido de campanha");
    assert.equal(payload.get("_cc"), null);
    assert.equal(payload.get("request_type"), "campaign");
    assert.equal(payload.get("language"), "pt");
    assert.equal(payload.get("email"), "test@example.com");
  } finally {
    globalThis.FormData = OriginalFormData;
  }
});

test("creates a differentiated driver payload", () => {
  const input = formWith({ name: "Driver", email: "driver@example.com", city: "Porto" });
  const form = { [Symbol.iterator]: input[Symbol.iterator].bind(input) };
  const OriginalFormData = globalThis.FormData;

  globalThis.FormData = class extends OriginalFormData {
    constructor(source) {
      super();
      for (const [key, value] of source) this.set(key, value);
    }
  };

  try {
    const payload = createLeadPayload(form, "driver", "en");
    assert.equal(payload.get("_subject"), "Cartise — TVDE network application");
    assert.equal(payload.get("request_type"), "driver");
    assert.equal(payload.get("language"), "en");
  } finally {
    globalThis.FormData = OriginalFormData;
  }
});

test("submits to FormSubmit and resolves on success", async () => {
  let request;
  const payload = new FormData();
  payload.set("email", "test@example.com");
  const response = await submitLead(payload, async (url, options) => {
    request = { url, options };
    return { ok: true, status: 200 };
  });

  assert.equal(response.ok, true);
  assert.equal(request.url, FORM_ENDPOINT);
  assert.equal(request.options.method, "POST");
  assert.equal(request.options.body, payload);
});

test("rejects failed FormSubmit responses", async () => {
  await assert.rejects(
    submitLead(new FormData(), async () => ({ ok: false, status: 500 })),
    /status 500/,
  );
});
