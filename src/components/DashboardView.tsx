import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Cell as PieCell
} from 'recharts';
import { PROJETO_INFO } from '../constants';
import { Wallet, TrendingUp, Target, Calendar, AlertCircle, Loader2, CheckCircle2, XCircle, Package, MapPin, FileWarning, AlertTriangle, Download } from 'lucide-react';
import { UserRole } from '../App';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';

const COLORS = ['#059669', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const METAS_COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Concluídas, Em Andamento, Atrasadas

interface DashboardProps {
  role: UserRole;
}

export default function DashboardView({ role }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>(role === 'Pesquisador' ? 'Vertebrados' : 'Geral');

  useEffect(() => {
    if (role === 'Pesquisador' && selectedGroup === 'Geral') {
      setSelectedGroup('Vertebrados');
    }
  }, [role, selectedGroup]);
  
  const [gastos, setGastos] = useState({
    total: 0,
    porGrupo: {
      'Vertebrados': 0,
      'Artrópodes': 0,
      'Plantas': 0,
      'DNA Ambiental': 0
    },
    porMes: [] as any[],
    recentes: [] as any[],
    metasStats: [
      { name: 'Concluídas', value: 0 },
      { name: 'Em Andamento', value: 0 },
      { name: 'Atrasadas', value: 0 }
    ],
    metasPorGrupo: {} as Record<string, any[]>,
    gastosPorRubricaGrupo: {} as Record<string, Record<string, number>>,
    logisticaGrupo: {} as Record<string, {
      emTransito: any[],
      pendentesComprovante: any[],
      estoque: Record<string, number>
    }>
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycby9PQee6TJMFKI98XJ1rVO2qGQ-vTGUzvx7zAkQxEN9Fob2pjpK4T6KcJSAxHZDO-cChw/exec';
      
      const response = await fetch(scriptUrl);
      const result = await response.json();

      if (result.success && result.data) {
        // Check if data is empty (only headers or completely empty)
        if (result.data.length === 0) {
          console.log("Planilha vazia.");
          setGastos({
            total: 0,
            porGrupo: {
              'Vertebrados': 0,
              'Artrópodes': 0,
              'Plantas': 0,
              'DNA Ambiental': 0
            },
            porMes: [],
            recentes: [],
            metasStats: [
              { name: 'Concluídas', value: 0 },
              { name: 'Em Andamento', value: 0 },
              { name: 'Atrasadas', value: 0 }
            ],
            metasPorGrupo: {},
            gastosPorRubricaGrupo: {},
            logisticaGrupo: {}
          });
          setLoading(false);
          return;
        }

        let total = 0;
        const porGrupo = { 'Vertebrados': 0, 'Artrópodes': 0, 'Plantas': 0, 'DNA Ambiental': 0 };
        const mesMap: Record<string, number> = {};
        const recentes: any[] = [];
        
        const gastosPorRubricaGrupo: Record<string, Record<string, number>> = {
          'Vertebrados': {}, 'Artrópodes': {}, 'Plantas': {}, 'DNA Ambiental': {}
        };
        
        const logisticaGrupo: Record<string, { emTransito: any[], pendentesComprovante: any[], estoque: Record<string, number> }> = {
          'Vertebrados': { emTransito: [], pendentesComprovante: [], estoque: {} },
          'Artrópodes': { emTransito: [], pendentesComprovante: [], estoque: {} },
          'Plantas': { emTransito: [], pendentesComprovante: [], estoque: {} },
          'DNA Ambiental': { emTransito: [], pendentesComprovante: [], estoque: {} }
        };

        result.data.forEach((row: any) => {
          const valor = parseFloat(
            row['Valor da Compra (R$)'] || 
            row['Valor Total (R$) - Diárias'] || 
            row['valorCompra'] || 
            row['Valor'] || 
            row['valor'] || 
            0
          );
          const grupo = row['Grupo'] || row['grupo'];
          const mes = row['Mês'] || row['mes'];
          const data = row['Data da despesa'] || row['dataDespesa'];
          const descricao = row['Descrição do Item'] || row['descricaoItem'];
          const comprovante = row['Comprovante entregue?'] || row['comprovanteEntregue'];
          const rubrica = row['Rubrica'] || row['rubrica'];
          const situacaoEntrega = row['Situação da Entrega'] || row['situacaoEntrega'];
          const localizacao = row['Compra estocada em'] || row['compraEstocadaEm'] || row['Localização'] || row['localizacao'];

          if (!isNaN(valor) && valor > 0) {
            total += valor;
            
            if (grupo && porGrupo[grupo as keyof typeof porGrupo] !== undefined) {
              porGrupo[grupo as keyof typeof porGrupo] += valor;
              
              if (rubrica) {
                gastosPorRubricaGrupo[grupo][rubrica] = (gastosPorRubricaGrupo[grupo][rubrica] || 0) + valor;
              }
            }

            if (mes) {
              mesMap[mes] = (mesMap[mes] || 0) + valor;
            }

            recentes.push({
              data,
              descricao,
              valor,
              grupo,
              comprovante
            });
          }
          
          if (grupo && logisticaGrupo[grupo]) {
             if (situacaoEntrega === 'Em trânsito') {
               logisticaGrupo[grupo].emTransito.push({ descricao, data });
             }
             if (comprovante === 'Não' || comprovante === 'NÃO') {
               logisticaGrupo[grupo].pendentesComprovante.push({ descricao, valor, data });
             }
             if (localizacao && (situacaoEntrega === 'Entregue' || !situacaoEntrega)) {
               logisticaGrupo[grupo].estoque[localizacao] = (logisticaGrupo[grupo].estoque[localizacao] || 0) + 1;
             }
          }
        });

        recentes.reverse();
        const porMes = Object.keys(mesMap).map(m => ({ mes: m, Gasto: mesMap[m] }));

        let metasConcluidas = 0;
        let metasEmAndamento = 0;
        let metasAtrasadas = 0;
        const metasPorGrupo: Record<string, any[]> = {
          'Vertebrados': [], 'Artrópodes': [], 'Plantas': [], 'DNA Ambiental': []
        };

        if (result.allData && result.allData['METAS'] && result.allData['METAS'].length > 0) {
          result.allData['METAS'].forEach((meta: any) => {
            const status = meta['Status'] || meta['status'] || 'Em Andamento';
            const grupo = meta['Grupo'] || meta['grupo'];
            const nome = meta['Meta/Etapa'] || meta['Nome'] || meta['nome'];
            const progresso = parseFloat(meta['Progresso'] || meta['progresso'] || 0);
            
            if (status === 'Concluída') metasConcluidas++;
            else if (status === 'Atrasada') metasAtrasadas++;
            else if (status === 'Em Andamento') metasEmAndamento++;
            
            if (grupo && metasPorGrupo[grupo]) {
              metasPorGrupo[grupo].push({ nome, status, progresso });
            }
          });
        }

        setGastos({
          total,
          porGrupo,
          porMes,
          recentes: recentes.slice(0, 10),
          metasStats: [
            { name: 'Concluídas', value: metasConcluidas },
            { name: 'Em Andamento', value: metasEmAndamento },
            { name: 'Atrasadas', value: metasAtrasadas }
          ],
          metasPorGrupo,
          gastosPorRubricaGrupo,
          logisticaGrupo
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const calculateProgress = (spent: number, total: number) => {
    return Math.min(Math.round((spent / total) * 100), 100);
  };

  const exportToPDF = async () => {
    if (!dashboardRef.current) return;
    setIsExporting(true);
    try {
      // Use html-to-image instead of html2canvas to support modern CSS like oklch
      const imgData = await htmlToImage.toPng(dashboardRef.current, {
        quality: 1,
        backgroundColor: '#f8fafc',
        pixelRatio: 2 // For higher resolution
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      // We need to calculate the height based on the image aspect ratio
      // Since we don't have the canvas directly, we can create an image element to get dimensions
      const img = new Image();
      img.src = imgData;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      const pdfHeight = (img.height * pdfWidth) / img.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Relatorio_PELD_${selectedGroup}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Ocorreu um erro ao gerar o PDF. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
        <p className="text-slate-500 font-medium">Carregando inteligência de dados...</p>
      </div>
    );
  }

  const saldoDisponivel = PROJETO_INFO.custeioCNPqLiberado - gastos.total;
  const execucaoCusteio = calculateProgress(gastos.total, PROJETO_INFO.custeioCNPqLiberado);

  const metasData = gastos.metasStats;

  const grupoChartData = Object.keys(gastos.porGrupo).map(g => ({
    name: g,
    Teto: 75000,
    Executado: gastos.porGrupo[g as keyof typeof gastos.porGrupo]
  }));

  const isCoordenadorGeral = role === 'Administrador' || role === 'Coordenador';

  // Dados específicos do grupo selecionado
  const tetoGrupo = 75000;
  const gastoGrupo = gastos.porGrupo[selectedGroup as keyof typeof gastos.porGrupo] || 0;
  const saldoGrupo = tetoGrupo - gastoGrupo;
  const progressoGrupo = calculateProgress(gastoGrupo, tetoGrupo);
  
  const rubricasGrupoData = Object.entries(gastos.gastosPorRubricaGrupo[selectedGroup as keyof typeof gastos.gastosPorRubricaGrupo] || {}).map(([name, value]) => ({
    name, value
  })).filter(item => item.value > 0);

  const metasDoGrupo = gastos.metasPorGrupo[selectedGroup as keyof typeof gastos.metasPorGrupo] || [];
  const logisticaDoGrupo = gastos.logisticaGrupo[selectedGroup as keyof typeof gastos.logisticaGrupo] || { emTransito: [], pendentesComprovante: [], estoque: {} };

  return (
    <div className="space-y-6 animate-in fade-in duration-500" ref={dashboardRef}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {selectedGroup === 'Geral' ? 'Visão Geral do Projeto' : `Painel do Grupo: ${selectedGroup}`}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {selectedGroup === 'Geral' ? 'Acompanhamento financeiro e estratégico global' : 'Acompanhamento operacional e financeiro do grupo'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={exportToPDF}
            disabled={isExporting}
            className="px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {isExporting ? 'Gerando PDF...' : 'Exportar PDF'}
          </button>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
          >
            Atualizar Dados
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">
              {isCoordenadorGeral ? 'Visão:' : 'Grupo:'}
            </span>
            <select 
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="p-2 border border-slate-200 rounded-lg bg-white text-sm focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-700"
            >
              {isCoordenadorGeral && <option value="Geral">Visão Geral</option>}
              <option value="Vertebrados">Vertebrados</option>
              <option value="Artrópodes">Artrópodes</option>
              <option value="Plantas">Plantas</option>
              <option value="DNA Ambiental">DNA Ambiental</option>
            </select>
          </div>
        </div>
      </div>

      {selectedGroup === 'Geral' ? (
        <>
          {/* KPIs Coordenador Geral */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Wallet size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Saldo Disponível</p>
                <p className="text-xl font-bold text-slate-800">{formatCurrency(saldoDisponivel)}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Executado</p>
                <p className="text-xl font-bold text-slate-800">{formatCurrency(gastos.total)}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Target size={24} />
              </div>
              <div className="w-full">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm text-slate-500 font-medium">% Execução</p>
                  <span className="text-xs font-bold text-indigo-700">{execucaoCusteio}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${execucaoCusteio}%` }}></div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Tempo de Projeto</p>
                <p className="text-xl font-bold text-slate-800">Mês 4 <span className="text-sm font-normal text-slate-500">de 48</span></p>
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Execução por Grupo */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Benchmark: Execução por Grupo</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={grupoChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(value) => `R$${value/1000}k`} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <RechartsTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: '#f8fafc'}} />
                    <Legend iconType="circle" />
                    <Bar dataKey="Teto" name="Teto Orçamentário" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="Executado" name="Valor Executado" fill="#064e3b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status de Metas */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Status Global das Metas</h3>
              <p className="text-sm text-slate-500 mb-6">Visão geral das metas do projeto</p>
              <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metasData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {metasData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={METAS_COLORS[index % METAS_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                  <span className="text-3xl font-bold text-slate-800">
                    {metasData.reduce((acc, curr) => acc + curr.value, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Fluxo de Caixa */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Fluxo de Caixa (Evolução Mensal)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={gastos.porMes} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="mes" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(value) => `R$${value/1000}k`} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="Gasto" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        /* Visão Coordenador de Grupo */
        <div className="space-y-6">
          
          {/* Velocímetro de Orçamento e Distribuição */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Velocímetro */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center relative">
              
              {/* Alerta de Teto Orçamentário */}
              {progressoGrupo >= 90 && (
                <div className="absolute top-0 left-0 right-0 bg-red-50 border-b border-red-100 p-3 rounded-t-2xl flex items-start gap-2 z-10">
                  <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <h4 className="text-red-800 font-bold text-xs uppercase tracking-wider">Atenção: Limite Orçamentário Próximo!</h4>
                    <p className="text-red-600 text-xs mt-0.5">
                      Restam apenas {formatCurrency(saldoGrupo)} disponíveis para este grupo.
                    </p>
                  </div>
                </div>
              )}

              <div className={`flex justify-between items-center mb-6 ${progressoGrupo >= 90 ? 'mt-12' : ''}`}>
                <h3 className="text-lg font-semibold text-slate-800">Orçamento do Grupo</h3>
                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  Teto: {formatCurrency(tetoGrupo)}
                </span>
              </div>
              
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle 
                      cx="50" cy="50" r="40" 
                      fill="transparent" 
                      stroke="#e2e8f0" 
                      strokeWidth="12" 
                      strokeDasharray="188.5 251.2" 
                      strokeDashoffset="-31.4" 
                      strokeLinecap="round" 
                      transform="rotate(135 50 50)"
                    />
                    {/* Progress circle */}
                    <circle 
                      cx="50" cy="50" r="40" 
                      fill="transparent" 
                      stroke={progressoGrupo > 80 ? '#ef4444' : '#059669'} 
                      strokeWidth="12" 
                      strokeDasharray={`${(progressoGrupo / 100) * 188.5} 251.2`} 
                      strokeDashoffset="-31.4" 
                      strokeLinecap="round" 
                      transform="rotate(135 50 50)"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center mt-4">
                    <span className="text-3xl font-bold text-slate-800">{progressoGrupo}%</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Consumido</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center border-t border-slate-100 pt-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Gasto Efetivado</p>
                  <p className="text-lg font-bold text-slate-800">{formatCurrency(gastoGrupo)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Saldo Real</p>
                  <p className={`text-lg font-bold ${saldoGrupo < 10000 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {formatCurrency(saldoGrupo)}
                  </p>
                </div>
              </div>
            </div>

            {/* Distribuição por Subcategoria */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Onde estamos gastando?</h3>
              <p className="text-sm text-slate-500 mb-4">Distribuição dos gastos por rubrica</p>
              
              {rubricasGrupoData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={rubricasGrupoData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {rubricasGrupoData.map((entry, index) => (
                          <PieCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                  Nenhum gasto registrado para este grupo.
                </div>
              )}
            </div>
          </div>

          {/* Monitor de Metas e Funil de Compras */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Monitor de Metas */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Target size={20} className="text-indigo-500" />
                Monitor de Metas e Prazos
              </h3>
              
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {metasDoGrupo.length > 0 ? (
                  metasDoGrupo.map((meta, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-slate-800 text-sm">{meta.nome}</h4>
                        {meta.status === 'Atrasada' && (
                          <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
                        )}
                        {meta.status === 'Concluída' && (
                          <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${meta.status === 'Atrasada' ? 'bg-red-500' : meta.status === 'Concluída' ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                            style={{ width: `${meta.progresso}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-slate-600 w-8 text-right">{meta.progresso}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-8">Nenhuma meta vinculada a este grupo.</p>
                )}
              </div>
            </div>

            {/* Funil de Compras e Entregas */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Package size={20} className="text-orange-500" />
                Logística e Pendências
              </h3>
              
              <div className="space-y-6 flex-1">
                {/* Em Trânsito */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Pedidos em Trânsito ({logisticaDoGrupo.emTransito.length})
                  </h4>
                  {logisticaDoGrupo.emTransito.length > 0 ? (
                    <ul className="space-y-2">
                      {logisticaDoGrupo.emTransito.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="text-sm text-slate-600 bg-blue-50/50 px-3 py-2 rounded-lg border border-blue-100 truncate">
                          {item.descricao} <span className="text-xs text-slate-400 ml-2">({item.data})</span>
                        </li>
                      ))}
                      {logisticaDoGrupo.emTransito.length > 3 && (
                        <li className="text-xs text-blue-600 font-medium pl-3">+ {logisticaDoGrupo.emTransito.length - 3} outros itens</li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Nenhum pedido em trânsito.</p>
                  )}
                </div>

                {/* Pendência de Comprovante */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    Pendência de Comprovante ({logisticaDoGrupo.pendentesComprovante.length})
                  </h4>
                  {logisticaDoGrupo.pendentesComprovante.length > 0 ? (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                      <ul className="space-y-2">
                        {logisticaDoGrupo.pendentesComprovante.slice(0, 3).map((item, idx) => (
                          <li key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-red-800 truncate pr-2">{item.descricao}</span>
                            <span className="font-medium text-red-600 whitespace-nowrap">{formatCurrency(item.valor)}</span>
                          </li>
                        ))}
                      </ul>
                      {logisticaDoGrupo.pendentesComprovante.length > 3 && (
                        <p className="text-xs text-red-500 font-medium mt-2 pt-2 border-t border-red-200">
                          + {logisticaDoGrupo.pendentesComprovante.length - 3} despesas sem comprovante
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Todos os comprovantes entregues! 🎉</p>
                  )}
                </div>

                {/* Localização */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    Localização dos Materiais
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(logisticaDoGrupo.estoque).length > 0 ? (
                      Object.entries(logisticaDoGrupo.estoque).map(([loc, count], idx) => (
                        <div key={idx} className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg text-sm border border-slate-200">
                          <MapPin size={14} className="text-emerald-600" />
                          <span className="text-slate-700 font-medium">{loc}</span>
                          <span className="bg-white text-slate-500 text-xs px-1.5 py-0.5 rounded-md ml-1">{count}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 italic">Nenhum local registrado.</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
