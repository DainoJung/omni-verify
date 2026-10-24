// "Publish to Threads" on the Verified card. Kept out of index.html so the timeline file stays small to merge.
// index.html fires omni:result (with the card element) and omni:reverified; this file adds the publish section.
(() => {
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const sections = new Map(); // campaign id -> section element

  const style = document.createElement("style");
  style.textContent = `
    .publish { margin-top: 14px; border-top: 1px solid var(--line); padding-top: 12px; }
    .publish button { margin-top: 8px; }
    .publish .confirm { margin-top: 10px; border: 1px solid var(--fg); border-radius: 6px; padding: 12px; }
    .publish .mode { font: 600 11px var(--mono); padding: 2px 7px; border-radius: 4px; border: 1px solid var(--warn); color: var(--warn); margin-left: 8px; }
    .publish .row { display: flex; gap: 10px; }
    .publish .row button { flex: 1; }
    .publish .locked { color: var(--dim); font-size: 13px; }
    .publish .done { color: var(--pass); }`;
  document.head.appendChild(style);

  async function status(id, withAccount) {
    const res = await fetch(`/api/campaigns/${encodeURIComponent(id)}/publish${withAccount ? "?account=1" : ""}`);
    return res.json();
  }

  async function render(id) {
    const el = sections.get(id);
    if (!el) return;
    const s = await status(id, false);
    const mode = s.mode === "live" ? "" : `<span class="mode">DRY RUN</span>`;
    if (s.published) {
      el.innerHTML = `<div class="k">Published</div>
        <div class="done">Posted to Threads as @${esc(s.published.account)} on ${esc(s.published.at.slice(0, 16).replace("T", " "))} UTC</div>
        <div class="mono"><a href="${esc(s.published.url)}" target="_blank" rel="noopener">${esc(s.published.url)}</a></div>
        <div class="hint">Gate at publish time: ${esc(s.published.kane)} · version ${esc(s.published.version)}</div>`;
      return;
    }
    const lastDry = s.dryRuns.at(-1);
    el.innerHTML = `<div class="k">Publish${mode}</div>
      ${s.gate.ok ? `<div class="hint">${esc(s.gate.reason)}</div>` : `<div class="locked">Locked: ${esc(s.gate.reason)}</div>`}
      <button class="ghost open" ${s.gate.ok ? "" : "disabled"}>Publish to Threads</button>
      ${lastDry ? `<div class="hint">Last dry run ${esc(lastDry.at.slice(0, 16).replace("T", " "))} UTC as @${esc(lastDry.account)}: nothing was posted.</div>` : ""}
      <div class="slot"></div>`;
    el.querySelector("button.open").onclick = () => openConfirm(id, el);
  }

  async function openConfirm(id, el) {
    const slot = el.querySelector(".slot");
    slot.innerHTML = `<div class="hint">Checking the Threads account…</div>`;
    const s = await status(id, true);
    if (!s.gate.ok) return render(id);
    if (!s.account) {
      slot.innerHTML = `<div class="locked">Can't publish: ${esc(s.accountError ?? "no Threads account")}</div>`;
      return;
    }
    const live = s.mode === "live";
    slot.innerHTML = `<div class="confirm">
      <div class="k">${live ? "This posts publicly" : "Dry run: nothing will be posted"}</div>
      <div>Account: <b>@${esc(s.account)}</b></div>
      <div class="k">Exact text</div><div class="copy">${esc(s.text)}</div>
      <div class="k">Kane</div><div>${esc(s.gate.reason)} <span class="mono">version ${esc(s.gate.version)}</span></div>
      <div class="row"><button class="ghost cancel">Cancel</button><button class="go">${live ? `Confirm: publish as @${esc(s.account)}` : "Confirm dry run"}</button></div>
      <div class="msg"></div></div>`;
    slot.querySelector(".cancel").onclick = () => render(id);
    const go = slot.querySelector(".go");
    go.onclick = async () => {
      go.disabled = true; go.textContent = live ? "Publishing…" : "Running…";
      const res = await fetch(`/api/campaigns/${encodeURIComponent(id)}/publish`, {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ version: s.gate.version, confirm: true }),
      });
      const body = await res.json();
      if (!res.ok) {
        slot.querySelector(".msg").innerHTML = `<div class="error">${esc(body.error)}</div>`;
        go.disabled = false; go.textContent = "Try again";
        return;
      }
      render(id);
    };
  }

  document.addEventListener("omni:result", (e) => {
    const { rec, el } = e.detail;
    if (rec.status !== "verified" || !el) return;
    const card = el.querySelector(".card");
    const section = document.createElement("div");
    section.className = "publish";
    card.appendChild(section);
    sections.set(rec.id, section);
    render(rec.id);
  });
  document.addEventListener("omni:reverified", (e) => render(e.detail.id));
})();
