export interface RuleResult {
  status: string;
  acaoSugerida: string;
  alerta: string;
  nivelRisco: string;
  bloquear: boolean;
  exigeJustificativa: boolean;
}

const rules = [
  {
    tipo: 'VEDADO',
    categoria: 'Eventos',
    descricao: 'Certificados, ornamentação, coquetel, alimentação, shows.',
    palavrasChave: ['coquetel', 'alimentação', 'almoço', 'jantar', 'buffet', 'festa', 'ornamentação', 'flores', 'brinde', 'certificado'],
    nivelRisco: '3 - Crítico',
    acaoSugerida: 'NÃO PAGAR. Item vedado pelo edital. Se já pago, solicitar estorno ou usar recurso próprio.',
    bloquear: true,
    exigeJustificativa: false
  },
  {
    tipo: 'VEDADO',
    categoria: 'Infraestrutura',
    descricao: 'Contas de luz, água e telefone (Contrapartida).',
    palavrasChave: ['luz', 'água', 'telefone', 'internet', 'energia', 'celular'],
    nivelRisco: '3 - Crítico',
    acaoSugerida: 'NÃO PAGAR. Despesa de contrapartida da instituição. Deve ser pago pela Universidade.',
    bloquear: true,
    exigeJustificativa: false
  },
  {
    tipo: 'RESTRITO',
    categoria: 'Logística',
    descricao: 'Correios e reprografia.',
    palavrasChave: ['correio', 'sedex', 'frete', 'xerox', 'impressão', 'cópia', 'reprografia'],
    nivelRisco: '2 - Alerta',
    acaoSugerida: 'JUSTIFICAR. Só permitido se for para envio de amostras ou material do projeto. Guardar recibo.',
    bloquear: false,
    exigeJustificativa: true
  },
  {
    tipo: 'VEDADO',
    categoria: 'Taxas',
    descricao: 'Taxas de administração ou gerência.',
    palavrasChave: ['taxa adm', 'gerenciamento', 'comissão', 'banco'],
    nivelRisco: '3 - Crítico',
    acaoSugerida: 'NÃO PAGAR. O CNPq não permite taxas de gestão ou administração sobre o valor.',
    bloquear: true,
    exigeJustificativa: false
  },
  {
    tipo: 'RESTRITO',
    categoria: 'Obras',
    descricao: 'Obras civis.',
    palavrasChave: ['obra', 'reforma', 'pedreiro', 'tinta', 'construção', 'reparos'],
    nivelRisco: '2 - Alerta',
    acaoSugerida: 'JUSTIFICAR. Só permitido se for para instalar um equipamento. Descrever o motivo técnico.',
    bloquear: false,
    exigeJustificativa: true
  },
  {
    tipo: 'VEDADO',
    categoria: 'Veículos',
    descricao: 'Aquisição de veículos automotores.',
    palavrasChave: ['carro', 'moto', 'veículo', 'caminhonete'],
    nivelRisco: '3 - Crítico',
    acaoSugerida: 'NÃO PAGAR. A compra de veículos é proibida; apenas o aluguer (locação) é permitido.',
    bloquear: true,
    exigeJustificativa: false
  },
  {
    tipo: 'VEDADO',
    categoria: 'Pessoal',
    descricao: 'Salários ou complementação de servidores públicos.',
    palavrasChave: ['salário', 'gratificação', 'complementação', 'servidor'],
    nivelRisco: '3 - Crítico',
    acaoSugerida: 'NÃO PAGAR. Vedado o pagamento de salários ou bónus a funcionários públicos.',
    bloquear: true,
    exigeJustificativa: false
  },
  {
    tipo: 'VEDADO',
    categoria: 'Serviços',
    descricao: 'Serviços de terceiros a agente público da ativa.',
    palavrasChave: ['agente público', 'servidor ativa', 'consultoria funcionário'],
    nivelRisco: '3 - Crítico',
    acaoSugerida: 'NÃO PAGAR. Vedado pagar serviços a agentes públicos que estejam no ativo.',
    bloquear: true,
    exigeJustificativa: false
  }
];

function removeAccents(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function evaluateRules(description: string): RuleResult {
  if (!description) {
    return {
      status: 'Regular',
      acaoSugerida: '-',
      alerta: '-',
      nivelRisco: '1 - Baixo',
      bloquear: false,
      exigeJustificativa: false
    };
  }

  const normalizedDesc = removeAccents(description.toLowerCase());

  for (const rule of rules) {
    for (const keyword of rule.palavrasChave) {
      const normalizedKeyword = removeAccents(keyword.toLowerCase());
      if (normalizedDesc.includes(normalizedKeyword)) {
        return {
          status: rule.tipo,
          acaoSugerida: rule.acaoSugerida,
          alerta: rule.descricao,
          nivelRisco: rule.nivelRisco,
          bloquear: rule.bloquear,
          exigeJustificativa: rule.exigeJustificativa
        };
      }
    }
  }

  return {
    status: 'Regular',
    acaoSugerida: 'Pode prosseguir com o pagamento.',
    alerta: 'Nenhum alerta identificado.',
    nivelRisco: '1 - Baixo',
    bloquear: false,
    exigeJustificativa: false
  };
}
