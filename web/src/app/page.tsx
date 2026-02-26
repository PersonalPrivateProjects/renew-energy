import UserGate from "../components/UserGate";

// Página principal que cumple con:
// - No conectado: invitar a conectar
// - Conectado/no registrado: formulario (link a /register)
// - Conectado/pendiente/aprobado: mensajes y accesos
// Esto mapea con el apartado "Paginas principales" de tu documento. [1](https://idata2-my.sharepoint.com/personal/carlos_abreu_idata_global/Documents/Microsoft%20Copilot%20Chat%20Files/prompts.txt)

export default function HomePage() {
  return (
    <div className="space-y-6">
      <section className="card p-6 bg-gradient-to-br from-emerald-50 to-slate-50 border-emerald-200">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Green Supply Chain</h1>
        <p className="text-slate-600">
          Sistema de trazabilidad y tokenización con flujo controlado por roles (Producer → Factory → Retailer → Consumer).
        </p>
      </section>

      <UserGate />
    </div>
  );
}