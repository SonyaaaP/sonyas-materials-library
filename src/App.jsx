import { useState, useEffect } from "react";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://dpuqpovjhnmmglzvnbsc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwdXFwb3ZqaG5tbWdsenZuYnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMzkzODYsImV4cCI6MjA5NjcxNTM4Nn0.38HQp4oUnVI4S64aMNfnSV8VfRuKkwjFJD2DMY0cZ64";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Conversion constants
const IN_TO_MM = 25.4;
const R_TO_RSI = 5.678; // divide R by this to get RSI (exact conversion for resistance values)

function rPerInchDisplay(r, system) {
if (r == null) return null;
return system === "imperial" ? r : r / R_TO_RSI;
}
function rUnitLabel(system) {
return system === "imperial" ? "R/in" : "RSI/in";
}
function thicknessDisplay(inches, system) {
if (inches == null) return null;
return system === "imperial" ? inches : inches * IN_TO_MM;
}
function thicknessUnitLabel(system) {
return system === "imperial" ? "″" : "mm";
}
function fmt(n, digits = 2) {
if (n == null) return "—";
return Number(n).toFixed(digits).replace(/\.?0+$/, "") || "0";
}

function Toast({ msg, onDone }) {
useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
return (
<div style={{
position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
background: "#1A1A1A", color: "#FFF", padding: "10px 22px", borderRadius: 24,
fontSize: 13, fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
maxWidth: "90vw", textAlign: "center"
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

// Simple SVG icons (avoid emoji font issues)
function SunIcon() {
return (
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
<circle cx="12" cy="12" r="4" />
<line x1="12" y1="2" x2="12" y2="4.5" />
<line x1="12" y1="19.5" x2="12" y2="22" />
<line x1="2" y1="12" x2="4.5" y2="12" />
<line x1="19.5" y1="12" x2="22" y2="12" />
<line x1="4.5" y1="4.5" x2="6.3" y2="6.3" />
<line x1="17.7" y1="17.7" x2="19.5" y2="19.5" />
<line x1="4.5" y1="19.5" x2="6.3" y2="17.7" />
<line x1="17.7" y1="6.3" x2="19.5" y2="4.5" />
</svg>
);
}
function MoonIcon() {
return (
<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
</svg>
);
}

function MaterialCard({ mat, types, system, onEdit, onSelect, selected }) {
const type = types.find(t => t.id === mat.type_id);
const color = type?.color || "#888";

const rVal = mat.r_value_per_inch != null ? rPerInchDisplay(mat.r_value_per_inch, system) : null;
const minT = thicknessDisplay(mat.min_thickness, system);
const maxT = thicknessDisplay(mat.max_thickness, system);
const tUnit = thicknessUnitLabel(system);

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
{mat.show_r_value && rVal != null && (
<div style={{ textAlign: "right", minWidth: 70, marginRight: 22 }}>
<div style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1 }}>{fmt(rVal, 3)}</div>
<div style={{ fontSize: 11, color: "var(--muted)" }}>{rUnitLabel(system)}</div>
</div>
)}
</div>
{mat.description && (
<div style={{ marginTop: 10, fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{mat.description}</div>
)}
{(mat.min_thickness != null || mat.max_thickness != null) && (
<div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
Thickness: {minT != null ? fmt(minT, 1) : "—"}{tUnit} – {maxT != null ? fmt(maxT, 1) : "—"}{tUnit}
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

// Convert a thickness value between "in" and "mm"
function convertThickness(value, fromUnit, toUnit) {
if (value === "" || value == null) return value;
const num = parseFloat(value);
if (isNaN(num)) return value;
if (fromUnit === toUnit) return value;
if (fromUnit === "in" && toUnit === "mm") return (num * IN_TO_MM).toFixed(1);
if (fromUnit === "mm" && toUnit === "in") return (num / IN_TO_MM).toFixed(4);
return value;
}

function MaterialForm({ initial, types, onSave, onCancel, onDelete }) {
const [form, setForm] = useState(initial || {
name: "", brand: "", type_id: "", description: "",
r_value_per_inch: "", min_thickness: "", max_thickness: "", show_r_value: true
});
// thicknessUnit: which unit the min/max thickness fields are currently shown & entered in
const [thicknessUnit, setThicknessUnit] = useState("in");
const [newTypeName, setNewTypeName] = useState("");
const [newTypeColor, setNewTypeColor] = useState("#2D6A4F");
const [addingType, setAddingType] = useState(false);
const [file, setFile] = useState(null);
const [saving, setSaving] = useState(false);

const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

const handleThicknessUnitChange = (newUnit) => {
if (newUnit === thicknessUnit) return;
setForm(f => ({
...f,
min_thickness: convertThickness(f.min_thickness, thicknessUnit, newUnit),
max_thickness: convertThickness(f.max_thickness, thicknessUnit, newUnit),
}));
setThicknessUnit(newUnit);
};

const handleSave = async () => {
if (!form.name.trim()) return;
setSaving(true);
// Convert thickness fields to inches (canonical storage unit) before saving
const payload = {
...form,
min_thickness: form.min_thickness !== "" ? convertThickness(form.min_thickness, thicknessUnit, "in") : "",
max_thickness: form.max_thickness !== "" ? convertThickness(form.max_thickness, thicknessUnit, "in") : "",
};
await onSave(payload, file);
setSaving(false);
};

const handleAddType = async () => {
if (!newTypeName.trim()) return;
const newType = await onSave({ __newType: true, name: newTypeName, color: newTypeColor });
if (newType && newType.id) {
set("type_id", newType.id);
}
setAddingType(false);
setNewTypeName("");
};

const inputStyle = {
width: "100%", padding: "8px 12px", borderRadius: 8,
border: "1px solid var(--border)", background: "var(--bg)",
color: "var(--text)", fontSize: 14, boxSizing: "border-box"
};
const labelStyle = { fontSize: 12, color: "var(--muted)", marginBottom: 4, display: "block" };

const unitToggleBtn = (val, label) => (
<button
type="button"
onClick={() => handleThicknessUnitChange(val)}
style={{
padding: "4px 10px", borderRadius: 14, border: "none", cursor: "pointer",
fontSize: 11, fontWeight: 700,
background: thicknessUnit === val ? "#1A1A1A" : "transparent",
color: thicknessUnit === val ? "#FFF" : "var(--muted)"
}}
>{label}</button>
);

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
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
<label style={{ ...labelStyle, marginBottom: 0 }}>R-value per inch &nbsp;/&nbsp; thickness range</label>
<div style={{ display: "flex", background: "var(--bg)", borderRadius: 16, border: "1px solid var(--border)", padding: 2 }}>
{unitToggleBtn("in", "in")}
{unitToggleBtn("mm", "mm")}
</div>
</div>
<div style={{ display: "flex", gap: 12 }}>
<div style={{ flex: 1 }}>
<label style={labelStyle}>R-value / inch (imperial)</label>
<input style={inputStyle} type="number" step="0.1"
value={form.r_value_per_inch} onChange={e => set("r_value_per_inch", e.target.value)}
placeholder="e.g. 4.2" />
</div>
<div style={{ flex: 1 }}>
<label style={labelStyle}>Min thickness ({thicknessUnit})</label>
<input style={inputStyle} type="number" step={thicknessUnit === "in" ? "0.5" : "1"}
value={form.min_thickness} onChange={e => set("min_thickness", e.target.value)}
placeholder={thicknessUnit === "in" ? "e.g. 1" : "e.g. 25"} />
</div>
<div style={{ flex: 1 }}>
<label style={labelStyle}>Max thickness ({thicknessUnit})</label>
<input style={inputStyle} type="number" step={thicknessUnit === "in" ? "0.5" : "1"}
value={form.max_thickness} onChange={e => set("max_thickness", e.target.value)}
placeholder={thicknessUnit === "in" ? "e.g. 6" : "e.g. 150"} />
</div>
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

function CompareTable({ materials, types, system, onClose }) {
const tUnit = thicknessUnitLabel(system);

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
{["Name", "Brand", "Type", rUnitLabel(system), `Thickness (${tUnit})`, "Description"].map(h => (
<th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "var(--muted)", fontWeight: 600, borderBottom: "1px solid var(--border)" }}>{h}</th>
))}
</tr>
</thead>
<tbody>
{materials.map((m, i) => {
const type = types.find(t => t.id === m.type_id);
const rVal = m.r_value_per_inch != null ? rPerInchDisplay(m.r_value_per_inch, system) : null;
const minT = thicknessDisplay(m.min_thickness, system);
const maxT = thicknessDisplay(m.max_thickness, system);
return (
<tr key={m.id} style={{ background: i % 2 === 0 ? "var(--bg)" : "var(--card)" }}>
<td style={{ padding: "10px 12px", fontWeight: 600, color: "var(--text)", borderBottom: "1px solid var(--border)" }}>{m.name}</td>
<td style={{ padding: "10px 12px", color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>{m.brand || "—"}</td>
<td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
{type ? <Badge color={type.color} label={type.name} /> : "—"}
</td>
<td style={{ padding: "10px 12px", fontWeight: 700, color: type?.color || "var(--text)", borderBottom: "1px solid var(--border)" }}>
{m.show_r_value && rVal != null ? fmt(rVal, 3) : "hidden"}
</td>
<td style={{ padding: "10px 12px", color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
{minT != null || maxT != null ? `${minT != null ? fmt(minT, 1) : "?"} – ${maxT != null ? fmt(maxT, 1) : "?"}` : "—"}
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
const [system, setSystem] = useState("imperial"); // "imperial" | "metric"
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
const [calcThickness, setCalcThickness] = useState("");

const showToast = msg => setToast(msg);

useEffect(() => {
loadAll();
}, []);

// Make the page background (outside our container) match the theme
useEffect(() => {
document.body.style.margin = "0";
document.body.style.background = dark ? "#0F0F0F" : "#F7F6F3";
document.documentElement.style.background = dark ? "#0F0F0F" : "#F7F6F3";
}, [dark]);

const loadAll = async () => {
setLoading(true);
const [{ data: mats, error: mErr }, { data: typs, error: tErr }, { data: docs }] = await Promise.all([
supabase.from("materials").select("*").order("created_at", { ascending: false }),
supabase.from("material_types").select("*").order("name"),
supabase.from("documents").select("*")
]);
if (mErr) showToast("Load error: " + mErr.message);
if (tErr) showToast("Load error: " + tErr.message);
setMaterials(mats || []);
setTypes(typs || []);
setDocuments(docs || []);
setLoading(false);
};

// returns the created type row (for new types) so the form can select it
const handleSave = async (form, file) => {
if (form.__newType) {
const { data, error } = await supabase.from("material_types").insert({ name: form.name, color: form.color }).select().single();
if (error) {
showToast("Could not add type: " + error.message);
return null;
}
if (data) setTypes(t => [...t, data].sort((a, b) => a.name.localeCompare(b.name)));
showToast("Type added");
return data;
}

const payload = {
name: form.name.trim(),
brand: form.brand || null,
type_id: form.type_id || null,
description: form.description || null,
r_value_per_inch: form.r_value_per_inch !== "" && form.r_value_per_inch != null ? parseFloat(form.r_value_per_inch) : null,
min_thickness: form.min_thickness !== "" && form.min_thickness != null ? parseFloat(form.min_thickness) : null,
max_thickness: form.max_thickness !== "" && form.max_thickness != null ? parseFloat(form.max_thickness) : null,
show_r_value: form.show_r_value
};

let matId = form.id;
if (form.id) {
const { error } = await supabase.from("materials").update(payload).eq("id", form.id);
if (error) { showToast("Save error: " + error.message); return null; }
setMaterials(ms => ms.map(m => m.id === form.id ? { ...m, ...payload } : m));
showToast("Material updated");
} else {
const { data, error } = await supabase.from("materials").insert(payload).select().single();
if (error) { showToast("Save error: " + error.message); return null; }
if (data) { setMaterials(ms => [data, ...ms]); matId = data.id; }
showToast("Material added");
}

if (file && matId) {
const path = `${matId}/${file.name}`;
const { error: upErr } = await supabase.storage.from("documents").upload(path, file, { upsert: true });
if (upErr) {
showToast("File upload error: " + upErr.message);
} else {
const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
const { data: doc } = await supabase.from("documents").insert({
material_id: matId, file_name: file.name, storage_path: path
}).select().single();
if (doc) setDocuments(ds => [...ds, { ...doc, url: urlData.publicUrl }]);
}
}

setView("list");
setEditing(null);
return { id: matId };
};

const handleDelete = async (id) => {
const { error } = await supabase.from("materials").delete().eq("id", id);
if (error) { showToast("Delete error: " + error.message); return; }
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

// Calculator logic
const calcMaterial = materials.find(m => m.id === calcMat);
let calcResult = null;
if (calcMaterial && calcMaterial.r_value_per_inch != null && calcThickness !== "") {
const inputVal = parseFloat(calcThickness);
if (!isNaN(inputVal)) {
const thicknessInches = system === "imperial" ? inputVal : inputVal / IN_TO_MM;
const totalR = calcMaterial.r_value_per_inch * thicknessInches;
calcResult = system === "imperial" ? totalR : totalR / R_TO_RSI;
}
}

const theme = dark ? {
"--bg": "#0F0F0F", "--card": "#1A1A1A", "--text": "#F0F0F0",
"--muted": "#888", "--border": "#2A2A2A"
} : {
"--bg": "#F7F6F3", "--card": "#FFFFFF", "--text": "#1A1A1A",
"--muted": "#666", "--border": "#E5E5E5"
};

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

{/* System toggle */}
<div style={{ display: "flex", background: "var(--bg)", borderRadius: 20, padding: 3, border: "1px solid var(--border)" }}>
{[["imperial", "Imperial"], ["metric", "Metric"]].map(([val, label]) => (
<button key={val} onClick={() => setSystem(val)} style={{
padding: "5px 12px", borderRadius: 16, border: "none", cursor: "pointer",
background: system === val ? "#1A1A1A" : "transparent",
color: system === val ? "#FFF" : "var(--muted)",
fontWeight: 700, fontSize: 12, transition: "all 0.15s"
}}>{label}</button>
))}
</div>

{/* Dark mode */}
<button onClick={() => setDark(d => !d)} style={{
background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 20,
padding: "6px 10px", cursor: "pointer", color: "var(--text)",
display: "flex", alignItems: "center", justifyContent: "center"
}}>{dark ? <SunIcon /> : <MoonIcon />}</button>

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
system={system}
onClose={() => setView("list")}
/>
</div>
)}

{/* DETAIL */}
{view === "detail" && detail && (() => {
const type = types.find(t => t.id === detail.type_id);
const color = type?.color || "#888";
const matDocs = documents.filter(d => d.material_id === detail.id);
const rVal = detail.r_value_per_inch != null ? rPerInchDisplay(detail.r_value_per_inch, system) : null;
const minT = thicknessDisplay(detail.min_thickness, system);
const maxT = thicknessDisplay(detail.max_thickness, system);
const tUnit = thicknessUnitLabel(system);
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
{detail.show_r_value && rVal != null && (
<div style={{ background: color + "15", borderRadius: 10, padding: "12px 20px", textAlign: "center" }}>
<div style={{ fontSize: 28, fontWeight: 800, color }}>{fmt(rVal, 3)}</div>
<div style={{ fontSize: 11, color: "var(--muted)" }}>{rUnitLabel(system)}</div>
</div>
)}
{(minT != null || maxT != null) && (
<div style={{ background: "var(--bg)", borderRadius: 10, padding: "12px 20px", textAlign: "center" }}>
<div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>
{minT != null ? fmt(minT, 1) : "?"}{tUnit} – {maxT != null ? fmt(maxT, 1) : "?"}{tUnit}
</div>
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
mat={mat} types={types} system={system}
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
marginTop: 28, background: "var(--card)", borderRadius: 12,
padding: "18px 22px", color: "var(--text)", border: "1px solid var(--border)"
}}>
<div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>⚡ R-value calculator</div>
<div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
<select value={calcMat} onChange={e => setCalcMat(e.target.value)}
style={{ flex: 2, minWidth: 160, padding: "8px 12px", borderRadius: 8, background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)", fontSize: 13 }}>
<option value="">Select material...</option>
{materials.filter(m => m.r_value_per_inch != null).map(m => (
<option key={m.id} value={m.id}>{m.name}</option>
))}
</select>
<input type="number" min="0" step={system === "imperial" ? "0.5" : "5"} value={calcThickness}
onChange={e => setCalcThickness(e.target.value)}
placeholder={system === "imperial" ? "inches" : "mm"}
style={{ width: 90, padding: "8px 12px", borderRadius: 8, background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)", fontSize: 13 }} />
<div style={{
padding: "8px 18px", background: calcResult != null ? "#2D6A4F" : "var(--bg)",
color: calcResult != null ? "#FFF" : "var(--muted)",
border: calcResult != null ? "none" : "1px solid var(--border)",
borderRadius: 8, fontWeight: 800, fontSize: 18, minWidth: 110, textAlign: "center", transition: "background 0.2s"
}}>
{calcResult != null
? `${system === "imperial" ? "R" : "RSI"}-${fmt(calcResult, 2)}`
: <span style={{ fontSize: 13, fontWeight: 400 }}>result</span>}
</div>
</div>
<div style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>
Enter thickness in {system === "imperial" ? "inches" : "millimeters"} to get the total {system === "imperial" ? "R-value" : "RSI"} of that layer.
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
