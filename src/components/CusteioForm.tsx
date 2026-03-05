import React, { useState, useEffect } from 'react';
import {
  MEMBROS,
  GRUPOS,
  SUBGRUPOS,
  RUBRICAS_CUSTEIO,
  SUBCATEGORIAS_CUSTEIO,
  FORMAS_PAGAMENTO,
  METAS
} from '../constants';
import { evaluateRules } from '../rulesEngine';
import { saveToGoogleSheets } from '../sheetsService';

export default function CusteioForm({ onBack }: { onBack: () => void }) {
  const [formData, setFormData] = useState<any>({
    tipoLancamento: 'Custeio',
    dataDespesa: '',
    mes: '',
    membro: '',
    membroOutro: '',
    grupo: '',
    subgrupo: '',
    rubrica: '',
    subcategoria: '',
    subcategoriaOutro: '',
    fonteVerba: '',
    metaEtapa: '',
    descricaoItem: '',
    valorCompra: '',
    formaPagamento: '',
    dataSolicitacaoCompra: '',
    quantidade: '',
    valorOrcado: '',
    dataCompra: '',
    favorecido: '',
    docFavorecido: '',
    localizacao: '',
    comprovanteEntregue: '',
    numNfRecibo: '',
    linkComprovante: '',
    despesaIndenizavel: '',
    statusGeralDespesa: '',
    situacaoEntrega: '',
    dataEntrega: '',
    entregaEmAtraso: 'NÃO',
    compraEntreguePara: '',
    compraEstocadaEm: '',
    despesaNoExtrato: '',
    lancadoCarlosChagas: '',
    observacoes: '',
    // Diárias specific
    periodoInicio: '',
    periodoFim: '',
    numDiarias: '',
    valorTotalDiarias: ''
  });

  const [ruleResult, setRuleResult] = useState<any>({
    status: 'Regular',
    acaoSugerida: '-',
    alerta: '-',
    nivelRisco: '1 - Baixo'
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Auto-calculate Mês
  useEffect(() => {
    if (formData.dataDespesa) {
      const date = new Date(formData.dataDespesa);
      // Ensure we get the correct month considering timezone issues by splitting the string
      const [year, month] = formData.dataDespesa.split('-');
      setFormData((prev: any) => ({ ...prev, mes: `${month}/${year}` }));
    }
  }, [formData.dataDespesa]);

  // Evaluate Rules on Descrição change
  useEffect(() => {
    const result = evaluateRules(formData.descricaoItem);
    setRuleResult(result);
  }, [formData.descricaoItem]);

  // Auto-calculate Entrega em Atraso
  useEffect(() => {
    if (formData.dataEntrega && formData.situacaoEntrega) {
      const dataEntregaDate = new Date(formData.dataEntrega);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dataEntregaDate < today && formData.situacaoEntrega !== 'Entregue') {
        setFormData((prev: any) => ({ ...prev, entregaEmAtraso: 'SIM' }));
      } else {
        setFormData((prev: any) => ({ ...prev, entregaEmAtraso: 'NÃO' }));
      }
    }
  }, [formData.dataEntrega, formData.situacaoEntrega]);

  // Auto-calculate Diárias
  useEffect(() => {
    if (formData.rubrica === 'Diárias' && formData.numDiarias) {
      const num = parseFloat(formData.numDiarias);
      if (!isNaN(num)) {
        setFormData((prev: any) => ({ ...prev, valorTotalDiarias: (num * 380).toFixed(2) }));
      }
    }
  }, [formData.rubrica, formData.numDiarias]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'O arquivo é muito grande. O tamanho máximo permitido é 5MB.' });
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setFormData((prev: any) => ({
          ...prev,
          fileBase64: base64String,
          fileName: file.name,
          fileMimeType: file.type,
          linkComprovante: 'Arquivo Anexado'
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev: any) => ({
        ...prev,
        fileBase64: '',
        fileName: '',
        fileMimeType: '',
        linkComprovante: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate CNPq Rules
    if (ruleResult.bloquear) {
      setMessage({ type: 'error', text: `ERRO CRÍTICO: ${ruleResult.acaoSugerida}` });
      setLoading(false);
      return;
    }

    if (ruleResult.exigeJustificativa && !formData.observacoes.trim()) {
      setMessage({ type: 'error', text: 'ATENÇÃO: Este item exige uma justificativa. Por favor, preencha o campo "Observações".' });
      setLoading(false);
      return;
    }

    if (formData.comprovanteEntregue === 'Sim' && !formData.linkComprovante.trim()) {
      setMessage({ type: 'error', text: 'O Link do Comprovante é obrigatório quando o comprovante foi entregue.' });
      setLoading(false);
      return;
    }

    // Prepare data for sheets
    const finalData = {
      ...formData,
      membroFinal: formData.membro === 'Outro' ? formData.membroOutro : formData.membro,
      subcategoriaFinal: formData.subcategoria === 'Outros' ? formData.subcategoriaOutro : formData.subcategoria,
      statusRegrasCnpq: ruleResult.status,
      acaoSugerida: ruleResult.acaoSugerida,
      alertaCnpq: ruleResult.alerta,
      nivelRisco: ruleResult.nivelRisco
    };

    const result = await saveToGoogleSheets(finalData);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Despesa lançada com sucesso' });
      // Reset form or redirect
      setTimeout(() => {
        onBack();
      }, 2000);
    } else {
      setMessage({ type: 'error', text: `Erro ao salvar: ${result.error}` });
    }
    setLoading(false);
  };

  const renderRuleAlert = () => {
    if (ruleResult.status === 'Regular') {
      return (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-md">
          <p className="text-green-700 font-medium">Status: Regular</p>
          <p className="text-green-600 text-sm">Nenhum alerta identificado.</p>
        </div>
      );
    }
    if (ruleResult.status === 'RESTRITO') {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-r-md">
          <p className="text-yellow-700 font-medium">Status: Restrito (Nível: {ruleResult.nivelRisco})</p>
          <p className="text-yellow-600 text-sm font-semibold mt-1">Alerta: {ruleResult.alerta}</p>
          <p className="text-yellow-600 text-sm mt-1">Ação Sugerida: {ruleResult.acaoSugerida}</p>
        </div>
      );
    }
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
        <p className="text-red-700 font-medium">Status: VEDADO (Nível: {ruleResult.nivelRisco})</p>
        <p className="text-red-600 text-sm font-semibold mt-1">Alerta: {ruleResult.alerta}</p>
        <p className="text-red-600 text-sm mt-1">Ação Sugerida: {ruleResult.acaoSugerida}</p>
      </div>
    );
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-semibold text-emerald-800">Lançamento de Custeio</h2>
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700">Cancelar</button>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Data e Mês */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data da Despesa *</label>
            <input type="date" name="dataDespesa" required value={formData.dataDespesa} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mês (Automático)</label>
            <input type="text" readOnly value={formData.mes} className="w-full p-2 border rounded-md bg-gray-50 text-gray-500" />
          </div>

          {/* Membro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Membro *</label>
            <select name="membro" required value={formData.membro} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500">
              <option value="">Selecione...</option>
              {MEMBROS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          {formData.membro === 'Outro' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Membro (Outro) *</label>
              <input type="text" name="membroOutro" required value={formData.membroOutro} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
          )}

          {/* Grupo e Subgrupo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grupo *</label>
            <select name="grupo" required value={formData.grupo} onChange={(e) => { const val = e.target.value; setFormData((prev: any) => ({ ...prev, grupo: val, subgrupo: '' })); }} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500">
              <option value="">Selecione...</option>
              {GRUPOS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subgrupo *</label>
            <select name="subgrupo" required value={formData.subgrupo} onChange={handleChange} disabled={!formData.grupo} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100">
              <option value="">Selecione...</option>
              {formData.grupo && SUBGRUPOS[formData.grupo]?.map(sg => <option key={sg} value={sg}>{sg}</option>)}
            </select>
          </div>

          {/* Rubrica e Subcategoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rubrica *</label>
            <select name="rubrica" required value={formData.rubrica} onChange={(e) => { const val = e.target.value; setFormData((prev: any) => ({ ...prev, rubrica: val, subcategoria: '' })); }} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500">
              <option value="">Selecione...</option>
              {RUBRICAS_CUSTEIO.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subcategoria *</label>
            <select name="subcategoria" required value={formData.subcategoria} onChange={handleChange} disabled={!formData.rubrica} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100">
              <option value="">Selecione...</option>
              {formData.rubrica && SUBCATEGORIAS_CUSTEIO[formData.rubrica]?.map(sc => <option key={sc} value={sc}>{sc}</option>)}
              {formData.rubrica && <option value="Outros">Outros</option>}
            </select>
          </div>
          {formData.subcategoria === 'Outros' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcategoria (Outros) *</label>
              <input type="text" name="subcategoriaOutro" required value={formData.subcategoriaOutro} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
          )}

          {/* Fonte da Verba e Meta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fonte da Verba *</label>
            <select name="fonteVerba" required value={formData.fonteVerba} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500">
              <option value="">Selecione...</option>
              <option value="CNPq">CNPq</option>
              <option value="FAPERGS">FAPERGS</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta / Etapa Associada *</label>
            <select name="metaEtapa" required value={formData.metaEtapa} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500">
              <option value="">Selecione...</option>
              {METAS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* Descrição do Item e Regras */}
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Detalhes do Item</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Item *</label>
            <textarea name="descricaoItem" required value={formData.descricaoItem} onChange={handleChange} rows={3} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" placeholder="Descreva o item para validação automática nas regras do CNPq..."></textarea>
          </div>
          
          {/* Alerta de Regras */}
          {formData.descricaoItem && renderRuleAlert()}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor da Compra (R$) {formData.rubrica !== 'Diárias' && '*'}</label>
              <input type="number" step="0.01" name="valorCompra" required={formData.rubrica !== 'Diárias'} value={formData.valorCompra} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento *</label>
              <select name="formaPagamento" required value={formData.formaPagamento} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500">
                <option value="">Selecione...</option>
                {FORMAS_PAGAMENTO.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data da Solicitação da Compra</label>
              <input type="date" name="dataSolicitacaoCompra" value={formData.dataSolicitacaoCompra} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade (und ou m)</label>
              <input type="number" step="0.01" name="quantidade" value={formData.quantidade} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Orçado (R$)</label>
              <input type="number" step="0.01" name="valorOrcado" value={formData.valorOrcado} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data da Compra {formData.rubrica !== 'Diárias' && '*'}</label>
              <input type="date" name="dataCompra" required={formData.rubrica !== 'Diárias'} value={formData.dataCompra} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Favorecido *</label>
              <input type="text" name="favorecido" required value={formData.favorecido} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doc Favorecido (CPF/CNPJ) *</label>
              <input type="text" name="docFavorecido" required value={formData.docFavorecido} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
              <input type="text" name="localizacao" value={formData.localizacao} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comprovante entregue? *</label>
              <select name="comprovanteEntregue" required value={formData.comprovanteEntregue} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500">
                <option value="">Selecione...</option>
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nº da NF/Recibo *</label>
              <input type="text" name="numNfRecibo" required value={formData.numNfRecibo} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anexar Comprovante (PDF/Imagem) {formData.comprovanteEntregue === 'Sim' && '*'}</label>
              <input 
                type="file" 
                accept=".pdf,image/*" 
                onChange={handleFileChange} 
                required={formData.comprovanteEntregue === 'Sim'} 
                className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" 
              />
              <p className="text-xs text-gray-500 mt-1">Tamanho máximo: 5MB</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Despesa Indenizável? *</label>
              <select name="despesaIndenizavel" required value={formData.despesaIndenizavel} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500">
                <option value="">Selecione...</option>
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status Geral da Despesa *</label>
              <select name="statusGeralDespesa" required value={formData.statusGeralDespesa} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500">
                <option value="">Selecione...</option>
                <option value="Planejado">Planejado</option>
                <option value="Em cotação">Em cotação</option>
                <option value="Comprado">Comprado</option>
                <option value="Aguardando NF">Aguardando NF</option>
                <option value="Pago/Concluído">Pago/Concluído</option>
                <option value="Lançada na Carlos Chagas">Lançada na Carlos Chagas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Situação da Entrega</label>
              <select name="situacaoEntrega" value={formData.situacaoEntrega} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500">
                <option value="">Selecione...</option>
                <option value="Pendente">Pendente</option>
                <option value="Em trânsito">Em trânsito</option>
                <option value="Entregue">Entregue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data da Entrega</label>
              <input type="date" name="dataEntrega" value={formData.dataEntrega} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entrega em Atraso? (Auto)</label>
              <input type="text" readOnly value={formData.entregaEmAtraso} className={`w-full p-2 border rounded-md font-medium ${formData.entregaEmAtraso === 'SIM' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Compra Entregue para</label>
              <input type="text" name="compraEntreguePara" value={formData.compraEntreguePara} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Compra estocada em</label>
              <input type="text" name="compraEstocadaEm" value={formData.compraEstocadaEm} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Despesa no Extrato?</label>
              <select name="despesaNoExtrato" value={formData.despesaNoExtrato} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500">
                <option value="">Selecione...</option>
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lançado no Carlos Chagas?</label>
              <select name="lancadoCarlosChagas" value={formData.lancadoCarlosChagas} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500">
                <option value="">Selecione...</option>
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações {ruleResult.exigeJustificativa && <span className="text-red-500">* (Obrigatório para este item)</span>}
            </label>
            <textarea name="observacoes" required={ruleResult.exigeJustificativa} value={formData.observacoes} onChange={handleChange} rows={3} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500"></textarea>
          </div>
        </div>

        {/* Formulário Específico Diárias */}
        {formData.rubrica === 'Diárias' && (
          <div className="border-t pt-6 mt-6 bg-emerald-50 p-6 rounded-xl border border-emerald-100">
            <h3 className="text-lg font-medium text-emerald-800 mb-4">Detalhes de Diárias</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Período (Início) *</label>
                <input type="date" name="periodoInicio" required value={formData.periodoInicio} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Período (Fim) *</label>
                <input type="date" name="periodoFim" required value={formData.periodoFim} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nº de Diárias *</label>
                <input type="number" step="0.5" name="numDiarias" required value={formData.numDiarias} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total (R$) - Diárias (Auto)</label>
                <input type="text" readOnly value={formData.valorTotalDiarias} className="w-full p-2 border rounded-md bg-gray-100 text-gray-700 font-semibold" />
                <p className="text-xs text-gray-500 mt-1">Cálculo: Nº de Diárias × R$ 380,00</p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-6 border-t flex justify-end gap-4">
          <button type="button" onClick={onBack} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition disabled:opacity-50">
            {loading ? 'Salvando...' : 'Salvar Lançamento'}
          </button>
        </div>
      </form>
    </div>
  );
}
