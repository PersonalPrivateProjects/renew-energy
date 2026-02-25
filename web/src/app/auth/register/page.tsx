import RegistrationForm from "../../../components/RegistrationForm";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Registro por rol</h2>
      <p className="text-gray-600">
        Solicita tu rol operativo. El administrador aprobará o rechazará tu solicitud.
      </p>
      <RegistrationForm />
    </div>
  );
}