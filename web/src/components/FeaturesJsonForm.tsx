"use client";

import { useState, useEffect } from "react";

export interface FeaturesJsonData {
  source: string;
  unit: string;
  name: string;
  description: string;
  certification: string;
}

export interface FeaturesJsonFormProps {
  mode: "create" | "transform";
  parentFeatures?: FeaturesJsonData;
  value?: FeaturesJsonData;
  onChange: (data: FeaturesJsonData) => void;
}

const ENERGY_SOURCES = [
  { value: "eólica", label: "Eólica" },
  { value: "solar", label: "Solar" },
  { value: "hidráulica", label: "Hidráulica" },
  { value: "geotérmica", label: "Geotérmica" },
  { value: "biomasa", label: "Biomasa" },
  { value: "mareomotriz", label: "Mareomotriz" },
  { value: "undimotriz", label: "Undimotriz" },
] as const;

const ENERGY_UNITS = ["kWh", "MWh"] as const;

const CERTIFICATIONS = [
  { value: "irec", label: "I-REC (International Renewable Energy Certificate)", group: "Certificados de Atributos (EACs)" },
  { value: "goo", label: "GoO (Guarantees of Origin - Europa)", group: "Certificados de Atributos (EACs)" },
  { value: "rec", label: "REC (Renewable Energy Certificates - USA)", group: "Certificados de Atributos (EACs)" },
  { value: "tigrs", label: "TIGRs (Tradable Instrument)", group: "Certificados de Atributos (EACs)" },
  { value: "ekoenergy", label: "EKOenergy (Sello Ecológico Internacional)", group: "Ecoetiquetas (Sostenibilidad)" },
  { value: "green-e", label: "Green-e (Calidad Certificada)", group: "Ecoetiquetas (Sostenibilidad)" },
  { value: "naturemade", label: "Naturemade (Estándar Suizo)", group: "Ecoetiquetas (Sostenibilidad)" },
  { value: "iso14064", label: "ISO 14064 (Huella de Carbono)", group: "Emisiones y Carbono" },
  { value: "vcs", label: "VCS - Verra (Créditos de Carbono)", group: "Emisiones y Carbono" },
  { value: "gold_standard", label: "Gold Standard (Impacto ODS)", group: "Emisiones y Carbono" },
  { value: "iso50001", label: "ISO 50001 (Eficiencia Energética)", group: "Gestión de Planta" },
  { value: "iso14001", label: "ISO 14001 (Gestión Ambiental)", group: "Gestión de Planta" },
] as const;

const CERTIFICATION_GROUPS = [
  "Certificados de Atributos (EACs)",
  "Ecoetiquetas (Sostenibilidad)",
  "Emisiones y Carbono",
  "Gestión de Planta",
] as const;

export function FeaturesJsonForm({ mode, parentFeatures, value, onChange }: FeaturesJsonFormProps) {
  const [source, setSource] = useState(value?.source ?? "");
  const [unit, setUnit] = useState(value?.unit ?? "kWh");
  const [name, setName] = useState(value?.name ?? "");
  const [description, setDescription] = useState(value?.description ?? "");
  const [certification, setCertification] = useState(value?.certification ?? "");
  const [unitError, setUnitError] = useState("");

  const isTransform = mode === "transform";

  useEffect(() => {
    if (isTransform && parentFeatures) {
      setSource(parentFeatures.source);
      setUnit(parentFeatures.unit);
      setCertification(parentFeatures.certification);
    }
  }, [isTransform, parentFeatures]);

  useEffect(() => {
    if (isTransform && parentFeatures && unit !== parentFeatures.unit) {
      setUnitError(`La unidad debe ser ${parentFeatures.unit}`);
    } else {
      setUnitError("");
    }
  }, [unit, isTransform, parentFeatures]);

  useEffect(() => {
    onChange({
      source,
      unit,
      name: name.slice(0, 40),
      description: description.slice(0, 280),
      certification,
    });
  }, [source, unit, name, description, certification, onChange]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Fuente de energía
            {isTransform && <span className="ml-2 text-xs text-slate-400">(del token padre)</span>}
          </label>
          <select
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
            value={source}
            onChange={(e) => setSource(e.target.value)}
            disabled={isTransform}
            required
          >
            <option value="">— Selecciona —</option>
            {ENERGY_SOURCES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Unidad energética
            {isTransform && <span className="ml-2 text-xs text-slate-400">(del token padre)</span>}
          </label>
          <div className="flex gap-3">
            {ENERGY_UNITS.map((u) => (
              <label key={u} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="unit"
                  value={u}
                  checked={unit === u}
                  onChange={(e) => setUnit(e.target.value)}
                  disabled={isTransform}
                  className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                />
                <span className={`text-sm ${isTransform ? "text-slate-500" : "text-slate-700"}`}>{u}</span>
              </label>
            ))}
          </div>
          {unitError && <p className="text-xs text-red-500 mt-1">{unitError}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Nombre corto
          <span className="ml-2 text-xs text-slate-400">({name.length}/40)</span>
        </label>
        <input
          type="text"
          className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
          placeholder="Ej: Lote Solar 1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Descripción
          <span className="ml-2 text-xs text-slate-400">(opcional, {description.length}/280)</span>
        </label>
        <textarea
          className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 resize-none"
          rows={3}
          placeholder="Descripción opcional del token..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={280}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Certificación Energía Limpia (Pretendida)
          {isTransform && <span className="ml-2 text-xs text-slate-400">(del token padre)</span>}
        </label>
        <select
          className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 appearance-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
          value={certification}
          onChange={(e) => setCertification(e.target.value)}
          disabled={isTransform}
          required
        >
          <option value="">— Selecciona —</option>
          {CERTIFICATION_GROUPS.map((group) => (
            <optgroup key={group} label={group}>
              {CERTIFICATIONS.filter((c) => c.group === group).map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    </div>
  );
}

export function featuresJsonToString(data: FeaturesJsonData): string {
  return JSON.stringify({
    source: data.source,
    unit: data.unit,
    name: data.name,
    description: data.description,
    certification: data.certification,
  }, null, 2);
}

export function parseFeaturesJson(str: string): FeaturesJsonData | null {
  try {
    const parsed = JSON.parse(str);
    if (
      typeof parsed.source === "string" &&
      typeof parsed.unit === "string" &&
      typeof parsed.name === "string"
    ) {
      return {
        source: parsed.source,
        unit: parsed.unit,
        name: parsed.name,
        description: parsed.description ?? "",
        certification: parsed.certification ?? "",
      };
    }
  } catch {}
  return null;
}
