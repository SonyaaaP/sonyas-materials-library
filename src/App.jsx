import { useState, useEffect, useRef } from "react";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://dpuqpovjhnmmglzvnbsc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwdXFwb3ZqaG5tbWdsenZuYnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMzkzODYsImV4cCI6MjA5NjcxNTM4Nn0.38HQp4oUnVI4S64aMNfnSV8VfRuKkwjFJD2DMY0cZ64";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const RSI = 5.678;

const DEFAULT_TYPES = [
{ name: "Rigid Insulation", color: "#2D6A4F" },
{ name: "Spray Foam", color: "#1B4965" },
{ name: "Batt / Blown-in", color: "#6B3A2A" },
{ name: "Roofing", color: "#4A4E69" },
{ name: "Air Barrier", color: "#7B5E2A" },
];

function Toast({ msg, onDone }) {
useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, []);
return (
<div style={{
position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
background: "#1A1A1A", color: "#FFF", padding: "10px 22px", borderRadius: 24,
fontSize: 13, fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
}}>{msg}</div>
);
}

function Badge({ color, label }) {
return (
<span style={{
display: "inline-block", padding: "2px 10px", borderRadius: 12,
background: color + "22", color, border: `1px solid ${color}55`,
fontSize: 11, fontWeight: 700, letterSpacing: "0.04em"
}}>{label}</span>
);
}

function MaterialCard({ mat, types, unit, onEdit, onSelect, selected }) {
const type = types.find(t => t.id === mat.type_id);
const color = type?.color || "#888";

const rVal = unit === "R"
? mat.r_value_per_inch
: mat.r_value_per_inch ? (mat.r_value_per_inch / RSI).toFixed(3) : null;
const rLabel = unit === "R" ? "R/in" : "RSI/cm";

return (
<div
onClick={() => onSelect(mat)}
style={{
background: "var(--card)", borderRadius: 12, padding: "16px 18px",
borderLeft: `4px solid ${color}`,
boxShadow: selected ? `0 0 0 2px ${color}` : "0 1px 4px rgba(0,0,0,0.07)",
cursor: "pointer", transition: "box-shadow 0.15s",
position: "relative"
}}
>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
<div style={{ flex: 1 }}>
<div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{mat.name}</div>
{mat.brand && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{mat.brand}</div>}
{type && <div style={{ marginTop: 6 }}><Badge color={color} label={type.name} /></div>}
</div>
{mat.show_r_value && mat.r_value_per_inch && (
<div style={{ textAlign: "right", minWidth: 70 }}>
<div style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1 }}>{rVal}</div>
<div style={{ fontSize: 11, color: "var(--muted)" }}>{rLabel}</div>
</div>
)}
</div>
{mat.description && (
<div style={{ marginTop: 10, fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{mat.description}</div>
)}
{(mat.min_thickness || mat.max_thickness) && (
<div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
Thickness: {mat.min_thickness ?? "—"}″ – {mat.max_thickness ?? "—"}″
</div>
)}
<button
onClick={e => { e.stopPropagation(); onEdit(mat); }}
style={{
position: "absolute", top: 12, right: 12,
background: "transparent", border: "none", cursor: "pointer",
color: "var(--muted)", fontSize: 16, padding: 4
}}
title="Edit"
>✏️</button>
</div>
);
}

function MaterialForm({ initial, types, onSave, onCancel, onDelete }) {
const [form, setForm] = useState(initial || {
name: "", brand: "", type_id: "", description: "",
r_value_per_inch: "", min_thickness: "", max_thickness: "", show_r_value: true
});
const [newTypeName, setNewTypeName] = useState("");
const [newTypeColor, setNewTypeColor] = useState("#2D6A4F");
const [addingType, setAddingType] = useState(false);
const [file, setFile] = useState(null);
const [saving, setSaving] = useState(false);

const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

const handleSave = async () => {
if (!form.name.trim()) return;
setSaving(true);
await onSave(form, file);
setSaving(false);
};

const handleAddType = async () => {
if (!newTypeName.trim()) return;
await onSave({ __newType: true, name: newTypeName, color: newTypeColor });
setAddingType(false);
setNewTypeName("");
};

const inputStyle = {
width: "100%", padding: "8px 12px", borderRadius: 8,
border: "1px solid var(--border)", background: "var(--bg)",
color: "var(--text)", fontSize: 14, boxSizing: "border-box"
};
const labelStyle = { fontSize: 12, color: "var(--muted)", marginBottom: 4, display: "block" };

return (
<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
<div>
<label style={labelStyle}>Name *</label>
<input style={inputStyle} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Rockwool ComfortBoard 80" />
</div>
<div>
<label style={labelStyle}>Brand / Trade name</label>
<input style={inputStyle} value={form.brand} onChange={e => set("brand", e.target.value)} placeholder="e.g. Rockwool" />
</div>

<div>
<label style={labelStyle}>Material type</label>
<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
<select style={{ ...inputStyle, flex: 1 }} value={form.type_id} onChange={e => set("type_id", e.target.value)}>
<option value="">— select type —</option>
{types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
</select>
<button onClick={() => setAddingType(v => !v)} style={{
padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)",
background: "var(--card)", color: "var(--text)", cursor: "pointer", fontSize: 13, whiteSpace: "nowrap"
}}>+ New type</button>
</div>
{addingType && (
<div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
<input
style={{ ...inputStyle, flex: 1, minWidth: 140 }}
value={newTypeName} onChange={e => setNewTypeName(e.target.value)}
placeholder="Type name"
/>
<input type="color" value={newTypeColor} onChange={e => setNewTypeColor(e.target.value)}
style={{ width: 36, height: 36, border: "none", borderRadius: 6, cursor: "pointer", background: "none" }} />
<button onClick={handleAddType} style={{
padding: "8px 14px", borderRadius: 8, background: "#2D6A4F", color: "#FFF",
border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13
}}>Add</button>
</div>
)}
</div>

<div>
<label style={labelStyle}>Description</label>
<textarea style={{ ...inputStyle, minHeight: 72, resize: "vertical" }}
value={form.description} onChange={e => set("description", e.target.value)}
placeholder="Notes, use cases, code references..." />
</div>

<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
<input type="checkbox" id="showR" checked={form.show_r_value}
onChange={e => set("show_r_value", e.target.checked)} />
<label htmlFor="showR" style={{ fontSize: 13, color: "var(--text)", cursor: "pointer" }}>
Show R-value for this material
</label>
</div>

{form.show_r_value && (
<div style={{ display: "flex", gap: 12 }}>
<div style={{ flex: 1 }}>
<label style={labelStyle}>R-value per inch</label>
<input style={inputStyle} type="number" step="0.1"
value={form.r_value_per_inch} onChange={e => set("r_value_per_inch", e.target.value)}
placeholder="e.g. 4.2" />
</div>
<div style={{ flex: 1 }}>
<label style={labelStyle}>Min thickness (in)</label>
<input style={inputStyle} type="number" step="0.5"
value={form.min_thickness} onChange={e => set("min_thickness", e.target.value)}
placeholder="e.g. 1" />
</div>
<div style={{ flex: 1 }}>
<label style={labelStyle}>Max thickness (in)</label>
<input style={inputStyle} type="number" step="0.5"
value={form.max_thickness} onChange={e => set("max_thickness", e.target.value)}
placeholder="e.g. 6" />
</div>
</div>
)}

<div>
<label style={labelStyle}>Attach spec sheet (PDF)</label>
<input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])}
style={{ fontSize: 13, color: "var(--text)" }} />
</div>

<div style={{ display: "flex", gap: 8, marginTop: 4 }}>
<button onClick={handleSave} disabled={saving} style={{
flex: 1, padding: "10px", borderRadius: 8, background: "#2D6A4F",
color: "#FFF", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer"
}}>{saving ? "Saving..." : initial ? "Save changes" : "Add material"}</button>
<button onClick={onCancel} style={{
padding: "10px 16px", borderRadius: 8, background: "var(--card)",
color: "var(--text)", border: "1px solid var(--border)", cursor: "pointer", fontSize: 14
}}>Cancel</button>
{initial && (
<button onClick={() => onDelete(initial.id)} style={{
padding: "10px 16px", borderRadius: 8, background: "#FEE2E2",
color: "#991B1B", border: "none", cursor: "pointer", fontSize: 14
}}>Delete</button>
)}
</div>
</div>
);
}

function CompareTable({ materials, types, unit, onClose }) {
const rLabel = unit === "R" ? "R/in" : "RSI/cm";
const rFn = v => v ? (unit === "R" ? v : (v / RSI).toFixed(3)) : "—";

return (
<div style={{ overflowX: "auto" }}>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
<h3 style={{ margin: 0, color: "var(--text)" }}>Compare ({materials.length} materials)</h3>
<button onClick={onClose} style={{
background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8,
padding: "6px 14px", cursor: "pointer", color: "var(--text)", fontSize: 13
}}>✕ Close</button>
</div>
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
<thead>
<tr style={{ background: "var(--card)" }}>
{["Name", "Brand", "Type", rLabel, "Min–Max thickness", "Description"].map(h => (
<th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "var(--muted)", fontWeight: 600, borderBottom: "1px solid var(--border)" }}>{h}</th>
))}
</tr>
</thead>
<tbody>
{materials.map((m, i) => {
const type = types.find(t => t.id === m.type_id);
return (
<tr key={m.id} style={{ background: i % 2 === 0 ? "var(--bg)" : "var(--card)" }}>
<td style={{ padding: "10px 12px", fontWeight: 600, color: "var(--text)", borderBottom: "1px solid var(--border)" }}>{m.name}</td>
<td style={{ padding: "10px 12px", color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>{m.brand || "—"}</td>
<td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
{type ? <Badge color={type.color} label={type.name} /> : "—"}
</td>
<td style={{ padding: "10px 12px", fontWeight: 700, color: type?.color || "var(--text)", borderBottom: "1px solid var(--border)" }}>
{m.show_r_value ? rFn(m.r_value_per_inch) : "hidden"}
</td>
<td style={{ padding: "10px 12px", color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
{m.min_thickness || m.max_thickness ? `${m.min_thickness ?? "?"}″ – ${m.max_thickness ?? "?"}″` : "—"}
</td>
<td style={{ padding: "10px 12px", color: "var(--muted)", borderBottom: "1px solid var(--border)", maxWidth: 200 }}>{m.description || "—"}</td>
</tr>
);
})}
</tbody>
</table>
</div>
);
}

export default function App() {
const [dark, setDark] = useState(false);
const [unit, setUnit] = useState("R");
const [materials, setMaterials] = useState([]);
const [types, setTypes] = useState([]);
const [documents, setDocuments] = useState([]);
const [search, setSearch] = useState("");
const [filterType, setFilterType] = useState("all");
const [view, setView] = useState("list"); // list | add | edit | compare | detail
const [editing, setEditing] = useState(null);
const [selected, setSelected] = useState([]);
const [detail, setDetail] = useState(null);
const [toast, setToast] = useState(null);
const [loading, setLoading] = useState(true);

// Calculator
const [calcMat, setCalcMat] = useState("");
const [calcInch, setCalcInch] = useState("");

const showToast = msg => setToast(msg);

useEffect(() => {
loadAll();
}, []);

const loadAll = async () => {
setLoading(true);
const [{ data: mats }, { data: typs }, { data: docs }] = await Promise.all([
supabase.from("materials").select("*").order("created_at", { ascending: false }),
supabase.from("material_types").select("*").order("name"),
supabase.from("documents").select("*")
]);
setMaterials(mats || []);
setTypes(typs || []);
setDocuments(docs || []);
setLoading(false);
};

const handleSave = async (form, file) => {
if (form.__newType) {
const { data } = await supabase.from("material_types").insert({ name: form.name, color: form.color }).select().single();
if (data) setTypes(t => [...t, data]);
showToast("Type added");
return;
}

const payload = {
name: form.name.trim(),
brand: form.brand || null,
type_id: form.type_id || null,
description: form.description || null,
r_value_per_inch: form.r_value_per_inch ? parseFloat(form.r_value_per_inch) : null,
min_thickness: form.min_thickness ? parseFloat(form.min_thickness) : null,
max_thickness: form.max_thickness ? parseFloat(form.max_thickness) : null,
show_r_value: form.show_r_value
};

let matId = form.id;
if (form.id) {
await supabase.from("materials").update(payload).eq("id", form.id);
setMaterials(ms => ms.map(m => m.id === form.id ? { ...m, ...payload } : m));
showToast("Material updated");
} else {
const { data } = await supabase.from("materials").insert(payload).select().single();
if (data) { setMaterials(ms => [data, ...ms]); matId = data.id; }
showToast("Material added");
}

if (file && matId) {
const path = `${matId}/${file.name}`;
const { error } = await supabase.storage.from("documents").upload(path, file, { upsert: true });
if (!error) {
const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
const { data: doc } = await supabase.from("documents").insert({
material_id: matId, file_name: file.name, storage_path: path
}).select().single();
if (doc) setDocuments(ds => [...ds, { ...doc, url: urlData.publicUrl }]);
}
}

setView("list");
setEditing(null);
};

const handleDelete = async (id) => {
await supabase.from("materials").delete().eq("id", id);
setMaterials(ms => ms.filter(m => m.id !== id));
showToast("Material deleted");
setView("list");
setEditing(null);
};

const filtered = materials.filter(m => {
const q = search.toLowerCase();
const matchSearch = !q || m.name.toLowerCase().includes(q) || (m.brand || "").toLowerCase().includes(q) || (m.description || "").toLowerCase().includes(q);
const matchType = filterType === "all" || m.type_id === filterType;
return matchSearch && matchType;
});

const toggleSelect = (mat) => {
setSelected(s => s.find(x => x.id === mat.id) ? s.filter(x => x.id !== mat.id) : [...s, mat]);
};

const calcMaterial = materials.find(m => m.id === calcMat);
const calcResult = calcMaterial && calcInch
? unit === "R"
? (calcMaterial.r_value_per_inch * parseFloat(calcInch)).toFixed(1)
: ((calcMaterial.r_value_per_inch * parseFloat(calcInch)) / RSI).toFixed(2)
: null;

// CSS vars via style tag trick
const theme = dark ? {
"--bg": "#0F0F0F", "--card": "#1A1A1A", "--text": "#F0F0F0",
"--muted": "#888", "--border": "#2A2A2A"
} : {
"--bg": "#F7F6F3", "--card": "#FFFFFF", "--text": "#1A1A1A",
"--muted": "#666", "--border": "#E5E5E5"
};

const themeStyle = Object.entries(theme).map(([k, v]) => `${k}:${v}`).join(";");

return (
<div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "var(--bg)", minHeight: "100vh", color: "var(--text)", ...theme }}>
<style>{`* { box-sizing: border-box; } input, textarea, select { outline: none; } input:focus, textarea:focus, select:focus { border-color: #2D6A4F !important; }`}</style>

{/* Header */}
<div style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", padding: "14px 20px", position: "sticky", top: 0, zIndex: 100 }}>
<div style={{ maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
<div style={{ flex: 1, minWidth: 180 }}>
<div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "var(--muted)", textTransform: "uppercase" }}>Sonya's</div>
<div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", lineHeight: 1.1 }}>Materials Library</div>
</div>

{/* Search */}
<input
value={search} onChange={e => setSearch(e.target.value)}
placeholder="Search materials..."
style={{
flex: 2, minWidth: 160, padding: "8px 14px", borderRadius: 20,
border: "1px solid var(--border)", background: "var(--bg)",
color: "var(--text)", fontSize: 14
}}
/>

{/* Unit toggle */}
<div style={{ display: "flex", background: "var(--bg)", borderRadius: 20, padding: 3, border: "1px solid var(--border)" }}>
{["R", "RSI"].map(u => (
<button key={u} onClick={() => setUnit(u)} style={{
padding: "5px 12px", borderRadius: 16, border: "none", cursor: "pointer",
background: unit === u ? "#1A1A1A" : "transparent",
color: unit === u ? "#FFF" : "var(--muted)",
fontWeight: 700, fontSize: 12, transition: "all 0.15s"
}}>{u}</button>
))}
</div>

{/* Dark mode */}
<button onClick={() => setDark(d => !d)} style={{
background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 20,
padding: "6px 12px", cursor: "pointer", fontSize: 16
}}>{dark ? "☀️" : "🌙"}</button>

{/* Add */}
<button onClick={() => { setEditing(null); setView("add"); }} style={{
background: "#2D6A4F", color: "#FFF", border: "none", borderRadius: 20,
padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer"
}}>+ Add</button>
</div>
</div>

<div style={{ maxWidth: 800, margin: "0 auto", padding: "20px 16px" }}>

{/* Filter by type */}
{view === "list" && (
<div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
<button onClick={() => setFilterType("all")} style={{
padding: "5px 14px", borderRadius: 16, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
background: filterType === "all" ? "#1A1A1A" : "var(--card)",
color: filterType === "all" ? "#FFF" : "var(--muted)",
boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
}}>All</button>
{types.map(t => (
<button key={t.id} onClick={() => setFilterType(filterType === t.id ? "all" : t.id)} style={{
padding: "5px 14px", borderRadius: 16, border: `1px solid ${filterType === t.id ? t.color : "transparent"}`,
cursor: "pointer", fontSize: 12, fontWeight: 600,
background: filterType === t.id ? t.color + "22" : "var(--card)",
color: filterType === t.id ? t.color : "var(--muted)",
boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
}}>{t.name}</button>
))}
</div>
)}

{/* Compare bar */}
{selected.length > 0 && view === "list" && (
<div style={{
background: "#1B4965", color: "#FFF", borderRadius: 10, padding: "10px 16px",
marginBottom: 16, display: "flex", alignItems: "center", gap: 12
}}>
<span style={{ flex: 1, fontSize: 13 }}>{selected.length} selected for comparison</span>
<button onClick={() => setView("compare")} style={{
background: "#FFF", color: "#1B4965", border: "none", borderRadius: 8,
padding: "6px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer"
}}>Compare →</button>
<button onClick={() => setSelected([])} style={{
background: "transparent", color: "#BEE9E8", border: "none", cursor: "pointer", fontSize: 18
}}>✕</button>
</div>
)}

{/* ADD / EDIT form */}
{(view === "add" || view === "edit") && (
<div style={{ background: "var(--card)", borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
<h2 style={{ margin: "0 0 20px", color: "var(--text)", fontSize: 18 }}>
{view === "edit" ? "Edit material" : "Add material"}
</h2>
<MaterialForm
initial={editing}
types={types}
onSave={handleSave}
onCancel={() => { setView("list"); setEditing(null); }}
onDelete={handleDelete}
/>
</div>
)}

{/* COMPARE */}
{view === "compare" && (
<div style={{ background: "var(--card)", borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
<CompareTable
materials={selected}
types={types}
unit={unit}
onClose={() => setView("list")}
/>
</div>
)}

{/* DETAIL */}
{view === "detail" && detail && (() => {
const type = types.find(t => t.id === detail.type_id);
const color = type?.color || "#888";
const matDocs = documents.filter(d => d.material_id === detail.id);
return (
<div style={{ background: "var(--card)", borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
<button onClick={() => setView("list")} style={{
background: "none", border: "none", color: "var(--muted)", cursor: "pointer",
fontSize: 13, marginBottom: 16, padding: 0
}}>← Back</button>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
<div>
<h2 style={{ margin: "0 0 4px", color: "var(--text)" }}>{detail.name}</h2>
{detail.brand && <div style={{ color: "var(--muted)", fontSize: 14, marginBottom: 8 }}>{detail.brand}</div>}
{type && <Badge color={color} label={type.name} />}
</div>
<button onClick={() => { setEditing(detail); setView("edit"); }} style={{
background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8,
padding: "8px 14px", cursor: "pointer", color: "var(--text)", fontSize: 13
}}>Edit</button>
</div>
{detail.description && <p style={{ marginTop: 16, color: "var(--text)", lineHeight: 1.6 }}>{detail.description}</p>}
<div style={{ marginTop: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
{detail.show_r_value && detail.r_value_per_inch && (
<div style={{ background: color + "15", borderRadius: 10, padding: "12px 20px", textAlign: "center" }}>
<div style={{ fontSize: 28, fontWeight: 800, color }}>{unit === "R" ? detail.r_value_per_inch : (detail.r_value_per_inch / RSI).toFixed(3)}</div>
<div style={{ fontSize: 11, color: "var(--muted)" }}>{unit === "R" ? "R/inch" : "RSI/cm"}</div>
</div>
)}
{(detail.min_thickness || detail.max_thickness) && (
<div style={{ background: "var(--bg)", borderRadius: 10, padding: "12px 20px", textAlign: "center" }}>
<div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>{detail.min_thickness ?? "?"}″ – {detail.max_thickness ?? "?"}″</div>
<div style={{ fontSize: 11, color: "var(--muted)" }}>Thickness range</div>
</div>
)}
</div>
{matDocs.length > 0 && (
<div style={{ marginTop: 20 }}>
<div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginBottom: 8 }}>SPEC SHEETS</div>
{matDocs.map(doc => {
const { data } = supabase.storage.from("documents").getPublicUrl(doc.storage_path);
return (
<a key={doc.id} href={data.publicUrl} target="_blank" rel="noreferrer" style={{
display: "inline-flex", alignItems: "center", gap: 6,
padding: "8px 14px", background: "var(--bg)", borderRadius: 8,
color: "#2D6A4F", textDecoration: "none", fontSize: 13, fontWeight: 600,
border: "1px solid var(--border)"
}}>📄 {doc.file_name}</a>
);
})}
</div>
)}
</div>
);
})()}

{/* LIST */}
{view === "list" && (
<>
{loading ? (
<div style={{ textAlign: "center", color: "var(--muted)", padding: 40 }}>Loading...</div>
) : filtered.length === 0 ? (
<div style={{ textAlign: "center", color: "var(--muted)", padding: 60 }}>
<div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
<div style={{ fontWeight: 600 }}>{search ? "No results" : "No materials yet"}</div>
<div style={{ fontSize: 13, marginTop: 4 }}>
{search ? "Try a different search" : "Add your first material using the + Add button"}
</div>
</div>
) : (
<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
{filtered.map(mat => (
<div key={mat.id} style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
<input type="checkbox"
checked={!!selected.find(s => s.id === mat.id)}
onChange={() => toggleSelect(mat)}
style={{ marginTop: 18, cursor: "pointer", accentColor: "#2D6A4F" }}
/>
<div style={{ flex: 1 }}>
<MaterialCard
mat={mat} types={types} unit={unit}
selected={!!selected.find(s => s.id === mat.id)}
onEdit={m => { setEditing(m); setView("edit"); }}
onSelect={m => { setDetail(m); setView("detail"); }}
/>
</div>
</div>
))}
</div>
)}

{/* Calculator */}
{materials.length > 0 && (
<div style={{
marginTop: 28, background: "#1A1A1A", borderRadius: 12,
padding: "18px 22px", color: "#FFF"
}}>
<div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>⚡ Quick calculator</div>
<div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
<select value={calcMat} onChange={e => setCalcMat(e.target.value)}
style={{ flex: 2, minWidth: 160, padding: "8px 12px", borderRadius: 8, background: "#2A2A2A", color: "#FFF", border: "1px solid #444", fontSize: 13 }}>
<option value="">Select material...</option>
{materials.filter(m => m.show_r_value && m.r_value_per_inch).map(m => (
<option key={m.id} value={m.id}>{m.name}</option>
))}
</select>
<input type="number" min="0" step="0.5" value={calcInch}
onChange={e => setCalcInch(e.target.value)} placeholder="inches"
style={{ width: 90, padding: "8px 12px", borderRadius: 8, background: "#2A2A2A", color: "#FFF", border: "1px solid #444", fontSize: 13 }} />
<div style={{
padding: "8px 18px", background: calcResult ? "#2D6A4F" : "#333",
borderRadius: 8, fontWeight: 800, fontSize: 18, minWidth: 90, textAlign: "center", transition: "background 0.2s"
}}>
{calcResult ? `${unit}-${calcResult}` : <span style={{ fontSize: 13, fontWeight: 400, color: "#666" }}>result</span>}
</div>
</div>
</div>
)}
</>
)}
</div>

{toast && <Toast msg={toast} onDone={() => setToast(null)} />}
</div>
);
}
