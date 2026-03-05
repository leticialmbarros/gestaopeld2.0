// ID da Planilha do Google Sheets
const SPREADSHEET_ID = '1piDdtFLVRjl_a16788Kh86cQsVrlJoVibefVf5wNzQA';

/**
 * Função principal que recebe as requisições GET do formulário web (para o Dashboard)
 */
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Lista de abas que queremos buscar
    const sheetNames = ['LANÇAMENTOS', 'METAS', 'BASEPAINEL', 'REGRAS', 'EQUIPE', 'Página1'];
    const resultData = {};

    sheetNames.forEach(name => {
      const targetSheet = sheet.getSheetByName(name);
      if (targetSheet) {
        const data = targetSheet.getDataRange().getValues();
        if (data.length > 1) {
          const headers = data[0];
          const rows = data.slice(1).map(row => {
            let obj = {};
            headers.forEach((header, index) => {
              obj[header] = row[index];
            });
            return obj;
          });
          // Usa 'lancamentos' se for Página1 para manter compatibilidade
          const keyName = name === 'Página1' && !resultData['LANÇAMENTOS'] ? 'LANÇAMENTOS' : name;
          resultData[keyName] = rows;
        } else {
          resultData[name] = [];
        }
      }
    });

    // Se não encontrou a aba LANÇAMENTOS, tenta pegar a primeira aba
    if (!resultData['LANÇAMENTOS']) {
      const firstSheet = sheet.getSheets()[0];
      const data = firstSheet.getDataRange().getValues();
      if (data.length > 1) {
        const headers = data[0];
        const rows = data.slice(1).map(row => {
          let obj = {};
          headers.forEach((header, index) => {
            obj[header] = row[index];
          });
          return obj;
        });
        resultData['LANÇAMENTOS'] = rows;
      } else {
        resultData['LANÇAMENTOS'] = [];
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: resultData['LANÇAMENTOS'], // Mantendo compatibilidade com o código atual do frontend
      allData: resultData // Novos dados completos
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Função principal que recebe as requisições POST do formulário web
 */
function doPost(e) {
  try {
    // Verifica se há dados na requisição
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Nenhum dado recebido."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Faz o parse dos dados JSON recebidos do frontend
    const data = JSON.parse(e.postData.contents);
    
    // Abre a planilha pelo ID
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Verifica o tipo de lançamento para decidir em qual aba salvar
    const targetSheet = sheet.getSheetByName('LANÇAMENTOS') || sheet.getSheetByName('Página1') || sheet.getSheets()[0];
    
    // Prepara a linha de dados com base no tipo de lançamento
    let rowData = [];
    
    if (data.tipoLancamento === 'Custeio') {
      rowData = [
        data.tipoLancamento || '', // 1. Tipo de Lançamento (Custeio/Bolsa)
        data.dataDespesa || '',    // 2. Data da despesa
        data.mes || '',            // 3. Mês
        data.membroFinal || '',    // 4. Membro
        data.grupo || '',          // 5. Grupo
        data.subgrupo || '',       // 6. Subgrupo
        data.rubrica || '',        // 7. Rubrica
        data.subcategoriaFinal || '', // 8. Subcategoria
        data.fonteVerba || '',     // 9. Fonte da Verba
        data.metaEtapa || '',      // 10. Meta/Etapa Associada
        data.statusRegrasCnpq || '', // 11. Status Regras CNPq
        data.acaoSugerida || '',   // 12. Ação Sugerida
        data.descricaoItem || '',  // 13. Descrição do Item
        data.periodoInicio || '',  // 14. Período (inicio)
        data.periodoFim || '',     // 15. Período (fim)
        data.numDiarias || '',     // 16. Nº de Diárias
        data.quantidade || '',     // 17. Quantidade (und ou m)
        data.valorOrcado || '',    // 18. Valor Orçado (R$)
        data.valorTotalDiarias || '', // 19. Valor Total (R$) - Diárias
        data.valorCompra || '',    // 20. Valor da Compra (R$)
        data.formaPagamento || '', // 21. Forma de pagamento
        data.dataSolicitacaoCompra || '', // 22. Data da Solicitação da Compra
        data.dataCompra || '',     // 23. Data da Compra
        data.favorecido || '',     // 24. Favorecido
        data.docFavorecido || '',  // 25. Doc Favorecido
        data.localizacao || '',    // 26. Localização
        data.comprovanteEntregue || '', // 27. Comprovante entregue?
        data.numNfRecibo || '',    // 28. Nº da NF/Recibo
        data.linkComprovante || '', // 29. Link Comprovante
        data.despesaIndenizavel || '', // 30. Despesa Indenizavel?
        data.statusGeralDespesa || '', // 31. Status Geral da Despesa
        data.situacaoEntrega || '', // 32. Situação da Entrega
        data.dataEntrega || '',    // 33. Data da Entrega
        data.entregaEmAtraso || '', // 34. Entrega em Atraso?
        data.compraEntreguePara || '', // 35. Compra Entregue para:
        data.compraEstocadaEm || '', // 36. Compra estocada em:
        data.alertaCnpq || '',     // 37. Alerta CNPq
        data.nivelRisco || '',     // 38. Nivel de Risco
        data.despesaNoExtrato || '', // 39. Despesa no Extrato?
        data.lancadoCarlosChagas || '', // 40. Lançado no Carlos Chagas?
        data.observacoes || ''     // 41. Observações
      ];
    } else if (data.tipoLancamento === 'Bolsa') {
      rowData = [
        data.tipoLancamento || '', // 1. Tipo de Lançamento (Custeio/Bolsa)
        data.dataDespesa || '',    // 2. Data da despesa
        data.mes || '',            // 3. Mês
        data.membroFinal || '',    // 4. Membro
        '',                        // 5. Grupo
        '',                        // 6. Subgrupo
        data.bolsa || '',          // 7. Rubrica
        data.subcategoria || '',   // 8. Subcategoria
        data.fonteVerba || '',     // 9. Fonte da Verba
        data.metaEtapa || '',      // 10. Meta/Etapa Associada
        'Regular',                 // 11. Status Regras CNPq
        'Pagamento de bolsa padrão', // 12. Ação Sugerida
        'Pagamento de Bolsa',      // 13. Descrição do Item
        data.periodo || '',        // 14. Período (inicio)
        '',                        // 15. Período (fim)
        '',                        // 16. Nº de Diárias
        '',                        // 17. Quantidade (und ou m)
        '',                        // 18. Valor Orçado (R$)
        '',                        // 19. Valor Total (R$) - Diárias
        data.valor || '',          // 20. Valor da Compra (R$)
        '',                        // 21. Forma de pagamento
        '',                        // 22. Data da Solicitação da Compra
        '',                        // 23. Data da Compra
        data.membroFinal || '',    // 24. Favorecido
        '',                        // 25. Doc Favorecido
        '',                        // 26. Localização
        '',                        // 27. Comprovante entregue?
        '',                        // 28. Nº da NF/Recibo
        '',                        // 29. Link Comprovante
        '',                        // 30. Despesa Indenizavel?
        '',                        // 31. Status Geral da Despesa
        '',                        // 32. Situação da Entrega
        '',                        // 33. Data da Entrega
        '',                        // 34. Entrega em Atraso?
        '',                        // 35. Compra Entregue para:
        '',                        // 36. Compra estocada em:
        '-',                       // 37. Alerta CNPq
        '1 - Baixo',               // 38. Nivel de Risco
        '',                        // 39. Despesa no Extrato?
        '',                        // 40. Lançado no Carlos Chagas?
        data.observacoes || ''     // 41. Observações
      ];
    }

    // Adiciona a nova linha na planilha
    targetSheet.appendRow(rowData);

    // Retorna sucesso
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Dados salvos com sucesso!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Em caso de erro, retorna a mensagem de erro
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Função para lidar com requisições OPTIONS (CORS preflight)
 * Necessário para requisições feitas a partir de navegadores (fetch API)
 */
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    });
}
