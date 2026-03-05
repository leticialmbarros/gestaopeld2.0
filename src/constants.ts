export const PROJETO_INFO = {
  titulo: 'Sítio PELD RPPN Pró-Mata: Floresta Ombrófila e Campos de Altitude do Sul do Brasil',
  tituloIngles: 'PELD RPPN Pró-Mata Site: Ombrophillous forest and altitude grasslands of southern Brazil',
  inicio: '2024-12-09',
  duracaoMeses: 48,
  valorGlobal: 549520.00,
  custeioCNPq: 300000.00, // Concedido
  custeioCNPqLiberado: 200000.00, // Liberado
  bolsasCNPq: 249520.00, // Concedido
  bolsasCNPqLiberado: 57642.00, // Liberado
  custeioFAPERGS: 299184.00 // Total FAPERGS (Custeio + Capital)
};

export const ORCAMENTO_CNPQ = [
  { rubrica: 'Diárias', valor: 99200.00 }, // 3.200 + 96.000
  { rubrica: 'Passagens', valor: 4000.00 },
  { rubrica: 'Serviços de Terceiros', valor: 137500.00 }, // 37.500 + 100.000
  { rubrica: 'Material de Consumo', valor: 59300.00 } // 19.500 + 32.000 + 7.800
];

export const ORCAMENTO_FAPERGS = [
  { rubrica: 'Diárias', valor: 32000.00 },
  { rubrica: 'Serviços de Terceiros', valor: 155000.00 }, // 15.000 + 30.000 + 110.000
  { rubrica: 'Material de Consumo', valor: 97000.00 }, // 13.000 + 70.000 + 14.000
  { rubrica: 'Material Permanente', valor: 15184.00 } // 4.575 + 4.830 + 5.779
];

export const BOLSAS_INFO = [
  { modalidade: 'DTI-C', duracao: 12, quantidade: 7 },
  { modalidade: 'DTI-C', duracao: 10, quantidade: 2 },
  { modalidade: 'GM', duracao: 24, quantidade: 2 }
];

export const MEMBROS = [
  'Alexandro Marques Tozetti',
  'Alice Pisani Annes',
  'Amanda da Silva Paim',
  'Ana Paula Barbosa de Macêdo',
  'Andressa Paladini',
  'Arthur Venancio de Santana',
  'Augusto Ferrari',
  'Carla Beatriz Palma',
  'Carla Schifino Robles Huber',
  'Carolina de Abreu Caberlon',
  'Cassiana Alves de Aguiar',
  'Cristiane Follmann Jurinitz',
  'Cristiano Agra Iserhard',
  'Daniela Martins Marques',
  'Davi da Cunha Morales',
  'Duncan Dubugras Alcoba Ruiz',
  'Eduardo Eizirik',
  'Edgar Leopoldo Kuhn Corrêa',
  'Fernanda Esteves Pinós',
  'Fernanda Gomes de Carvalho',
  'Francisco Roberto Zanella',
  'Gabriel Gonçalves Barbosa',
  'Glauco Schüssler',
  'Guendalina Turcato',
  'Ismael Franz',
  'Joice Klipel',
  'Jonas Brum Gonzalez',
  'Júlio César Bicca Marques',
  'Kauane Maiara Bordin',
  'Kim Ribeiro Barão',
  'Laura Roberta Pinto Utz',
  'Leandro da Silva Duarte',
  'Luciano de Azevedo Moura',
  'Luciano Koche Huber',
  'Márcio Borges Martins',
  'Maria João Veloso da Costa Ramos Pereira',
  'Marília Dalenogare de Souza',
  'Marjorie Westerhofer Esteves',
  'Miguel Kurz Dos Santos',
  'Milton de Souza Mendonça Jr.',
  'Pâmela Martins Dutra',
  'Pedro Maria de Abreu Ferreira',
  'Rachel Turba de Paula',
  'Renato Augusto Teixeira',
  'Rodrigo dos Santos Machado Feitosa',
  'Rodrigo Scarton Bergamin',
  'Sandra Cristina Müller',
  'Sandra Maria Hartz',
  'Suzana de Moura Pereira',
  'Vinicio da Silva Martins Junior',
  'Yago Corrêa de Magalhães de Freitas',
  'Outro'
];

export const GRUPOS = ['Vertebrados', 'Artrópodes', 'Plantas', 'DNAAmbiental'];

export const SUBGRUPOS: Record<string, string[]> = {
  'Vertebrados': ['Aves', 'Anfíbios', 'Mamíferos', 'Morcegos', 'Répteis Squamata', 'Coordenação Geral'],
  'Artrópodes': ['Aranhas Campestres', 'Aracnologia', 'Besouros', 'Borboletas', 'Formigas', 'Insetos de Solo', 'Lepidoptera'],
  'Plantas': ['Parcelas Campestres', 'Parcelas Florestais', 'Turfeiras'],
  'DNAAmbiental': ['eDNA – Big Data', 'Microbioma']
};

export const RUBRICAS_CUSTEIO = [
  'Diárias',
  'Passagens',
  'Hospedagem',
  'Serviços de Terceiros – PF',
  'Serviços de Terceiros – PJ',
  'Material de Consumo – Campo',
  'Material de Consumo – Laboratório',
  'Material Permanente',
  'Combustível',
  'Aluguel de Veículo',
  'Transporte Local',
  'Sequenciamento DNA'
];

export const SUBCATEGORIAS_CUSTEIO: Record<string, string[]> = {
  'Diárias': ['Diária'],
  'Passagens': ['Passagem'],
  'Hospedagem': ['Hospedagem'],
  'Serviços de Terceiros – PF': ['Serviços de Terceiros – Pessoa Física'],
  'Serviços de Terceiros – PJ': ['Serviços de Terceiros – Pessoa Jurídica'],
  'Material de Consumo – Campo': ['Material de Consumo – Campo', 'Materiais para captura de espécimes', 'Materiais diversos de pequeno valor'],
  'Material de Consumo – Laboratório': ['Material de Consumo – Laboratório'],
  'Material Permanente': ['Equipamentos', 'Material Permanente', 'Material Permanente (baixo valor)'],
  'Combustível': ['Combustível'],
  'Aluguel de Veículo': ['Aluguel de Veículo/Locação'],
  'Transporte Local': ['Transporte Local'],
  'Sequenciamento DNA': ['Sequenciamento DNA']
};

export const FORMAS_PAGAMENTO = [
  'Depósito direto',
  'Cartão do projeto',
  'Transferência',
  'Reembolso',
  'Cartão pessoal',
  'Boleto bancário'
];

export const METAS = [
  '1 Coleta/Amostragem Plantas: Realização do segundo e terceiro censo em 14 parcelas permanentes florestais e inclusão dos dados nas plataformas internacionais.',
  '2 Análise/Relatório Parcelas florestais: Analisar a dinâmica temporal considerando espécies e comunidades e redigir manuscritos.',
  '3 Análise/Relatório Parcelas florestais: Mensurar novos atributos funcionais de plantas, analisar e redigir manuscritos sobre relações demográficas, dominância e atributos funcionais.',
  '4 Coleta/Amostragem Parcelas campestres: Reamostragem da vegetação campestre em intervalos regulares.',
  '5 Coleta/Amostragem Parcelas campestres: Realizar manejo com queimadas controladas.',
  '6 Análise/Relatório Parcelas campestres: Gerar e analisar dados comparativos de plantas e artrópodes associados.',
  '7 Coleta/Amostragem Artrópodes: Estabelecer novos pontos amostrais para atingir os objetivos propostos pelo Grupo de Trabalho em Artrópodes.',
  '8 Coleta/Amostragem Artrópodes: Realizar as coletas, triagem e identificação dos artrópodes.',
  '9 Análise/Relatório Artrópodes: Preparar os artrópodes coletados para armazenamento em coleções e bancos de tecido e DNA.',
  '10 Análise/Relatório Anfíbios: Exposição a diferentes agroquímicos.',
  '11 Análise/Relatório Anfíbios: monitoramento acústico, incluindo análise de alterações da comunidade em relação a queimadas.',
  '12 Análise/Relatório Anfíbios: Descrever alterações do microbioma causadas pelo fogo.',
  '13 Coleta/Amostragem Aves: Gravação de sons de aves em diferentes ambientes da RPPN Pró-Mata.',
  '14 Coleta/Amostragem Aves: Captura de aves para estudos genético-moleculares.',
  '15 Coleta/Amostragem Répteis: Amostrar espécies de Squamata em ambientes da RPPN Pró-Mata.',
  '16 Coleta/Amostragem Amostrar continuamente dados com armadilhas fotográficas em diferentes ambientes da RPPN Pró-Mata',
  '17 Coleta/Amostragem Mamíferos: Monitorar mamíferos diurnos através de transectos visuais.',
  '18 Coleta/Amostragem Mamíferos: Realizar captura e recaptura de pequenos mamíferos.',
  '19 Coleta/Amostragem Morcegos: Monitorar espécies de morcegos através de gravação de som',
  '20 Coleta/Amostragem Morcegos: Captura de morcegos para estudos genético-moleculares.',
  '21 Análise/Relatório Mamíferos: Gerar e analisar dados de DNA ambiental para mamíferos',
  '22 Coleta/Amostragem DNA Ambiental: Coletar amostras de fitotelmos de bromélia e solo adjacente',
  '23 Coleta/Amostragem DNA Ambiental: Coletar amostras de turfeiras',
  '24 Coleta/Amostragem DNA Ambiental: Coletar teias de aranha para análise de DNA ambiental',
  '25 Análise/Relatório DNA Ambiental: Analisar DNA ambiental presente em folhas de árvores',
  '26 Análise/Relatório Aves: Analisar microrganismos presentes em pernas e penas de aves',
  '27 Coleta/Amostragem Coletar e identificar microrganismos em filtros de ar',
  '28 Análise/Relatório DNA Ambiental: Gerar uma banco de dados de DNA barcodes para artrópodes terrestres'
];
