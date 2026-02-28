import RegistrationForm from "../../../components/RegistrationForm";

function ClipboardDocumentListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
          <ClipboardDocumentListIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Registro por Rol</h2>
          <p className="text-sm text-gray-500">Únete a la red de energía renovable</p>
        </div>
      </div>
      
      <div className="glass-card rounded-xl p-4 text-sm text-gray-600">
        <p>
          Solicita tu rol operativo. Un administrador aprobará o rechazará tu solicitud.
          Una vez aprobado, podrás acceder a las funcionalidades de tu rol.
        </p>
      </div>
      
      <RegistrationForm />
    </div>
  );
}
