import React, { useState, useEffect } from 'react';
import { MEMBROS, METAS } from '../constants';
import { saveToGoogleSheets } from '../sheetsService';

export default function BolsaForm({ onBack }: { onBack: () => void }) {
  const [formData, setFormData] = useState<any>({
    tipoLancamento: 'Bolsa',
    dataDespesa: '',
    mes: '',
    membro: '',
    membroOutro: '',
    bolsa: '',
    subcategoria: '',
    valor: '',
    periodo: '',
    fonteVerba: '',
    metaEtapa: '',
    observacoes: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Auto-calculate Mês
  useEffect(() => {
    if (formData.dataDespesa) {
      const [year, month] = formData.dataDespesa.split('-');
      setFormData((prev: any) => ({ ...prev, mes: `${month}/${year}` }));
    }
  }, [formData.dataDespesa]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const finalData = {
      ...formData,
      membroFinal: formData.membro === 'Outro' ? formData.membroOutro : formData.membro
    };

    const result = await saveToGoogleSheets(finalData);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Despesa lançada com sucesso' });
      setTimeout(() => {
        onBack();
      }, 2000);
    } else {
      setMessage({ type: 'error', text: `Erro ao salvar: ${result.error}` });
    }
    setLoading(false);
  };

  const subcategoriasBolsa: Record<string, string[]> = {
    'DTI': ['DTI I', 'DTI II'],
    'GM': ['GM']
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-semibold text-indigo-800">Lançamento de Bolsa</h2>
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
            <input type="date" name="dataDespesa" required value={formData.dataDespesa} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mês (Automático)</label>
            <input type="text" readOnly value={formData.mes} className="w-full p-2 border rounded-md bg-gray-50 text-gray-500" />
          </div>

          {/* Membro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Membro *</label>
            <select name="membro" required value={formData.membro} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">Selecione...</option>
              {MEMBROS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          {formData.membro === 'Outro' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Membro (Outro) *</label>
              <input type="text" name="membroOutro" required value={formData.membroOutro} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          )}

          {/* Bolsa e Subcategoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bolsa *</label>
            <select name="bolsa" required value={formData.bolsa} onChange={(e) => { const val = e.target.value; setFormData((prev: any) => ({ ...prev, bolsa: val, subcategoria: '' })); }} className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">Selecione...</option>
              <option value="DTI">DTI</option>
              <option value="GM">GM</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subcategoria *</label>
            <select name="subcategoria" required value={formData.subcategoria} onChange={handleChange} disabled={!formData.bolsa} className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100">
              <option value="">Selecione...</option>
              {formData.bolsa && subcategoriasBolsa[formData.bolsa]?.map(sc => <option key={sc} value={sc}>{sc}</option>)}
            </select>
          </div>

          {/* Valor e Período */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label>
            <input type="number" step="0.01" name="valor" required value={formData.valor} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Período *</label>
            <input type="text" name="periodo" required value={formData.periodo} onChange={handleChange} placeholder="Ex: Jan/2024 a Dez/2024" className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          {/* Fonte da Verba e Meta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fonte da Verba *</label>
            <select name="fonteVerba" required value={formData.fonteVerba} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">Selecione...</option>
              <option value="CNPq">CNPq</option>
              <option value="FAPERGS">FAPERGS</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta / Etapa Associada *</label>
            <select name="metaEtapa" required value={formData.metaEtapa} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">Selecione...</option>
              {METAS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} rows={3} className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"></textarea>
        </div>

        <div className="pt-6 border-t flex justify-end gap-4">
          <button type="button" onClick={onBack} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50">
            {loading ? 'Salvando...' : 'Salvar Lançamento'}
          </button>
        </div>
      </form>
    </div>
  );
}
