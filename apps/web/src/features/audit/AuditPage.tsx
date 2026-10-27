import React, { useEffect, useState } from 'react';
import { ShieldAlert, RotateCw, Clock, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../core/http/apiClient';
import { Badge } from '../../core/ui/Badge';

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<any[]>('/audit');
      setLogs(response.data);
    } catch (err) {
      console.error('Error al cargar bitácora de auditoría:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
            SEGURIDAD INSTITUCIONAL • BITÁCORA Y TRAZABILIDAD
          </div>
          <h1 className="text-2xl font-bold font-display text-[#0f172a] mt-0.5">
            Auditoría y Registro de Eventos Académicos
          </h1>
          <p className="text-xs text-[#64748b] mt-1">
            Registro inmutable generado automáticamente por el Observer Pattern
            ante inscripciones, notas y cierre de actas.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="h-9 px-3 bg-white border border-[#cbd5e1] rounded-md text-xs font-semibold text-[#0f172a] hover:bg-[#f8fafc] flex items-center gap-1.5 cursor-pointer shadow-academic-sm"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Actualizar</span>
        </button>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-academic-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-[#f8fafc] border-b border-[#cbd5e1] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#1e3a8a]" />
            <span className="font-bold text-xs text-[#0f172a] font-display">
              Eventos Registrados en Tiempo Real:
            </span>
          </div>
          <span className="text-xs text-[#64748b] tabular-nums font-mono">
            Total eventos: {logs.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="h-10 bg-[#f8fafc] border-b border-[#e2e8f0] text-[#475569] font-bold text-[11px] uppercase tracking-wider">
                <th className="px-4 py-2">Fecha / Hora</th>
                <th className="px-4 py-2">Acción de Dominio</th>
                <th className="px-4 py-2">Tipo de Entidad</th>
                <th className="px-4 py-2">ID Entidad</th>
                <th className="px-4 py-2">Detalles / Carga Útil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#64748b]">
                    Cargando bitácora de auditoría...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#64748b]">
                    Aún no se han disparado eventos de dominio en esta sesión.
                    Inscribe un estudiante o califica un alumno para ver el Observer en acción.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs text-[#64748b] tabular-nums whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('es-BO')}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 bg-[#131b2e] text-white font-mono text-[10px] font-bold rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-[#0f172a]">
                      {log.entityType}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-[#64748b]">
                      {log.entityId}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-[#334155] font-mono max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
