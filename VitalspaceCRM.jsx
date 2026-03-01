import { useState, useCallback, useMemo } from "react";

// ─── DATA ───────────────────────────────────────────────────────────────────

const STAGES = [
  { key: "lead", label: "Lead", color: "#6366f1" },
  { key: "technical_audit", label: "Technický audit", color: "#7c3aed" },
  { key: "proposal_sent", label: "Nabídka", color: "#2563eb" },
  { key: "negotiation", label: "Vyjednávání", color: "#d97706" },
  { key: "contract_signed", label: "Smlouva", color: "#059669" },
  { key: "installation", label: "Instalace", color: "#0891b2" },
  { key: "handover", label: "Předání", color: "#0d9488" },
  { key: "closed_won", label: "Uzavřeno", color: "#16a34a" },
  { key: "closed_lost", label: "Ztraceno", color: "#dc2626" },
];

const PRODUCTS = [
  { id: "p1", sku: "VC-CLEAN-UP-20", name: "Clean Up", category: "nastropni", price: 45000, ozone: 20, coverage: 80, desc: "Nástropní modul 595×595mm, dvojitý režim" },
  { id: "p2", sku: "VC-PRO-I-40", name: "PRO I PLUS", category: "mobilni", price: 58000, ozone: 40, coverage: 200, desc: "Mobilní generátor 40g/h, mikropočítačem řízený" },
  { id: "p3", sku: "VC-BOX-DRY-10", name: "Clean Box DRY", category: "box", price: 32000, ozone: 10, coverage: null, desc: "Dezinfekční box pro předměty, cykly 15-45 min" },
  { id: "p4", sku: "SRV-INST", name: "Montáž Clean Up", category: "sluzba", price: 5000, ozone: 0, coverage: null, desc: "Montáž do podhledu + elektrické zapojení" },
  { id: "p5", sku: "SRV-AUDIT", name: "Technický audit", category: "sluzba", price: 3500, ozone: 0, coverage: null, desc: "Zaměření prostor, měření VOC/PM2.5/CO2" },
  { id: "p6", sku: "SRV-CERT", name: "Certifikace", category: "sluzba", price: 2000, ozone: 0, coverage: null, desc: "Výstupní měření, Protokol o detoxikaci" },
];

const SEGMENTS = [
  "Základní školy", "Mateřské školy", "Střední a vysoké školy",
  "Kanceláře a IT centra", "Call centra", "Coworkingová centra",
  "Nemocnice a kliniky", "Ambulance a ordinace", "Stomatologie", "Domovy seniorů",
  "Výrobní podniky", "Potravinářský průmysl", "Sklady a logistika",
  "Hotely", "Restaurace a kavárny", "Penziony a Airbnb",
  "Fitness centra", "Sportovní haly", "Bazény a aquaparky",
  "Městské úřady", "Knihovny", "Kina a divadla",
  "Ostatní",
];

const REGIONS = ["Plzeňský kraj", "Praha", "Středočeský kraj", "Ostatní"];

const catLabel = { nastropni: "Nástropní", mobilni: "Mobilní", box: "Box", sluzba: "Služba" };
const catDot = { nastropni: "#6366f1", mobilni: "#d97706", box: "#059669", sluzba: "#64748b" };

const initialProspects = [
  { id: "pr1", company: "ZŠ Masarykova", ico: "12345678", segment: "Základní školy", region: "Plzeňský kraj", city: "Plzeň", contact: "Ing. Novák", email: "novak@zsmasarykova.cz", phone: "377111222", status: "contacted", priority: 1, employees: 45, source: "Referral", notes: "Ředitel projevil zájem po prezentaci na konferenci" },
  { id: "pr2", company: "Tech Tower Plzeň", ico: "87654321", segment: "Kanceláře a IT centra", region: "Plzeňský kraj", city: "Plzeň", contact: "Jan Dvořák", email: "dvorak@techtower.cz", phone: "377222333", status: "meeting_scheduled", priority: 1, employees: 200, source: "LinkedIn", notes: "Facility manager, schůzka 5.3." },
  { id: "pr3", company: "FN Plzeň", ico: "11223344", segment: "Nemocnice a kliniky", region: "Plzeňský kraj", city: "Plzeň", contact: "MUDr. Svobodová", email: "svobodova@fnplzen.cz", phone: "377333444", status: "not_contacted", priority: 2, employees: 3000, source: "ARES", notes: "" },
  { id: "pr4", company: "Marriott Prague", ico: "55667788", segment: "Hotely", region: "Praha", city: "Praha 1", contact: "Petra Králová", email: "kralova@marriott.cz", phone: "221444555", status: "qualified", priority: 1, employees: 120, source: "Web", notes: "Proběhl audit, zájem o kompletní řešení" },
  { id: "pr5", company: "Škoda Components", ico: "99887766", segment: "Výrobní podniky", region: "Plzeňský kraj", city: "Plzeň", contact: "Ing. Procházka", email: "prochazka@skoda.cz", phone: "377555666", status: "not_contacted", priority: 2, employees: 500, source: "Firmy.cz", notes: "BOZP oddělení — potenciál PRO I PLUS" },
  { id: "pr6", company: "FitLife Gym", ico: "44332211", segment: "Fitness centra", region: "Plzeňský kraj", city: "Plzeň", contact: "Tomáš Malý", email: "maly@fitlife.cz", phone: "377666777", status: "contacted", priority: 3, employees: 15, source: "LinkedIn", notes: "Zájem o dezinfekci šaten" },
];

const initialClients = [
  { id: "cl1", company: "Ambiente s.r.o.", ico: "11112222", segment: "Restaurace a kavárny", region: "Praha", city: "Praha 2", contact: "Marie Černá", email: "cerna@ambiente.cz", phone: "221888999", paymentDays: 14, totalRevenue: 95000, dealsCount: 1, notes: "Spokojený klient, potenciál pro další pobočky" },
  { id: "cl2", company: "ZŠ Bory Plzeň", ico: "33334444", segment: "Základní školy", region: "Plzeňský kraj", city: "Plzeň", contact: "Mgr. Šimková", email: "simkova@zsbory.cz", phone: "377999111", paymentDays: 30, totalRevenue: 680000, dealsCount: 1, notes: "14x Clean Up, předání probíhá" },
  { id: "cl3", company: "DS Rokycany", ico: "55556666", segment: "Domovy seniorů", region: "Plzeňský kraj", city: "Rokycany", contact: "PhDr. Krejčí", email: "krejci@dsrokycany.cz", phone: "371222333", paymentDays: 21, totalRevenue: 750000, dealsCount: 1, notes: "15x Clean Up + 1x PRO I PLUS, montáž probíhá" },
];

const initialDeals = [
  { id: "d1", title: "ZŠ Masarykova — kompletní řešení", company: "ZŠ Masarykova", segment: "Základní školy", stage: "technical_audit", items: [{ product: "p1", qty: 20 }, { product: "p4", qty: 20 }, { product: "p3", qty: 1 }, { product: "p5", qty: 1 }], consultant: "David", created: "2025-02-10", note: "Ředitel čeká na rozpočet z kraje" },
  { id: "d2", title: "Tech Tower — kanceláře F1-F3", company: "Tech Tower Plzeň", segment: "Kanceláře a IT centra", stage: "proposal_sent", items: [{ product: "p1", qty: 10 }, { product: "p2", qty: 2 }, { product: "p4", qty: 10 }, { product: "p5", qty: 1 }], consultant: "David", created: "2025-02-05", note: "Facility manager potvrdil zájem" },
  { id: "d3", title: "FitLife — šatny + hala", company: "FitLife Gym", segment: "Fitness centra", stage: "lead", items: [{ product: "p2", qty: 1 }, { product: "p3", qty: 2 }], consultant: "David", created: "2025-02-20", note: "Studený kontakt přes LinkedIn" },
  { id: "d4", title: "Marriott Praha — 40 pokojů", company: "Marriott Prague", segment: "Hotely", stage: "negotiation", items: [{ product: "p1", qty: 40 }, { product: "p4", qty: 40 }, { product: "p2", qty: 3 }, { product: "p3", qty: 2 }, { product: "p5", qty: 1 }, { product: "p6", qty: 1 }], consultant: "David", created: "2025-01-15", note: "Ladíme bulk cenu a harmonogram montáží" },
  { id: "d5", title: "MUDr. Kvapil — ordinace", company: "MUDr. Kvapil s.r.o.", segment: "Stomatologie", stage: "contract_signed", items: [{ product: "p1", qty: 1 }, { product: "p3", qty: 1 }, { product: "p4", qty: 1 }], consultant: "David", created: "2025-01-28", note: "Smlouva podepsána" },
  { id: "d6", title: "DS Rokycany — pokoje + jídelna", company: "DS Rokycany", segment: "Domovy seniorů", stage: "installation", items: [{ product: "p1", qty: 15 }, { product: "p4", qty: 15 }, { product: "p2", qty: 1 }], consultant: "David", created: "2025-01-02", note: "8/15 modulů hotovo" },
  { id: "d7", title: "Ambiente — restaurace", company: "Ambiente s.r.o.", segment: "Restaurace a kavárny", stage: "closed_won", items: [{ product: "p2", qty: 1 }, { product: "p5", qty: 1 }], consultant: "David", created: "2024-12-10", note: "Klient spokojený" },
  { id: "d8", title: "ČEZ Plzeň — open space", company: "ČEZ a.s.", segment: "Kanceláře a IT centra", stage: "closed_lost", items: [{ product: "p1", qty: 6 }, { product: "p4", qty: 6 }], consultant: "David", created: "2025-01-20", note: "Vybrali konkurenci — cena" },
  { id: "d9", title: "Škoda — výrobní hala B", company: "Škoda Components", segment: "Výrobní podniky", stage: "lead", items: [{ product: "p2", qty: 8 }], consultant: "David", created: "2025-02-22", note: "BOZP oddělení projevilo zájem" },
  { id: "d10", title: "ZŠ Bory — třídy + sborovna", company: "ZŠ Bory Plzeň", segment: "Základní školy", stage: "handover", items: [{ product: "p1", qty: 14 }, { product: "p4", qty: 14 }, { product: "p3", qty: 1 }], consultant: "David", created: "2024-12-20", note: "Předání a zaškolení tento týden" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmt = (n) => new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 }).format(n);
const getProduct = (id) => PRODUCTS.find(p => p.id === id);
const calcDealValue = (items) => items.reduce((s, i) => { const p = getProduct(i.product); return s + (p ? p.price * i.qty : 0); }, 0);
const uid = () => "id_" + Math.random().toString(36).slice(2, 10);

const statusMap = {
  not_contacted: { label: "Neosloven", bg: "#f1f5f9", fg: "#64748b" },
  contacted: { label: "Osloven", bg: "#eff6ff", fg: "#2563eb" },
  meeting_scheduled: { label: "Schůzka", bg: "#fef3c7", fg: "#d97706" },
  refused: { label: "Odmítl", bg: "#fef2f2", fg: "#dc2626" },
  qualified: { label: "Kvalifikován", bg: "#ecfdf5", fg: "#059669" },
};

// ─── STYLES ─────────────────────────────────────────────────────────────────

const S = {
  page: { minHeight: "100vh", background: "#fafbfc", fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#1e293b", fontSize: 13 },
  sidebar: { width: 220, background: "#fff", borderRight: "1px solid #e8ecf1", position: "fixed", top: 0, left: 0, bottom: 0, display: "flex", flexDirection: "column", zIndex: 100 },
  main: { marginLeft: 220, minHeight: "100vh" },
  topbar: { height: 56, borderBottom: "1px solid #e8ecf1", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", background: "#fff" },
  content: { padding: "24px 28px" },
  card: { background: "#fff", borderRadius: 10, border: "1px solid #e8ecf1", overflow: "hidden" },
  input: { width: "100%", padding: "8px 12px", borderRadius: 7, border: "1px solid #dde2e8", fontSize: 13, color: "#1e293b", outline: "none", fontFamily: "inherit", background: "#fff", transition: "border 0.15s" },
  select: { width: "100%", padding: "8px 12px", borderRadius: 7, border: "1px solid #dde2e8", fontSize: 13, color: "#1e293b", outline: "none", fontFamily: "inherit", background: "#fff", cursor: "pointer" },
  btnPrimary: { padding: "8px 20px", borderRadius: 8, border: "none", background: "#1e293b", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "background 0.15s" },
  btnSecondary: { padding: "7px 16px", borderRadius: 8, border: "1px solid #dde2e8", background: "#fff", color: "#475569", fontSize: 12, cursor: "pointer", transition: "all 0.15s" },
  badge: (bg, fg) => ({ display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: bg, color: fg }),
  th: { padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "#64748b", textAlign: "left", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #e8ecf1", background: "#f8f9fb" },
  td: { padding: "12px 14px", borderBottom: "1px solid #f1f4f8", fontSize: 13 },
  label: { fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4, display: "block" },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: "#0f172a", letterSpacing: -0.3 },
};

// ─── MODAL ──────────────────────────────────────────────────────────────────

const Modal = ({ onClose, title, width, children }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.3)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: 50, zIndex: 1000 }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, width: width || 520, maxHeight: "85vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #e8ecf1" }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{title}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 18, cursor: "pointer", padding: 4, lineHeight: 1 }}>✕</button>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  </div>
);

const FormRow = ({ children, cols }) => (
  <div style={{ display: "grid", gridTemplateColumns: cols || "1fr 1fr", gap: 14, marginBottom: 14 }}>{children}</div>
);

const Field = ({ label, children }) => (
  <div><label style={S.label}>{label}</label>{children}</div>
);

// ─── NAV ITEM ───────────────────────────────────────────────────────────────

const NavItem = ({ icon, label, active, count, onClick }) => (
  <button onClick={onClick} style={{
    display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 18px",
    background: active ? "#f1f5f9" : "transparent", border: "none", borderRadius: 8,
    cursor: "pointer", fontSize: 13, color: active ? "#0f172a" : "#64748b",
    fontWeight: active ? 600 : 400, fontFamily: "inherit", transition: "all 0.15s", textAlign: "left",
    margin: "1px 0",
  }}>
    <span style={{ fontSize: 16, width: 22, textAlign: "center" }}>{icon}</span>
    <span style={{ flex: 1 }}>{label}</span>
    {count != null && <span style={{ fontSize: 10, background: active ? "#1e293b" : "#e2e8f0", color: active ? "#fff" : "#64748b", padding: "1px 7px", borderRadius: 10, fontWeight: 600 }}>{count}</span>}
  </button>
);

// ─── PIPELINE ───────────────────────────────────────────────────────────────

const PipelineCard = ({ deal, onClick, value }) => {
  const stage = STAGES.find(s => s.key === deal.stage);
  const totalItems = deal.items.reduce((s, i) => s + i.qty, 0);
  return (
    <div
      draggable
      onDragStart={e => e.dataTransfer.setData("dealId", deal.id)}
      onClick={() => onClick(deal)}
      style={{
        background: "#fff", borderRadius: 8, padding: "14px 16px", marginBottom: 6,
        cursor: "grab", transition: "box-shadow 0.15s, transform 0.15s",
        border: "1px solid #e8ecf1",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 4, lineHeight: 1.35 }}>{deal.title}</div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>{deal.company}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>{fmt(value)}</span>
        <span style={{ fontSize: 10, color: "#94a3b8" }}>{totalItems} ks</span>
      </div>
      {deal.items.length > 0 && (
        <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
          {deal.items.slice(0, 4).map((item, i) => {
            const p = getProduct(item.product);
            return p ? (
              <span key={i} style={{ fontSize: 10, color: "#64748b", background: "#f1f5f9", padding: "2px 7px", borderRadius: 4 }}>
                {p.name} ×{item.qty}
              </span>
            ) : null;
          })}
          {deal.items.length > 4 && <span style={{ fontSize: 10, color: "#94a3b8" }}>+{deal.items.length - 4}</span>}
        </div>
      )}
    </div>
  );
};

const PipelineColumn = ({ stage, deals, onClick, onDrop, dragOver, setDragOver }) => {
  const stageDeals = deals.filter(d => d.stage === stage.key);
  const total = stageDeals.reduce((s, d) => s + calcDealValue(d.items), 0);
  const isOver = dragOver === stage.key;
  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(stage.key); }}
      onDragLeave={() => setDragOver(null)}
      onDrop={e => { e.preventDefault(); setDragOver(null); onDrop(e.dataTransfer.getData("dealId"), stage.key); }}
      style={{
        minWidth: 250, maxWidth: 250, flexShrink: 0,
        background: isOver ? "#f0f4ff" : "#f4f6f9", borderRadius: 10, padding: 10,
        display: "flex", flexDirection: "column", transition: "background 0.2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, padding: "4px 6px" }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: stage.color }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>{stage.label}</span>
        <span style={{ fontSize: 10, color: "#94a3b8", marginLeft: "auto" }}>{stageDeals.length}</span>
      </div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10, padding: "0 6px", fontVariantNumeric: "tabular-nums" }}>{fmt(total)}</div>
      <div style={{ flex: 1, overflowY: "auto", minHeight: 60 }}>
        {stageDeals.map(deal => (
          <PipelineCard key={deal.id} deal={deal} onClick={onClick} value={calcDealValue(deal.items)} />
        ))}
      </div>
    </div>
  );
};

const PipelineView = ({ deals, setDeals, onOpenDeal, showClosed, setShowClosed, onNewDeal }) => {
  const [dragOver, setDragOver] = useState(null);
  const activeStages = showClosed ? STAGES : STAGES.filter(s => !["closed_won", "closed_lost"].includes(s.key));
  const handleDrop = (dealId, newStage) => setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage } : d));
  const active = deals.filter(d => !["closed_won", "closed_lost"].includes(d.stage));
  const won = deals.filter(d => d.stage === "closed_won");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={S.sectionTitle}>Pipeline</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
            {active.length} aktivních dealů · {fmt(active.reduce((s, d) => s + calcDealValue(d.items), 0))} v pipeline
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowClosed(!showClosed)} style={S.btnSecondary}>
            {showClosed ? "Skrýt uzavřené" : "Zobrazit uzavřené"}
          </button>
          <button onClick={onNewDeal} style={S.btnPrimary}>+ Nový deal</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
        {[
          { label: "Pipeline", value: fmt(active.reduce((s, d) => s + calcDealValue(d.items), 0)), sub: `${active.length} dealů` },
          { label: "Uzavřeno", value: fmt(won.reduce((s, d) => s + calcDealValue(d.items), 0)), sub: `${won.length} dealů` },
          { label: "Prům. deal", value: fmt(active.length > 0 ? Math.round(active.reduce((s, d) => s + calcDealValue(d.items), 0) / active.length) : 0), sub: "aktivní" },
          { label: "Konverze", value: `${deals.length > 0 ? Math.round((won.length / deals.length) * 100) : 0}%`, sub: `z ${deals.length} celkem` },
        ].map((stat, i) => (
          <div key={i} style={{ ...S.card, padding: "16px 20px", flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: "#b0b8c4", marginTop: 2 }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 20 }}>
        {activeStages.map(stage => (
          <PipelineColumn key={stage.key} stage={stage} deals={deals} onClick={onOpenDeal} onDrop={handleDrop} dragOver={dragOver} setDragOver={setDragOver} />
        ))}
      </div>
    </div>
  );
};

// ─── DEAL DETAIL / FORM ─────────────────────────────────────────────────────

const DealForm = ({ deal, onSave, onClose, isNew }) => {
  const [form, setForm] = useState(deal || { title: "", company: "", segment: SEGMENTS[0], stage: "lead", items: [{ product: "p1", qty: 1 }], consultant: "David", note: "", created: new Date().toISOString().slice(0, 10) });
  const set = (k, v) => setForm({ ...form, [k]: v });
  const addItem = () => set("items", [...form.items, { product: "p1", qty: 1 }]);
  const removeItem = (i) => set("items", form.items.filter((_, idx) => idx !== i));
  const updateItem = (i, f, v) => { const items = [...form.items]; items[i] = { ...items[i], [f]: v }; set("items", items); };
  const total = calcDealValue(form.items);

  return (
    <Modal onClose={onClose} title={isNew ? "Nový deal" : "Detail dealu"} width={580}>
      <FormRow><Field label="Název dealu"><input style={S.input} value={form.title} onChange={e => set("title", e.target.value)} placeholder="ZŠ Plzeň — 10x Clean Up" /></Field>
        <Field label="Firma"><input style={S.input} value={form.company} onChange={e => set("company", e.target.value)} placeholder="Název firmy" /></Field></FormRow>
      <FormRow><Field label="Segment"><select style={S.select} value={form.segment} onChange={e => set("segment", e.target.value)}>{SEGMENTS.map(s => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Stage"><select style={S.select} value={form.stage} onChange={e => set("stage", e.target.value)}>{STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}</select></Field></FormRow>
      <Field label="Poznámka"><textarea style={{ ...S.input, minHeight: 50, resize: "vertical" }} value={form.note} onChange={e => set("note", e.target.value)} placeholder="Kontext, další kroky..." /></Field>
      
      <div style={{ marginTop: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={S.label}>Položky nabídky</span>
          <button onClick={addItem} style={{ ...S.btnSecondary, fontSize: 11, padding: "4px 12px" }}>+ Přidat</button>
        </div>
        {form.items.map((item, i) => {
          const p = getProduct(item.product);
          return (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}>
              <select value={item.product} onChange={e => updateItem(i, "product", e.target.value)} style={{ ...S.select, flex: 3 }}>
                {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name} — {fmt(p.price)}</option>)}
              </select>
              <input type="number" min="1" value={item.qty} onChange={e => updateItem(i, "qty", parseInt(e.target.value) || 1)} style={{ ...S.input, flex: 0, width: 64, textAlign: "center" }} />
              <span style={{ fontSize: 12, color: "#64748b", width: 90, textAlign: "right", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{p ? fmt(p.price * item.qty) : ""}</span>
              {form.items.length > 1 && <button onClick={() => removeItem(i)} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 14, padding: 4 }}>✕</button>}
            </div>
          );
        })}
        <div style={{ textAlign: "right", marginTop: 12, fontSize: 20, fontWeight: 800, color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>{fmt(total)}</div>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: "1px solid #e8ecf1" }}>
        <button onClick={onClose} style={S.btnSecondary}>Zrušit</button>
        <button onClick={() => { if (form.title && form.company) onSave({ ...form, id: form.id || uid() }); }} style={S.btnPrimary}>{isNew ? "Vytvořit" : "Uložit"}</button>
      </div>
    </Modal>
  );
};

// ─── PROSPECTS ───────────────────────────────────────────────────────────────

const ProspectForm = ({ prospect, onSave, onClose, isNew }) => {
  const [form, setForm] = useState(prospect || { company: "", ico: "", segment: SEGMENTS[0], region: REGIONS[0], city: "", contact: "", email: "", phone: "", status: "not_contacted", priority: 3, employees: null, source: "", notes: "" });
  const set = (k, v) => setForm({ ...form, [k]: v });
  return (
    <Modal onClose={onClose} title={isNew ? "Nový prospekt" : "Upravit prospekt"} width={540}>
      <FormRow><Field label="Firma"><input style={S.input} value={form.company} onChange={e => set("company", e.target.value)} /></Field>
        <Field label="IČO"><input style={S.input} value={form.ico} onChange={e => set("ico", e.target.value)} /></Field></FormRow>
      <FormRow><Field label="Segment"><select style={S.select} value={form.segment} onChange={e => set("segment", e.target.value)}>{SEGMENTS.map(s => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Region"><select style={S.select} value={form.region} onChange={e => set("region", e.target.value)}>{REGIONS.map(r => <option key={r}>{r}</option>)}</select></Field></FormRow>
      <FormRow><Field label="Město"><input style={S.input} value={form.city} onChange={e => set("city", e.target.value)} /></Field>
        <Field label="Zdroj"><input style={S.input} value={form.source} onChange={e => set("source", e.target.value)} placeholder="LinkedIn, ARES, Referral..." /></Field></FormRow>
      <FormRow><Field label="Kontaktní osoba"><input style={S.input} value={form.contact} onChange={e => set("contact", e.target.value)} /></Field>
        <Field label="Priorita"><select style={S.select} value={form.priority} onChange={e => set("priority", parseInt(e.target.value))}>{[1,2,3,4,5].map(p => <option key={p} value={p}>{p} {p===1?"(Nejvyšší)":p===5?"(Nejnižší)":""}</option>)}</select></Field></FormRow>
      <FormRow><Field label="Email"><input style={S.input} value={form.email} onChange={e => set("email", e.target.value)} /></Field>
        <Field label="Telefon"><input style={S.input} value={form.phone} onChange={e => set("phone", e.target.value)} /></Field></FormRow>
      <FormRow cols="1fr"><Field label="Poznámky"><textarea style={{ ...S.input, minHeight: 50, resize: "vertical" }} value={form.notes} onChange={e => set("notes", e.target.value)} /></Field></FormRow>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
        <button onClick={onClose} style={S.btnSecondary}>Zrušit</button>
        <button onClick={() => { if (form.company) onSave({ ...form, id: form.id || uid() }); }} style={S.btnPrimary}>{isNew ? "Vytvořit" : "Uložit"}</button>
      </div>
    </Modal>
  );
};

const ProspectsView = ({ prospects, setProspects }) => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRegion, setFilterRegion] = useState("all");
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const filtered = prospects.filter(p => {
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    if (filterRegion !== "all" && p.region !== filterRegion) return false;
    if (search && !`${p.company} ${p.contact} ${p.segment}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => a.priority - b.priority);

  const handleSave = (p) => {
    if (editing) setProspects(prev => prev.map(x => x.id === p.id ? p : x));
    else setProspects(prev => [...prev, p]);
    setEditing(null); setShowNew(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><div style={S.sectionTitle}>Prospekty</div><div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{prospects.length} firem v databázi</div></div>
        <button onClick={() => setShowNew(true)} style={S.btnPrimary}>+ Nový prospekt</button>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input style={{ ...S.input, maxWidth: 260 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Hledat firmu, kontakt, segment..." />
        <select style={{ ...S.select, width: "auto" }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Všechny stavy</option>
          {Object.entries(statusMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select style={{ ...S.select, width: "auto" }} value={filterRegion} onChange={e => setFilterRegion(e.target.value)}>
          <option value="all">Všechny regiony</option>
          {REGIONS.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      <div style={S.card}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>
            {["P", "Firma", "Segment", "Region", "Kontakt", "Stav", "Zdroj", ""].map(h => <th key={h} style={S.th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map(p => {
              const st = statusMap[p.status];
              return (
                <tr key={p.id} style={{ cursor: "pointer", transition: "background 0.1s" }} onMouseEnter={e => e.currentTarget.style.background="#f8f9fb"} onMouseLeave={e => e.currentTarget.style.background="transparent"} onClick={() => setEditing(p)}>
                  <td style={{ ...S.td, width: 36, textAlign: "center" }}><span style={{ display: "inline-block", width: 20, height: 20, borderRadius: "50%", background: p.priority <= 2 ? "#fef3c7" : "#f1f5f9", color: p.priority <= 2 ? "#d97706" : "#94a3b8", fontSize: 11, fontWeight: 700, lineHeight: "20px", textAlign: "center" }}>{p.priority}</span></td>
                  <td style={S.td}><div style={{ fontWeight: 600, color: "#0f172a" }}>{p.company}</div>{p.ico && <div style={{ fontSize: 11, color: "#94a3b8" }}>IČ {p.ico}</div>}</td>
                  <td style={{ ...S.td, fontSize: 12, color: "#64748b" }}>{p.segment}</td>
                  <td style={{ ...S.td, fontSize: 12, color: "#64748b" }}>{p.city || p.region}</td>
                  <td style={S.td}><div style={{ fontSize: 12 }}>{p.contact}</div><div style={{ fontSize: 11, color: "#94a3b8" }}>{p.email}</div></td>
                  <td style={S.td}><span style={S.badge(st.bg, st.fg)}>{st.label}</span></td>
                  <td style={{ ...S.td, fontSize: 12, color: "#94a3b8" }}>{p.source}</td>
                  <td style={{ ...S.td, width: 40 }}><button onClick={e => { e.stopPropagation(); setEditing(p); }} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 14 }}>✎</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Žádné výsledky</div>}
      </div>

      {editing && <ProspectForm prospect={editing} onSave={handleSave} onClose={() => setEditing(null)} />}
      {showNew && <ProspectForm onSave={handleSave} onClose={() => setShowNew(false)} isNew />}
    </div>
  );
};

// ─── CLIENTS ─────────────────────────────────────────────────────────────────

const ClientForm = ({ client, onSave, onClose, isNew }) => {
  const [form, setForm] = useState(client || { company: "", ico: "", segment: SEGMENTS[0], region: REGIONS[0], city: "", contact: "", email: "", phone: "", paymentDays: 14, notes: "" });
  const set = (k, v) => setForm({ ...form, [k]: v });
  return (
    <Modal onClose={onClose} title={isNew ? "Nový klient" : "Upravit klienta"}>
      <FormRow><Field label="Firma"><input style={S.input} value={form.company} onChange={e => set("company", e.target.value)} /></Field>
        <Field label="IČO"><input style={S.input} value={form.ico} onChange={e => set("ico", e.target.value)} /></Field></FormRow>
      <FormRow><Field label="Segment"><select style={S.select} value={form.segment} onChange={e => set("segment", e.target.value)}>{SEGMENTS.map(s => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Region"><select style={S.select} value={form.region} onChange={e => set("region", e.target.value)}>{REGIONS.map(r => <option key={r}>{r}</option>)}</select></Field></FormRow>
      <FormRow><Field label="Kontaktní osoba"><input style={S.input} value={form.contact} onChange={e => set("contact", e.target.value)} /></Field>
        <Field label="Město"><input style={S.input} value={form.city} onChange={e => set("city", e.target.value)} /></Field></FormRow>
      <FormRow><Field label="Email"><input style={S.input} value={form.email} onChange={e => set("email", e.target.value)} /></Field>
        <Field label="Telefon"><input style={S.input} value={form.phone} onChange={e => set("phone", e.target.value)} /></Field></FormRow>
      <FormRow><Field label="Splatnost (dní)"><input type="number" style={S.input} value={form.paymentDays} onChange={e => set("paymentDays", parseInt(e.target.value) || 14)} /></Field></FormRow>
      <FormRow cols="1fr"><Field label="Poznámky"><textarea style={{ ...S.input, minHeight: 50, resize: "vertical" }} value={form.notes} onChange={e => set("notes", e.target.value)} /></Field></FormRow>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
        <button onClick={onClose} style={S.btnSecondary}>Zrušit</button>
        <button onClick={() => { if (form.company) onSave({ ...form, id: form.id || uid(), totalRevenue: form.totalRevenue || 0, dealsCount: form.dealsCount || 0 }); }} style={S.btnPrimary}>{isNew ? "Vytvořit" : "Uložit"}</button>
      </div>
    </Modal>
  );
};

const ClientsView = ({ clients, setClients }) => {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const filtered = clients.filter(c => !search || `${c.company} ${c.contact} ${c.segment}`.toLowerCase().includes(search.toLowerCase()));
  const totalRev = clients.reduce((s, c) => s + (c.totalRevenue || 0), 0);

  const handleSave = (c) => {
    if (editing) setClients(prev => prev.map(x => x.id === c.id ? c : x));
    else setClients(prev => [...prev, c]);
    setEditing(null); setShowNew(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><div style={S.sectionTitle}>Klienti</div><div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{clients.length} klientů · Celkový obrat {fmt(totalRev)}</div></div>
        <button onClick={() => setShowNew(true)} style={S.btnPrimary}>+ Nový klient</button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input style={{ ...S.input, maxWidth: 300 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Hledat klienta..." />
      </div>

      <div style={S.card}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>
            {["Firma", "Segment", "Region", "Kontakt", "Obrat", "Dealů", ""].map(h => <th key={h} style={S.th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} style={{ cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background="#f8f9fb"} onMouseLeave={e => e.currentTarget.style.background="transparent"} onClick={() => setEditing(c)}>
                <td style={S.td}><div style={{ fontWeight: 600, color: "#0f172a" }}>{c.company}</div>{c.ico && <div style={{ fontSize: 11, color: "#94a3b8" }}>IČ {c.ico}</div>}</td>
                <td style={{ ...S.td, fontSize: 12, color: "#64748b" }}>{c.segment}</td>
                <td style={{ ...S.td, fontSize: 12, color: "#64748b" }}>{c.city || c.region}</td>
                <td style={S.td}><div style={{ fontSize: 12 }}>{c.contact}</div><div style={{ fontSize: 11, color: "#94a3b8" }}>{c.email}</div></td>
                <td style={{ ...S.td, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmt(c.totalRevenue || 0)}</td>
                <td style={{ ...S.td, textAlign: "center" }}>{c.dealsCount || 0}</td>
                <td style={{ ...S.td, width: 40 }}><button onClick={e => { e.stopPropagation(); setEditing(c); }} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 14 }}>✎</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Žádní klienti</div>}
      </div>

      {editing && <ClientForm client={editing} onSave={handleSave} onClose={() => setEditing(null)} />}
      {showNew && <ClientForm onSave={handleSave} onClose={() => setShowNew(false)} isNew />}
    </div>
  );
};

// ─── PRODUCT CATALOG + CALCULATOR ───────────────────────────────────────────

const CalculatorView = () => {
  const [calcItems, setCalcItems] = useState([{ product: "p1", qty: 1 }]);
  const addItem = () => setCalcItems([...calcItems, { product: "p1", qty: 1 }]);
  const removeItem = (i) => setCalcItems(calcItems.filter((_, idx) => idx !== i));
  const updateItem = (i, f, v) => { const items = [...calcItems]; items[i] = { ...items[i], [f]: v }; setCalcItems(items); };
  
  const totalPrice = calcItems.reduce((s, i) => { const p = getProduct(i.product); return s + (p ? p.price * i.qty : 0); }, 0);
  const totalOzone = calcItems.reduce((s, i) => { const p = getProduct(i.product); return s + (p && p.ozone ? p.ozone * i.qty : 0); }, 0);
  const totalDevices = calcItems.reduce((s, i) => { const p = getProduct(i.product); return s + (p && p.category !== "sluzba" ? i.qty : 0); }, 0);

  return (
    <div>
      <div style={{ marginBottom: 24 }}><div style={S.sectionTitle}>Produkty a kalkulačka</div><div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Katalog řešení Vitalspace + rychlá kalkulace nabídky</div></div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 32 }}>
        {PRODUCTS.filter(p => p.category !== "sluzba").map(p => (
          <div key={p.id} style={{ ...S.card, padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{p.name}</div>
                <span style={S.badge(catDot[p.category] + "18", catDot[p.category])}>{catLabel[p.category]}</span>
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{p.sku}</div>
            </div>
            <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, marginBottom: 14 }}>{p.desc}</div>
            <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#64748b", borderTop: "1px solid #f1f4f8", paddingTop: 12 }}>
              {p.ozone > 0 && <div><span style={{ fontWeight: 700, color: "#0f172a" }}>{p.ozone}</span> g/h</div>}
              {p.coverage && <div><span style={{ fontWeight: 700, color: "#0f172a" }}>{p.coverage}</span> m³ max</div>}
              <div style={{ marginLeft: "auto", fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{fmt(p.price)}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
        {PRODUCTS.filter(p => p.category === "sluzba").map(p => (
          <div key={p.id} style={{ ...S.card, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{p.name}</div><div style={{ fontSize: 11, color: "#94a3b8" }}>{p.desc}</div></div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", flexShrink: 0, marginLeft: 16 }}>{fmt(p.price)}</div>
          </div>
        ))}
      </div>

      <div style={{ ...S.card, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Kalkulačka nabídky</div>
          <button onClick={addItem} style={S.btnSecondary}>+ Přidat položku</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "3fr 80px 110px 32px", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>Produkt</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", textAlign: "center" }}>Ks</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", textAlign: "right" }}>Celkem</span>
          <span />
        </div>
        {calcItems.map((item, i) => {
          const p = getProduct(item.product);
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "3fr 80px 110px 32px", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <select value={item.product} onChange={e => updateItem(i, "product", e.target.value)} style={S.select}>
                {PRODUCTS.map(p => <option key={p.id} value={p.id}>{catLabel[p.category]}: {p.name} — {fmt(p.price)}</option>)}
              </select>
              <input type="number" min="1" value={item.qty} onChange={e => updateItem(i, "qty", parseInt(e.target.value) || 1)} style={{ ...S.input, textAlign: "center" }} />
              <div style={{ textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums", fontSize: 13 }}>{p ? fmt(p.price * item.qty) : "—"}</div>
              {calcItems.length > 1 ? <button onClick={() => removeItem(i)} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 14, padding: 0 }}>✕</button> : <span />}
            </div>
          );
        })}

        <div style={{ borderTop: "1px solid #e8ecf1", marginTop: 16, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 24 }}>
            <div><div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", fontWeight: 600 }}>Zařízení</div><div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{totalDevices} ks</div></div>
            <div><div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", fontWeight: 600 }}>Výkon O₃</div><div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{totalOzone} g/h</div></div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", fontWeight: 600 }}>Celková cena</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", fontVariantNumeric: "tabular-nums", letterSpacing: -1 }}>{fmt(totalPrice)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function VitalspaceCRM() {
  const [page, setPage] = useState("pipeline");
  const [deals, setDeals] = useState(initialDeals);
  const [prospects, setProspects] = useState(initialProspects);
  const [clients, setClients] = useState(initialClients);
  const [showClosed, setShowClosed] = useState(false);
  const [dealModal, setDealModal] = useState(null); // { deal, isNew }

  const openNewDeal = () => setDealModal({ deal: null, isNew: true });
  const openDeal = (deal) => setDealModal({ deal, isNew: false });
  const handleSaveDeal = (deal) => {
    if (dealModal.isNew) setDeals(prev => [...prev, deal]);
    else setDeals(prev => prev.map(d => d.id === deal.id ? deal : d));
    setDealModal(null);
  };

  const activeDeals = deals.filter(d => !["closed_won", "closed_lost"].includes(d.stage));

  return (
    <div style={S.page}>
      {/* ── SIDEBAR ── */}
      <div style={S.sidebar}>
        <div style={{ padding: "20px 18px 24px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #f0f2f5" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 800 }}>V</div>
          <div><div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", letterSpacing: -0.3 }}>Vitalspace</div><div style={{ fontSize: 10, color: "#94a3b8" }}>CRM</div></div>
        </div>
        <div style={{ padding: "12px 10px", flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#b0b8c4", textTransform: "uppercase", letterSpacing: 1, padding: "8px 18px 6px" }}>Obchod</div>
          <NavItem icon="◉" label="Pipeline" active={page === "pipeline"} count={activeDeals.length} onClick={() => setPage("pipeline")} />
          <NavItem icon="◎" label="Prospekty" active={page === "prospects"} count={prospects.length} onClick={() => setPage("prospects")} />
          <NavItem icon="●" label="Klienti" active={page === "clients"} count={clients.length} onClick={() => setPage("clients")} />
          <div style={{ fontSize: 10, fontWeight: 600, color: "#b0b8c4", textTransform: "uppercase", letterSpacing: 1, padding: "20px 18px 6px" }}>Nástroje</div>
          <NavItem icon="▦" label="Produkty" active={page === "products"} onClick={() => setPage("products")} />
        </div>
        <div style={{ padding: "14px 18px", borderTop: "1px solid #f0f2f5", fontSize: 11, color: "#94a3b8" }}>
          v0.1 · mock data
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={S.main}>
        <div style={S.topbar}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#64748b" }}>
            {page === "pipeline" && "Obchod / Pipeline"}
            {page === "prospects" && "Obchod / Prospekty"}
            {page === "clients" && "Obchod / Klienti"}
            {page === "products" && "Nástroje / Produkty a kalkulačka"}
          </div>
          <div style={{ fontSize: 11, color: "#b0b8c4" }}>{new Date().toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
        </div>
        <div style={S.content}>
          {page === "pipeline" && <PipelineView deals={deals} setDeals={setDeals} onOpenDeal={openDeal} showClosed={showClosed} setShowClosed={setShowClosed} onNewDeal={openNewDeal} />}
          {page === "prospects" && <ProspectsView prospects={prospects} setProspects={setProspects} />}
          {page === "clients" && <ClientsView clients={clients} setClients={setClients} />}
          {page === "products" && <CalculatorView />}
        </div>
      </div>

      {/* ── DEAL MODAL ── */}
      {dealModal && <DealForm deal={dealModal.deal} onSave={handleSaveDeal} onClose={() => setDealModal(null)} isNew={dealModal.isNew} />}
    </div>
  );
}
