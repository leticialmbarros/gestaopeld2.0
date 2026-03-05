import React, { useState, useEffect } from 'react';
import { Target, AlertTriangle, CheckCircle2, Clock, Loader2 } from 'lucide-react';

export default function MetasTracker() {
  const [loading, setLoading] = useState(true);
  const [metas, setMetas] = useState<any[]>([]);

  useEffect(() => {
    const fetchMetas = async () => {
      try {
        const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycby9PQee6TJMFKI98XJ1rVO2qGQ-vTGUzvx7zAkQxEN9Fob2pjpK4T6KcJSAxHZDO-cChw/exec';
        
        const response = await fetch(scriptUrl);
        const result = await response.json();

        if (result.success && result.allData && result.allData['METAS']) {
          const fetchedMetas = result.allData['METAS'].map((row: any, index: number) => ({
            id: index,
            nome: row['Meta/Etapa'] || row['Nome'] || `Meta ${index + 1}`,
            status: row['Status'] || row['status'] || 'Em Andamento',
            progresso: parseFloat(row['Progresso'] || row['progresso'] || 0),
            grupo: row['Grupo'] || row['grupo'] || 'Geral'
          }));
          setMetas(fetchedMetas);
        } else {
          // Fallback if no METAS tab
          setMetas([]);
        }
      } catch (error) {
        console.error('Error fetching metas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetas();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Concluída': return <CheckCircle2 size={18} className="text-emerald-500" />;
      case 'Atrasada': return <AlertTriangle size={18} className="text-red-500" />;
      default: return <Clock size={18} className="text-amber-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Concluída': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Atrasada': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
        <p className="text-slate-500 font-medium">Carregando metas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Target size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Acompanhamento de Metas</h2>
        </div>
        <p className="text-sm text-slate-500 ml-12">Mapa de calor e progresso das 28 metas do projeto</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-sm font-semibold text-slate-600">Meta / Etapa</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Grupo</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Progresso</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metas.map((meta) => (
                <tr key={meta.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-slate-800">{meta.nome}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{meta.grupo}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-full max-w-[150px] bg-slate-100 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${meta.status === 'Atrasada' ? 'bg-red-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${meta.progresso}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-slate-500">{meta.progresso}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(meta.status)}`}>
                      {getStatusIcon(meta.status)}
                      {meta.status}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
