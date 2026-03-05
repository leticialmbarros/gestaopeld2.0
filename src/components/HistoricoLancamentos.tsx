import React, { useState, useEffect } from 'react';
import { History, Loader2, Search, Filter, Download, Receipt, Calculator, FileText, Eye, X, Trash2 } from 'lucide-react';
import { saveToGoogleSheets } from '../sheetsService';

export default function HistoricoLancamentos() {
  const [loading, setLoading] = useState(true);
  const [lancamentos, setLancamentos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterMembro, setFilterMembro] = useState('');
  const [filterGrupo, setFilterGrupo] = useState('');
  const [filterRubrica, setFilterRubrica] = useState('');
  const [filterDataInicio, setFilterDataInicio] = useState('');
  const [filterDataFim, setFilterDataFim] = useState('');
  const [selectedLancamento, setSelectedLancamento] = useState<any | null>(null);

  const fetchHistorico = async () => {
    setLoading(true);
    try {
      const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycby9PQee6TJMFKI98XJ1rVO2qGQ-vTGUzvx7zAkQxEN9Fob2pjpK4T6KcJSAxHZDO-cChw/exec';
      
      const response = await fetch(scriptUrl);
      const result = await response.json();

      if (result.success && result.data) {
        const formatDate = (dateString: string) => {
          if (!dateString || dateString === '-') return '-';
          try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return dateString;
            // Format as DD/MM/YYYY
            const day = String(d.getUTCDate()).padStart(2, '0');
            const month = String(d.getUTCMonth() + 1).padStart(2, '0');
            const year = d.getUTCFullYear();
            return `${day}/${month}/${year}`;
          } catch (e) {
            return dateString;
          }
        };

        const fetchedLancamentos = result.data.map((row: any, index: number) => ({
          id: index,
          data: formatDate(row['Data da despesa'] || row['dataDespesa'] || '-'),
          tipo: row['Tipo de Lançamento (Custeio/Bolsa)'] || row['Tipo de Lançamento'] || row['tipoLancamento'] || '-',
          membro: row['Membro'] || row['membroFinal'] || row['membro'] || '-',
          grupo: row['Grupo'] || row['grupo'] || '-',
          rubrica: row['Rubrica'] || row['rubrica'] || '-',
          valor: parseFloat(
            row['Valor da Compra (R$)'] || 
            row['Valor Total (R$) - Diárias'] || 
            row['valorCompra'] || 
            row['Valor'] || 
            row['valor'] || 
            0
          ),
          comprovante: row['Comprovante entregue?'] || row['comprovanteEntregue'] || '-',
          originalData: row
        }));
        
        // Sort by date descending (assuming format YYYY-MM-DD or DD/MM/YYYY, simple reverse for now)
        fetchedLancamentos.reverse();
        setLancamentos(fetchedLancamentos);
      }
    } catch (error) {
      console.error('Error fetching historico:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorico();
  }, []);

  const formatCurrency = (value: number) => {
    if (isNaN(value)) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const parseDate = (dateStr: string) => {
    if (!dateStr || dateStr === '-') return null;
    // Check if it's DD/MM/YYYY or DD-MM-YYYY
    if (dateStr.includes('/') || (dateStr.includes('-') && dateStr.split('-')[0].length === 2)) {
      const parts = dateStr.includes('/') ? dateStr.split('/') : dateStr.split('-');
      return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
    // Check if it's YYYY-MM-DD
    if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
      const parts = dateStr.split('-');
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const uniqueTipos = Array.from(new Set(lancamentos.map(l => l.tipo))).filter(Boolean);
  const uniqueMembros = Array.from(new Set(lancamentos.map(l => l.membro))).filter(Boolean);
  const uniqueGrupos = Array.from(new Set(lancamentos.map(l => l.grupo))).filter(Boolean);
  const uniqueRubricas = Array.from(new Set(lancamentos.map(l => l.rubrica))).filter(Boolean);

  const filteredLancamentos = lancamentos.filter(l => {
    const matchesSearch = Object.values(l).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesTipo = filterTipo ? l.tipo === filterTipo : true;
    const matchesMembro = filterMembro ? l.membro === filterMembro : true;
    const matchesGrupo = filterGrupo ? l.grupo === filterGrupo : true;
    const matchesRubrica = filterRubrica ? l.rubrica === filterRubrica : true;
    
    let matchesData = true;
    const dateValue = parseDate(l.data);
    
    if (filterDataInicio && dateValue) {
      const start = new Date(filterDataInicio);
      start.setHours(0, 0, 0, 0);
      if (dateValue < start) matchesData = false;
    }
    if (filterDataFim && dateValue) {
      const end = new Date(filterDataFim);
      end.setHours(23, 59, 59, 999);
      if (dateValue > end) matchesData = false;
    }
    if ((filterDataInicio || filterDataFim) && !dateValue) {
      matchesData = false;
    }
    
    return matchesSearch && matchesTipo && matchesMembro && matchesGrupo && matchesRubrica && matchesData;
  });

  const totalFiltrado = filteredLancamentos.reduce((acc, curr) => acc + (curr.valor || 0), 0);
  const qtdFiltrada = filteredLancamentos.length;
  const pendentesFiltrado = filteredLancamentos.filter(l => l.comprovante === 'Não' || l.comprovante === 'Pendente').length;

  const exportToCSV = () => {
    const headers = ['Data', 'Tipo', 'Membro', 'Grupo', 'Rubrica', 'Valor', 'Comprovante'];
    const csvContent = [
      headers.join(','),
      ...filteredLancamentos.map(l => [
        l.data,
        l.tipo,
        `"${l.membro}"`,
        `"${l.grupo}"`,
        `"${l.rubrica}"`,
        l.valor,
        l.comprovante
      ].join(','))
    ].join('\n');
    
    // Use UTF-8 BOM for Excel compatibility
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `historico_peld_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (lancamento: any) => {
    if (!lancamento.originalData?.rowNumber) {
      alert('Não foi possível identificar a linha deste registro na planilha.');
      return;
    }
    
    if (window.confirm(`Tem certeza que deseja excluir o lançamento de ${formatCurrency(lancamento.valor)}? Esta ação não pode ser desfeita.`)) {
      setLoading(true);
      try {
        const result = await saveToGoogleSheets({
          action: 'delete',
          rowNumber: lancamento.originalData.rowNumber
        });
        
        if (result.success) {
          await fetchHistorico();
        } else {
          alert('Erro ao excluir: ' + result.error);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error deleting:', error);
        alert('Erro ao excluir o lançamento.');
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
        <p className="text-slate-500 font-medium">Carregando histórico de lançamentos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <History size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Histórico de Lançamentos</h2>
            <p className="text-sm text-slate-500 mt-1">Registro de todas as despesas e bolsas lançadas no sistema</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row flex-wrap gap-3 w-full xl:w-auto items-center">
          <div className="relative w-full md:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-sm text-slate-500">De:</span>
            <input
              type="date"
              value={filterDataInicio}
              onChange={(e) => setFilterDataInicio(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white text-slate-700"
            />
            <span className="text-sm text-slate-500">Até:</span>
            <input
              type="date"
              value={filterDataFim}
              onChange={(e) => setFilterDataFim(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white text-slate-700"
            />
          </div>

          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="w-full md:w-auto px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white text-slate-700"
          >
            <option value="">Tipo</option>
            {uniqueTipos.map(tipo => (
              <option key={tipo as string} value={tipo as string}>{tipo as string}</option>
            ))}
          </select>

          <select
            value={filterMembro}
            onChange={(e) => setFilterMembro(e.target.value)}
            className="w-full md:w-auto px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white text-slate-700 max-w-[150px] truncate"
          >
            <option value="">Membro</option>
            {uniqueMembros.map(membro => (
              <option key={membro as string} value={membro as string}>{membro as string}</option>
            ))}
          </select>

          <select
            value={filterGrupo}
            onChange={(e) => setFilterGrupo(e.target.value)}
            className="w-full md:w-auto px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white text-slate-700 max-w-[150px] truncate"
          >
            <option value="">Grupo</option>
            {uniqueGrupos.map(grupo => (
              <option key={grupo as string} value={grupo as string}>{grupo as string}</option>
            ))}
          </select>

          <select
            value={filterRubrica}
            onChange={(e) => setFilterRubrica(e.target.value)}
            className="w-full md:w-auto px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white text-slate-700 max-w-[150px] truncate"
          >
            <option value="">Rubrica</option>
            {uniqueRubricas.map(rubrica => (
              <option key={rubrica as string} value={rubrica as string}>{rubrica as string}</option>
            ))}
          </select>
          
          <button 
            onClick={fetchHistorico}
            className="w-full md:w-auto px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Loader2 size={16} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
          <button 
            onClick={exportToCSV}
            className="w-full md:w-auto px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
            title="Exportar para Excel (CSV)"
          >
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Calculator size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Filtrado</p>
            <p className="text-lg font-bold text-slate-800">{formatCurrency(totalFiltrado)}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Lançamentos</p>
            <p className="text-lg font-bold text-slate-800">{qtdFiltrada} <span className="text-sm font-normal text-slate-500">registros</span></p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <Receipt size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Pendentes de NF</p>
            <p className={`text-lg font-bold ${pendentesFiltrado > 0 ? 'text-orange-600' : 'text-slate-800'}`}>
              {pendentesFiltrado} <span className="text-sm font-normal text-slate-500">despesas</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-sm font-semibold text-slate-600">Data</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Tipo</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Membro</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Grupo</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Rubrica</th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-right">Valor</th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-center">Comprovante</th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLancamentos.map((lancamento) => (
                <tr key={lancamento.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm text-slate-600 whitespace-nowrap">{lancamento.data}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      lancamento.tipo === 'Custeio' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {lancamento.tipo}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-800">{lancamento.membro}</td>
                  <td className="p-4 text-sm text-slate-600">{lancamento.grupo}</td>
                  <td className="p-4 text-sm text-slate-600">{lancamento.rubrica}</td>
                  <td className="p-4 text-sm font-bold text-slate-700 text-right whitespace-nowrap">
                    {formatCurrency(lancamento.valor)}
                  </td>
                  <td className="p-4 text-center">
                    {lancamento.comprovante === 'Sim' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Entregue</span>
                    ) : lancamento.comprovante === 'Não' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">Pendente</span>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedLancamento(lancamento)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Ver Detalhes"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(lancamento)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir Lançamento"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLancamentos.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Nenhum lançamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedLancamento && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Detalhes do Lançamento</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedLancamento.tipo} • {selectedLancamento.data}
                </p>
              </div>
              <button 
                onClick={() => setSelectedLancamento(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {selectedLancamento.originalData && Object.entries(selectedLancamento.originalData).map(([key, value]) => {
                  // Skip empty values or internal timestamp if not needed
                  if (!value || value === '') return null;
                  
                  // Format specific fields
                  let displayValue = String(value);
                  if (key.toLowerCase().includes('valor') && !isNaN(Number(value))) {
                    displayValue = formatCurrency(Number(value));
                  } else if (key.toLowerCase().includes('data') && String(value).includes('T')) {
                    // Try to format date
                    try {
                      const d = new Date(String(value));
                      if (!isNaN(d.getTime())) {
                        displayValue = `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
                      }
                    } catch (e) {}
                  }

                  // Handle Links
                  const isLink = displayValue.startsWith('http');

                  return (
                    <div key={key} className="border-b border-slate-50 pb-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{key}</p>
                      {isLink ? (
                        <a href={displayValue} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline break-all">
                          {displayValue}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-slate-800">{displayValue}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end">
              <button 
                onClick={() => setSelectedLancamento(null)}
                className="px-6 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
