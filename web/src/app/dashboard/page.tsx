"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useUserStatus } from "../../hooks/useUserStatus";
import { Role, UserStatus, roleLabel } from "../../lib/enums";
import { shortAddress } from "../../lib/utils";
import ContractMetricsBento from "../../components/ContractMetricsBento";
import ContractEventsFeed from "../../components/ContractEventsFeed";
import { useRoleOperationalKpi } from "../../hooks/useRoleOperationalKpi";

function RoleBadge({ role }: { role: Role }) {
  const colors: Record<Role, { bg: string; text: string; icon: React.ReactNode }> = {
    [Role.NONE]: { bg: "bg-red-100", text: "text-red-700", icon: <ShieldIcon className="w-4 h-4" /> },
    [Role.PRODUCER]: { bg: "bg-amber-100", text: "text-amber-700", icon: <SunIcon className="w-4 h-4" /> },
    [Role.FACTORY]: { bg: "bg-blue-100", text: "text-blue-700", icon: <FactoryIcon className="w-4 h-4" /> },
    [Role.RETAILER]: { bg: "bg-purple-100", text: "text-purple-700", icon: <TruckIcon className="w-4 h-4" /> },
    [Role.CONSUMER]: { bg: "bg-emerald-100", text: "text-emerald-700", icon: <BoltIcon className="w-4 h-4" /> },
  };
  
  const style = colors[role] || colors[Role.NONE];
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${style.bg} ${style.text}`}>
      {style.icon}
      {roleLabel(role)}
    </span>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  const colors: Record<UserStatus, { bg: string; text: string; icon: React.ReactNode }> = {
    [UserStatus.None]: { bg: "bg-gray-100", text: "text-gray-600", icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg> },
    [UserStatus.Pending]: { bg: "bg-yellow-100", text: "text-yellow-700", icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    [UserStatus.Approved]: { bg: "bg-emerald-100", text: "text-emerald-700", icon: <CheckIcon className="w-3.5 h-3.5" /> },
    [UserStatus.Rejected]: { bg: "bg-red-100", text: "text-red-700", icon: <XIcon className="w-3.5 h-3.5" /> },
    [UserStatus.Canceled]: { bg: "bg-gray-100", text: "text-gray-600", icon: <XIcon className="w-3.5 h-3.5" /> },
  };
  
  const labels: Record<UserStatus, string> = {
    [UserStatus.None]: "No registrado",
    [UserStatus.Pending]: "Pendiente",
    [UserStatus.Approved]: "Aprobado",
    [UserStatus.Rejected]: "Rechazado",
    [UserStatus.Canceled]: "Cancelado",
  };
  
  const style = colors[status];
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.icon}
      {labels[status]}
    </span>
  );
}

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

function QuickActionsCard({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
      {actions.map((action, idx) => (
        <Link
          key={idx}
          href={action.href}
          className={`group p-5 rounded-xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${action.color}`}
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${action.color.replace('hover:', '')} bg-opacity-10`}>
            {action.icon}
          </div>
          <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-emerald-600 transition-colors">{action.title}</h3>
          <p className="text-sm text-gray-500">{action.description}</p>
        </Link>
      ))}
    </div>
  );
}

function KPICard({ title, value, subtitle, icon }: { title: string; value: string; subtitle?: string; icon: React.ReactNode }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function UserIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
}

function SunIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>;
}

function FactoryIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" /></svg>;
}

function TruckIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>;
}

function BoltIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>;
}

function ShieldIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>;
}

function CheckIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>;
}

function XIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { role, status } = useUserStatus();
  const roleKpi = useRoleOperationalKpi({ address, role, status });

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="glass-card rounded-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
            <BoltIcon className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Bienvenido al Dashboard</h2>
          <p className="text-gray-500">Conecta tu wallet para acceder a tu panel de control.</p>
        </div>
      </div>
    );
  }

  if (status !== UserStatus.Approved) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Tu cuenta</h3>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-gray-500 mb-4">Address: <span className="font-mono">{shortAddress(address!)}</span></p>
          
          {status === UserStatus.Pending && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="w-5 h-5 mt-0.5 text-yellow-600">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-800">Solicitud en revisión</p>
                <p className="text-xs text-yellow-700 mt-1">Tu solicitud está pendiente de aprobación por un administrador.</p>
              </div>
            </div>
          )}
          
          {status === UserStatus.None || status === UserStatus.Rejected || status === UserStatus.Canceled ? (
            <Link href="/auth/register" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Solicitar registro
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  const producerActions: QuickAction[] = [
    { title: "Mis Tokens", description: "Ver todos tus tokens de energía", href: "/tokens", icon: <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>, color: "bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50" },
    { title: "Crear Token", description: "Generar materia prima energética", href: "/tokens/create", icon: <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>, color: "bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50" },
    { title: "Transferir", description: "Enviar energía a Factory", href: "/tokens", icon: <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>, color: "bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50" },
    { title: "Mi Perfil", description: "Configuración de cuenta", href: "/profile", icon: <UserIcon className="w-5 h-5 text-gray-600" />, color: "bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50" },
  ];

  const factoryActions: QuickAction[] = [
    { title: "Mis Tokens", description: "Ver todos tus certificados", href: "/tokens", icon: <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>, color: "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50" },
    { title: "Transformar", description: "Convertir materia en certificados", href: "/tokens/transform", icon: <FactoryIcon className="w-5 h-5 text-indigo-600" />, color: "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50" },
    { title: "Transferir", description: "Distribuir a Retailers", href: "/tokens", icon: <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>, color: "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50" },
    { title: "Mi Perfil", description: "Configuración de cuenta", href: "/profile", icon: <UserIcon className="w-5 h-5 text-gray-600" />, color: "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50" },
  ];

  const retailerActions: QuickAction[] = [
    { title: "Mis Tokens", description: "Ver certificados disponibles", href: "/tokens", icon: <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>, color: "bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50" },
    { title: "Transferir", description: "Venta a consumidores", href: "/tokens", icon: <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>, color: "bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50" },
    { title: "Mi Perfil", description: "Configuración de cuenta", href: "/profile", icon: <UserIcon className="w-5 h-5 text-gray-600" />, color: "bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50" },
  ];

  const consumerActions: QuickAction[] = [
    { title: "Mis Tokens", description: "Tus certificados de energía", href: "/tokens", icon: <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>, color: "bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50" },
    { title: "Redimir", description: "Consumir energía certificada", href: "/tokens/redeem", icon: <BoltIcon className="w-5 h-5 text-orange-600" />, color: "bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50" },
    { title: "Recibir Transferencias", description: "Aceptar certificados", href: "/transfers", icon: <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" /></svg>, color: "bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50" },
    { title: "Mi Perfil", description: "Configuración de cuenta", href: "/profile", icon: <UserIcon className="w-5 h-5 text-gray-600" />, color: "bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50" },
  ];

  const adminActions: QuickAction[] = [
    { title: "Gestionar Usuarios", description: "Aprobar o rechazar solicitudes", href: "/admin/users", icon: <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>, color: "bg-white border-gray-200 hover:border-red-300 hover:bg-red-50" },
    { title: "Mi Perfil", description: "Configuración de cuenta", href: "/profile", icon: <UserIcon className="w-5 h-5 text-gray-600" />, color: "bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50" },
  ];

  const getActions = () => {
    switch (role) {
      case Role.NONE: return adminActions;
      case Role.PRODUCER: return producerActions;
      case Role.FACTORY: return factoryActions;
      case Role.RETAILER: return retailerActions;
      case Role.CONSUMER: return consumerActions;
      default: return [];
    }
  };

  const getKPIs = () => {
    switch (role) {
      case Role.NONE:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KPICard title="Tu Rol" value="Admin" subtitle="Administrador del sistema" icon={<ShieldIcon className="w-5 h-5" />} />
            <KPICard title="Estado" value="Activo" subtitle="Acceso completo" icon={<CheckIcon className="w-5 h-5" />} />
            <KPICard title="Usuarios" value="—" subtitle="Gestionar en Admin" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>} />
          </div>
        );
      case Role.PRODUCER:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KPICard title="Tu Rol" value="Producer" subtitle="Productor de energía" icon={<SunIcon className="w-5 h-5" />} />
            <KPICard title="Estado" value="Activo" subtitle="Aprobado" icon={<CheckIcon className="w-5 h-5" />} />
            <KPICard title={roleKpi.title} value={roleKpi.loading ? "..." : roleKpi.value} subtitle={roleKpi.subtitle} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>} />
          </div>
        );
      case Role.FACTORY:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KPICard title="Tu Rol" value="Factory" subtitle="Planta transformadora" icon={<FactoryIcon className="w-5 h-5" />} />
            <KPICard title="Estado" value="Activo" subtitle="Aprobado" icon={<CheckIcon className="w-5 h-5" />} />
            <KPICard title={roleKpi.title} value={roleKpi.loading ? "..." : roleKpi.value} subtitle={roleKpi.subtitle} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>} />
          </div>
        );
      case Role.RETAILER:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KPICard title="Tu Rol" value="Retailer" subtitle="Distribuidor" icon={<TruckIcon className="w-5 h-5" />} />
            <KPICard title="Estado" value="Activo" subtitle="Aprobado" icon={<CheckIcon className="w-5 h-5" />} />
            <KPICard title={roleKpi.title} value={roleKpi.loading ? "..." : roleKpi.value} subtitle={roleKpi.subtitle} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>} />
          </div>
        );
      case Role.CONSUMER:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KPICard title="Tu Rol" value="Consumer" subtitle="Consumidor final" icon={<BoltIcon className="w-5 h-5" />} />
            <KPICard title="Estado" value="Activo" subtitle="Aprobado" icon={<CheckIcon className="w-5 h-5" />} />
            <KPICard title={roleKpi.title} value={roleKpi.loading ? "..." : roleKpi.value} subtitle={roleKpi.subtitle} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /></svg>} />
          </div>
        );
      default:
        return null;
    }
  };

  const actions = getActions();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
      </div>

      <div className="glass-card rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-2">Cuenta conectada</p>
            <p className="font-mono text-gray-800 bg-gray-100 px-3 py-1.5 rounded-lg inline-block">{shortAddress(address!)}</p>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Rol:</span>
              <RoleBadge role={role} />
            </div>
            <StatusBadge status={status} />
          </div>
        </div>
      </div>

      {getKPIs()}

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Métricas on-chain</h3>
        <ContractMetricsBento />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          Accesos Rápidos
        </h3>
        <QuickActionsCard actions={actions} />
      </div>

      {role === Role.FACTORY && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            Transferencias Recientes
          </h3>
          <div className="glass-card rounded-xl p-6">
            <p className="text-sm text-gray-500">Ver todas las transferencias en la página de Transfers.</p>
            <Link href="/transfers" className="inline-flex items-center gap-1 mt-3 text-emerald-600 hover:text-emerald-700 text-sm font-medium">
              Ir a Transfers 
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {(role === Role.PRODUCER || role === Role.RETAILER || role === Role.CONSUMER) && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
            Transferencias
          </h3>
          <div className="glass-card rounded-xl p-6">
            <p className="text-sm text-gray-500">Gestiona tus transferencias desde Mis Tokens o la página de Transfers.</p>
            <Link href="/transfers" className="inline-flex items-center gap-1 mt-3 text-emerald-600 hover:text-emerald-700 text-sm font-medium">
              Ir a Transfers 
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Actividad en tiempo real</h3>
        <ContractEventsFeed />
      </div>
    </div>
  );
}
