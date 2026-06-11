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
                    {calcResult ? ${unit}-${calcResult} : <span style={{ fontSize: 13, fontWeight: 400, color: "#666" }}>result</span>}
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
