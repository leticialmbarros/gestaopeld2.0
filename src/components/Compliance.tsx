import React from 'react';
import { ShieldAlert, AlertOctagon, AlertTriangle, CheckSquare } from 'lucide-react';

export default function Compliance() {
  const alertasCriticos = [
    { id: 1, data: '12/04/2024', membro: 'João Silva', descricao: 'Pagamento de coquetel para evento', regra: 'Eventos (Nível 3)', status: 'Bloqueado' },
    { id: 2, data: '05/04/2024', membro: 'Maria Souza', descricao: 'Conta de luz do laboratório', regra: 'Infraestrutura (Nível 3)', status: 'Bloqueado' }
  ];

  const alertasJustificativa = [
    { id: 3, data: '10/04/2024', membro: 'Carlos Mendes', descricao: 'Envio de amostras por Sedex', regra: 'Logística (Nível 2)', observacao: 'Envio de amostras de solo para análise no laboratório parceiro.' },
    { id: 4, data: '08/04/2024', membro: 'Ana Costa', descricao: 'Pequenos reparos na sala', regra: 'Obras (Nível 2)', observacao: 'Pendente de justificativa' }
  ];

  const pendenciasCarlosChagas = 5;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="p-3 bg-red-50 text-red-600 rounded-xl">
          <ShieldAlert size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Painel de Compliance e Regras</h2>
          <p className="text-sm text-slate-500 mt-1">Auditoria interna e aderência às regras do edital CNPq</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertas Críticos (Nível 3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <AlertOctagon size={20} className="text-red-500" />
              Tentativas de Lançamentos Vedados (Nível 3)
            </h3>
            <div className="space-y-4">
              {alertasCriticos.map(alerta => (
                <div key={alerta.id} className="p-4 bg-red-50 rounded-xl border border-red-100 flex justify-between items-start">
                  <div>
                    <p className="font-medium text-red-900">{alerta.descricao}</p>
                    <p className="text-sm text-red-700 mt-1">Membro: {alerta.membro} | Data: {alerta.data}</p>
                    <span className="inline-block mt-2 text-xs font-bold px-2 py-1 bg-red-200 text-red-800 rounded">Regra violada: {alerta.regra}</span>
                  </div>
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider bg-white px-2 py-1 rounded-md border border-red-200">{alerta.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monitor de Justificativas (Nível 2) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-500" />
              Monitor de Justificativas (Nível 2)
            </h3>
            <div className="space-y-4">
              {alertasJustificativa.map(alerta => (
                <div key={alerta.id} className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-amber-900">{alerta.descricao}</p>
                    <span className="text-xs font-bold px-2 py-1 bg-amber-200 text-amber-800 rounded">{alerta.regra}</span>
                  </div>
                  <p className="text-sm text-amber-700 mb-2">Membro: {alerta.membro} | Data: {alerta.data}</p>
                  <div className={`p-3 rounded-lg text-sm ${alerta.observacao === 'Pendente de justificativa' ? 'bg-red-100 text-red-800 border border-red-200 font-medium' : 'bg-white text-slate-600 border border-amber-200'}`}>
                    <strong>Observação:</strong> {alerta.observacao}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status Carlos Chagas */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
            <div className="w-16 h-16 mx-auto bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
              <CheckSquare size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Status Carlos Chagas</h3>
            <p className="text-sm text-slate-500 mb-4">Despesas pendentes de lançamento no sistema oficial do CNPq</p>
            <div className="text-4xl font-bold text-indigo-600 mb-2">{pendenciasCarlosChagas}</div>
            <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider">Lançamentos Pendentes</p>
            <button className="mt-6 w-full py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors">
              Ver Lista Completa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
