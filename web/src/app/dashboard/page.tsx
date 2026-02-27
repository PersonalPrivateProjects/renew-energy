"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useUserStatus } from "../../hooks/useUserStatus";
import { Role, UserStatus, roleLabel } from "../../lib/enums";
import { shortAddress } from "../../lib/utils";

function RoleBadge({ role }: { role: Role }) {
  const colors: Record<Role, string> = {
    [Role.NONE]: "bg-slate-100 text-slate-800",
    [Role.PRODUCER]: "bg-green-100 text-green-800",
    [Role.FACTORY]: "bg-blue-100 text-blue-800",
    [Role.RETAILER]: "bg-purple-100 text-purple-800",
    [Role.CONSUMER]: "bg-orange-100 text-orange-800",
  };
  
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${colors[role] || colors[Role.NONE]}`}>
      {roleLabel(role)}
    </span>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  const colors: Record<UserStatus, string> = {
    [UserStatus.None]: "bg-slate-100 text-slate-600",
    [UserStatus.Pending]: "bg-amber-100 text-amber-700",
    [UserStatus.Approved]: "bg-emerald-100 text-emerald-700",
    [UserStatus.Rejected]: "bg-red-100 text-red-700",
    [UserStatus.Canceled]: "bg-slate-100 text-slate-600",
  };
  
  const labels: Record<UserStatus, string> = {
    [UserStatus.None]: "No registrado",
    [UserStatus.Pending]: "Pendiente de aprobación",
    [UserStatus.Approved]: "Aprobado",
    [UserStatus.Rejected]: "Rechazado",
    [UserStatus.Canceled]: "Cancelado",
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: string;
}

function QuickActionsCard({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
      {actions.map((action, idx) => (
        <Link
          key={idx}
          href={action.href}
          className={`p-5 rounded-xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${action.color}`}
        >
          <div className="text-2xl mb-2">{action.icon}</div>
          <h3 className="font-semibold text-slate-800 mb-1">{action.title}</h3>
          <p className="text-sm text-slate-500">{action.description}</p>
        </Link>
      ))}
    </div>
  );
}

function KPICard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <p className="text-sm text-slate-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { role, status } = useUserStatus();

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <div className="p-8 bg-white border border-slate-200 rounded-xl text-center">
          <p className="text-slate-600">Conecta tu wallet para ver tu dashboard.</p>
        </div>
      </div>
    );
  }

  if (status !== UserStatus.Approved) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Tu cuenta</h3>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-slate-500 mb-4">Address: <span className="font-mono">{shortAddress(address!)}</span></p>
          
          {status === UserStatus.Pending && (
            <p className="text-amber-600 text-sm">Tu solicitud está pendiente de aprobación por un administrador.</p>
          )}
          
          {status === UserStatus.None || status === UserStatus.Rejected || status === UserStatus.Canceled ? (
            <Link href="/auth/register" className="inline-block mt-4 px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors">
              Solicitar registro
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  const adminActions: QuickAction[] = [
    { title: "Gestionar Usuarios", description: "Aprobar o rechazar solicitudes", href: "/admin/users", icon: "👥", color: "bg-white border-slate-200 hover:border-emerald-300" },
  ];

  const producerActions: QuickAction[] = [
    { title: "Mis Tokens", description: "Ver todos tus tokens", href: "/tokens", icon: "🪙", color: "bg-white border-slate-200 hover:border-green-300" },
    { title: "Crear Token", description: "Crear materia prima", href: "/tokens/create", icon: "➕", color: "bg-white border-slate-200 hover:border-green-300" },
    { title: "Transferir", description: "Enviar tokens a Factory", href: "/tokens", icon: "📤", color: "bg-white border-slate-200 hover:border-green-300" },
    { title: "Mi Perfil", description: "Ver y editar perfil", href: "/profile", icon: "👤", color: "bg-white border-slate-200 hover:border-green-300" },
  ];

  const factoryActions: QuickAction[] = [
    { title: "Mis Tokens", description: "Ver todos tus tokens", href: "/tokens", icon: "🪙", color: "bg-white border-slate-200 hover:border-blue-300" },
    { title: "Transformar", description: "Convertir materia prima en certificados", href: "/tokens/transform", icon: "⚙️", color: "bg-white border-slate-200 hover:border-blue-300" },
    { title: "Transferir", description: "Enviar tokens a Retailer", href: "/tokens", icon: "📤", color: "bg-white border-slate-200 hover:border-blue-300" },
    { title: "Mi Perfil", description: "Ver y editar perfil", href: "/profile", icon: "👤", color: "bg-white border-slate-200 hover:border-blue-300" },
  ];

  const retailerActions: QuickAction[] = [
    { title: "Mis Tokens", description: "Ver todos tus tokens", href: "/tokens", icon: "🪙", color: "bg-white border-slate-200 hover:border-purple-300" },
    { title: "Transferir", description: "Enviar tokens a Consumer", href: "/tokens", icon: "📤", color: "bg-white border-slate-200 hover:border-purple-300" },
    { title: "Mi Perfil", description: "Ver y editar perfil", href: "/profile", icon: "👤", color: "bg-white border-slate-200 hover:border-purple-300" },
  ];

  const consumerActions: QuickAction[] = [
    { title: "Mis Tokens", description: "Ver todos tus tokens", href: "/tokens", icon: "🪙", color: "bg-white border-slate-200 hover:border-orange-300" },
    { title: "Recibir Transferencias", description: "Ver transferencias pendientes", href: "/transfers", icon: "📥", color: "bg-white border-slate-200 hover:border-orange-300" },
    { title: "Mi Perfil", description: "Ver y editar perfil", href: "/profile", icon: "👤", color: "bg-white border-slate-200 hover:border-orange-300" },
  ];

  const getActions = () => {
    switch (role) {
      case Role.PRODUCER: return producerActions;
      case Role.FACTORY: return factoryActions;
      case Role.RETAILER: return retailerActions;
      case Role.CONSUMER: return consumerActions;
      default: return [];
    }
  };

  const getKPIs = () => {
    switch (role) {
      case Role.PRODUCER:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KPICard title="Tu Rol" value="Producer" subtitle="Productor de energía" />
            <KPICard title="Estado" value="Activo" subtitle="Aprobado" />
            <KPICard title="Transferencias" value="0" subtitle="Ver historial" />
          </div>
        );
      case Role.FACTORY:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KPICard title="Tu Rol" value="Factory" subtitle="Planta transformadora" />
            <KPICard title="Estado" value="Activo" subtitle="Aprobado" />
            <KPICard title="Transformaciones" value="0" subtitle="Realizadas" />
          </div>
        );
      case Role.RETAILER:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KPICard title="Tu Rol" value="Retailer" subtitle="Distribuidor" />
            <KPICard title="Estado" value="Activo" subtitle="Aprobado" />
            <KPICard title="Ventas" value="0" subtitle="Completadas" />
          </div>
        );
      case Role.CONSUMER:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KPICard title="Tu Rol" value="Consumer" subtitle="Consumidor final" />
            <KPICard title="Estado" value="Activo" subtitle="Aprobado" />
            <KPICard title="Consumo" value="0" subtitle="Tokens redimidos" />
          </div>
        );
      default:
        return null;
    }
  };

  const actions = role === Role.NONE && address ? adminActions : getActions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500 mb-2">Cuenta conectada</p>
            <p className="font-mono text-slate-800">{shortAddress(address!)}</p>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Rol:</span>
              <RoleBadge role={role} />
            </div>
            <StatusBadge status={status} />
          </div>
        </div>
      </div>

      {getKPIs()}

      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Accesos Rápidos</h3>
        <QuickActionsCard actions={actions} />
      </div>

      {role === Role.FACTORY && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Transferencias Recientes</h3>
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <p className="text-sm text-slate-500">Ver todas las transferencias en la página de Transfers.</p>
            <Link href="/transfers" className="inline-block mt-3 text-emerald-600 hover:text-emerald-700 text-sm font-medium">
              Ir a Transfers →
            </Link>
          </div>
        </div>
      )}

      {(role === Role.PRODUCER || role === Role.RETAILER || role === Role.CONSUMER) && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Transferencias</h3>
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <p className="text-sm text-slate-500">Gestiona tus transferencias desde Mis Tokens o la página de Transfers.</p>
            <Link href="/transfers" className="inline-block mt-3 text-emerald-600 hover:text-emerald-700 text-sm font-medium">
              Ir a Transfers →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
