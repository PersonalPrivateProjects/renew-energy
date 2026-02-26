// En el siguiente paso implementamos:
// - Resumen por rol
// - Métricas básicas (ej. energía total producida/vendida/consumida)
// - Accesos rápidos a crear token / transferencias
// Esto está alineado con "Dashboard" del enunciado. [1](https://idata2-my.sharepoint.com/personal/carlos_abreu_idata_global/Documents/Microsoft%20Copilot%20Chat%20Files/prompts.txt)

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">Dashboard</h2>
      <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
        <p className="text-slate-600">Próximamente: KPIs y accesos rápidos según tu rol.</p>
      </div>
    </div>
  );
}