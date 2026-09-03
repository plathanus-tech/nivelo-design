/* ══════════════════════════════════════════════════════════════════════
   window.NiveloIbsCbs — estrutura centralizada da configuração de IBS/CBS
   (Reforma Tributária) usada pela aba "IBS/CBS" de Nova Natureza da
   Operação. Centraliza numa única fonte:

     CST_OPTIONS         — as 16 opções do Código de Situação Tributária
                            IBS/CBS (CST), na ordem exibida no select.
     CCLASSTRIB_BY_CST    — pra cada CST, a lista de Códigos de
                            Classificação Tributária (cClassTrib)
                            permitidos (nunca mostrar um cClassTrib fora
                            do CST selecionado).
     FIELD_CONFIG_BY_CST  — pra cada CST, quais campos de alíquota
                            aparecem nas seções de CBS/IBS UF (nenhum,
                            só alíquota, alíquota+redução ou
                            alíquota+diferimento[+redução]) — ver a
                            matriz do pedido original. "Outras
                            configurações" (IBS Municipal/IS, "Em breve")
                            aparece pra TODOS os CSTs, por isso não entra
                            nesta configuração.

   Único propósito: evitar dezenas de `if/else` espalhados por
   nova-natureza-operacao.js — a tela só LÊ daqui, nunca duplica os dados. */
(function () {
  'use strict';

  var CST_OPTIONS = [
    { codigo: '000', descricao: 'Tributação integral' },
    { codigo: '010', descricao: 'Tributação com alíquotas uniformes' },
    { codigo: '011', descricao: 'Tributação com alíquotas uniformes reduzidas' },
    { codigo: '200', descricao: 'Alíquota reduzida' },
    { codigo: '221', descricao: 'Alíquota fixa proporcional' },
    { codigo: '400', descricao: 'Isenção' },
    { codigo: '410', descricao: 'Imunidade e não incidência' },
    { codigo: '510', descricao: 'Diferimento' },
    { codigo: '515', descricao: 'Diferimento com redução de alíquota' },
    { codigo: '550', descricao: 'Suspensão' },
    { codigo: '620', descricao: 'Tributação Monofásica' },
    { codigo: '800', descricao: 'Transferência de crédito' },
    { codigo: '810', descricao: 'Ajuste de IBS na ZFM' },
    { codigo: '811', descricao: 'Ajustes' },
    { codigo: '820', descricao: 'Tributação em documento específico' },
    { codigo: '830', descricao: 'Exclusão da Base de Cálculo' }
  ];

  // ── Grupos de campos visíveis nas seções de CBS/IBS UF, por CST ─────────
  // 'aliquota' | 'reducao' | 'diferimento' — "Outras configurações" não
  // entra aqui por aparecer sempre, independente do CST.
  var NONE = [];
  var SOMENTE_ALIQUOTA = ['aliquota'];
  var ALIQUOTA_REDUCAO = ['aliquota', 'reducao'];
  var ALIQUOTA_DIFERIMENTO = ['aliquota', 'diferimento'];
  var ALIQUOTA_DIFERIMENTO_REDUCAO = ['aliquota', 'diferimento', 'reducao'];

  var FIELD_CONFIG_BY_CST = {
    '000': { cbs: SOMENTE_ALIQUOTA, ibs: SOMENTE_ALIQUOTA },
    '010': { cbs: SOMENTE_ALIQUOTA, ibs: SOMENTE_ALIQUOTA },
    '011': { cbs: ALIQUOTA_REDUCAO, ibs: ALIQUOTA_REDUCAO },
    '200': { cbs: ALIQUOTA_REDUCAO, ibs: ALIQUOTA_REDUCAO },
    '221': { cbs: SOMENTE_ALIQUOTA, ibs: SOMENTE_ALIQUOTA },
    '400': { cbs: NONE, ibs: NONE },
    '410': { cbs: NONE, ibs: NONE },
    '510': { cbs: ALIQUOTA_DIFERIMENTO, ibs: ALIQUOTA_DIFERIMENTO },
    '515': { cbs: ALIQUOTA_DIFERIMENTO_REDUCAO, ibs: ALIQUOTA_DIFERIMENTO_REDUCAO },
    '550': { cbs: SOMENTE_ALIQUOTA, ibs: SOMENTE_ALIQUOTA },
    '620': { cbs: NONE, ibs: NONE },
    '800': { cbs: NONE, ibs: NONE },
    '810': { cbs: NONE, ibs: NONE },
    '811': { cbs: NONE, ibs: NONE },
    '820': { cbs: NONE, ibs: NONE },
    '830': { cbs: SOMENTE_ALIQUOTA, ibs: SOMENTE_ALIQUOTA }
  };

  // ── cClassTrib por CST (código + descrição completa) ────────────────────
  var CCLASSTRIB_BY_CST = {
    '000': [
      { codigo: '000001', descricao: 'Situações tributadas integralmente pelo IBS e CBS.' },
      { codigo: '000003', descricao: 'Regime automotivo - projetos incentivados, observado o art. 311 da Lei Complementar nº 214, de 2025.' },
      { codigo: '000004', descricao: 'Regime automotivo - projetos incentivados, observado o art. 312 da Lei Complementar nº 214, de 2025.' },
      { codigo: '000005', descricao: 'Operação com EAC destinado à mistura com gasolina A, mas com saída do biocombustível com destinação diversa, observado o art. 179 da Lei Complementar nº 214, de 2025.' }
    ],
    '010': [
      { codigo: '010001', descricao: 'Operações do FGTS não realizadas pela Caixa Econômica Federal, observado o art. 212 da Lei Complementar nº 214, de 2025.' },
      { codigo: '010002', descricao: 'Operações do serviço financeiro' }
    ],
    '011': [
      { codigo: '011003', descricao: 'Intermediação de planos de assistência à saúde, observado o art. 240 da Lei Complementar nº 214, de 2025.' }
    ],
    '200': [
      { codigo: '200001', descricao: 'Serviços de transporte de bens até as zonas de processamento de exportação e bens exportados a partir das zonas de processamento de exportação, observado o art. 103 da Lei Complementar n 214, de 2025.' },
      { codigo: '200002', descricao: 'Fornecimento ou importação de tratores, máquinas e implementos agrícolas, destinados a produtor rural não contribuinte, e de veículos de transporte de carga destinados a transportador autônomo de carga pessoa física não contribuinte, observado o art. 110 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200003', descricao: 'Vendas de produtos destinados à alimentação humana relacionados no Anexo I da Lei Complementar nº 214, de 2025, com a especificação das respectivas classificações da NCM/SH, que compõem a Cesta Básica Nacional de Alimentos, criada nos termos do art. 8º da Emenda Constitucional nº 132, de 20 de dezembro de 2023, observado o art. 125 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200004', descricao: 'Fornecimento de dispositivos médicos com a especificação das respectivas classificações da NCM/SH previstas no Anexo XII da Lei Complementar nº 214, de 2025, observado o art. 144 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200005', descricao: 'Fornecimento de dispositivos médicos com a especificação das respectivas classificações da NCM/SH previstas no Anexo IV da Lei Complementar nº 214, de 2025, quando adquiridos por órgãos da administração pública direta, autarquias, fundações públicas e entidades de saúde imunes, observado o art. 144 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200006', descricao: 'Situação de emergência de saúde pública reconhecida pelo Poder Legislativo federal, estadual, distrital ou municipal competente, ato conjunto do Ministro da Fazenda e do Comitê Gestor do IBS poderá ser editado, a qualquer momento, para incluir dispositivos não listados no Anexo XII da Lei Complementar nº 214, de 2025, limitada a vigência do benefício ao período e à localidade da emergência de saúde pública, observado o art. 144 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200007', descricao: 'Fornecimento dos dispositivos de acessibilidade próprios para pessoas com deficiência relacionados no Anexo XIII da Lei Complementar nº 214, de 2025, com a especificação das respectivas classificações da NCM/SH, observado o art. 145 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200008', descricao: 'Fornecimento dos dispositivos de acessibilidade próprios para pessoas com deficiência relacionados no Anexo V da Lei Complementar nº 214, de 2025, com a especificação das respectivas classificações da NCM/SH, quando adquiridos por órgãos da administração pública direta, autarquias, fundações públicas e entidades imunes, observado o art. 145 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200009', descricao: 'Fornecimento dos medicamentos registrados na Anvisa, observado o art. 146 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200010', descricao: 'Fornecimento dos medicamentos registrados na Anvisa, quando adquiridos por órgãos da administração pública direta, autarquias, fundações públicas e entidades de saúde imunes, observado o art. 146 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200011', descricao: 'Fornecimento das composições para nutrição enteral e parenteral, composições especiais e fórmulas nutricionais destinadas às pessoas com erros inatos do metabolismo relacionadas no Anexo VI da Lei Complementar nº 214, de 2025, com a especificação das respectivas classificações da NCM/SH, quando adquiridas por órgãos da administração pública direta, autarquias e fundações públicas, observado o art. 146 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200012', descricao: 'Situação de emergência de saúde pública reconhecida pelo Poder Legislativo federal, estadual, distrital ou municipal competente, ato conjunto do Ministro da Fazenda e do Comitê Gestor do IBS poderá ser editado, a qualquer momento, limitada a vigência do benefício ao período e à localidade da emergência de saúde pública, observado o art. 146 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200013', descricao: 'Fornecimento de tampões higiênicos, absorventes higiênicos internos ou externos, descartáveis ou reutilizáveis, calcinhas absorventes e coletores menstruais, observado o art. 147 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200014', descricao: 'Fornecimento dos produtos hortícolas, frutas e ovos, relacionados no Anexo XV da Lei Complementar nº 214, de 2025, com a especificação das respectivas classificações da NCM/SH e desde que não cozidos, observado o art. 148 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200015', descricao: 'Venda de automóveis de passageiros de fabricação nacional de, no mínimo, 4 (quatro) portas, inclusive a de acesso ao bagageiro, quando adquiridos por motoristas profissionais que exerçam, comprovadamente, em automóvel de sua propriedade, atividade de condutor autônomo de passageiros, na condição de titular de autorização, permissão ou concessão do poder público, e que destinem o automóvel à utilização na categoria de aluguel (táxi), ou por pessoas com deficiência física, visual, auditiva, deficiência mental severa ou profunda, transtorno do espectro autista, com prejuízos na comunicação social e em padrões restritos ou repetitivos de comportamento de nível moderado ou grave, nos termos da legislação relativa à matéria, observado o disposto no art. 149 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200016', descricao: 'Prestação de serviços de pesquisa e desenvolvimento por Instituição Científica, Tecnológica e de Inovação (ICT) sem fins lucrativos para a administração pública direta, autarquias e fundações públicas ou para o contribuinte sujeito ao regime regular do IBS e da CBS, observado o disposto no art. 156 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200017', descricao: 'Operações relacionadas ao FGTS, considerando aquelas necessárias à aplicação da Lei nº 8.036, de 1990, realizadas pelo Conselho Curador ou Secretaria Executiva do FGTS, observado o art. 212 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200019', descricao: 'Importador dos serviços financeiros que seja contribuinte e tenha direito de apropriação de créditos na aquisição do mesmo serviço financeiro no País, observado o art. 231 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200020', descricao: 'Operação praticada por sociedades cooperativas optantes por regime específico do IBS e CBS, quando o associado destinar bem ou serviço à cooperativa de que participa, e a cooperativa fornecer bem ou serviço ao associado sujeito ao regime regular do IBS e da CBS, observado o art. 271 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200021', descricao: 'Serviços de transporte público coletivo de passageiros ferroviário e hidroviário urbanos, semiurbanos e metropolitanos, observado o art. 285 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200022', descricao: 'Operação originada fora da Zona Franca de Manaus que destine bem material industrializado de origem nacional a contribuinte estabelecido na Zona Franca de Manaus que seja habilitado nos termos do art. 442 da Lei Complementar nº 214, de 2025, e sujeito ao regime regular do IBS e da CBS ou optante pelo regime do Simples Nacional de que trata o art. 12 da Lei Complementar nº 123, de 2006, observado o art. 445 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200023', descricao: 'Operação realizada por indústria incentivada que destine bem material intermediário para outra indústria incentivada na Zona Franca de Manaus, desde que a entrega ou disponibilização dos bens ocorra dentro da referida área, observado o art. 448 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200024', descricao: 'Operação originada fora das Áreas de Livre Comércio que destine bem material industrializado de origem nacional a contribuinte estabelecido nas Áreas de Livre Comércio que seja habilitado nos termos do art. 456 da Lei Complementar nº 214, de 2025, e sujeito ao regime regular do IBS e da CBS ou optante pelo regime do Simples Nacional de que trata o art. 12 da Lei Complementar nº 123, de 2006, observado o art. 463 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200025', descricao: 'Fornecimento dos serviços de educação relacionados ao Programa Universidade para Todos (Prouni), instituído pela Lei nº 11.096, de 13 de janeiro de 2005, observado o art. 308 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200026', descricao: 'Locação de imóveis localizados nas zonas reabilitadas, pelo prazo de 5 (cinco) anos, contado da data de expedição do habite-se, e relacionados a projetos de reabilitação urbana de zonas históricas e de áreas críticas de recuperação e reconversão urbanística dos Municípios ou do Distrito Federal, a serem delimitadas por lei municipal ou distrital, observado o art. 158 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200027', descricao: 'Operações de locação, cessão onerosa e arrendamento de bens imóveis, observado o art. 261 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200028', descricao: 'Fornecimento dos serviços de educação relacionados no Anexo II da Lei Complementar nº 214, de 2025, com a especificação das respectivas classificações da Nomenclatura Brasileira de Serviços, Intangíveis e Outras Operações que Produzam Variações no Patrimônio (NBS), observado o art. 129 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200029', descricao: 'Fornecimento dos serviços de saúde humana relacionados no Anexo III da Lei Complementar nº 214, de 2025, com a especificação das respectivas classificações da NBS, observado o art. 130 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200030', descricao: 'Venda dos dispositivos médicos relacionados no Anexo IV da Lei Complementar nº 214, de 2025, com a especificação das respectivas classificações da NCM/SH, observado o art. 131 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200031', descricao: 'Fornecimento dos dispositivos de acessibilidade próprios para pessoas com deficiência relacionados no Anexo V da Lei Complementar nº 214, de 2025, com a especificação das respectivas classificações da NCM/SH, observado o art. 132 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200032', descricao: 'Fornecimento dos medicamentos registrados na Anvisa ou produzidos por farmácias de manipulação, ressalvados os medicamentos sujeitos à alíquota zero de que trata o art. 146 da Lei Complementar nº 214, de 2025, observado o art. 133 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200033', descricao: 'Fornecimento das composições para nutrição enteral e parenteral, composições especiais e fórmulas nutricionais destinadas às pessoas com erros inatos do metabolismo relacionadas no Anexo VI da Lei Complementar nº 214, de 2025, com a especificação das respectivas classificações da NCM/SH e da NBS, observado o art. 133 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200034', descricao: 'Fornecimento dos alimentos destinados ao consumo humano relacionados no Anexo VII da Lei Complementar nº 214, de 2025, com a especificação das respectivas classificações da NCM/SH, observado o art. 135 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200035', descricao: 'Fornecimento dos produtos de higiene pessoal e limpeza relacionados no Anexo VIII da Lei Complementar nº 214, de 2025, com a especificação das respectivas classificações da NCM/SH, observado o art. 136 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200036', descricao: 'Fornecimento de produtos agropecuários, aquícolas, pesqueiros, florestais e extrativistas vegetais in natura, observado o art. 137 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200037', descricao: 'Fornecimento de serviços ambientais de conservação ou recuperação da vegetação nativa, mesmo que fornecidos sob a forma de manejo sustentável de sistemas agrícolas, agroflorestais e agrossilvopastoris, em conformidade com as definições e requisitos da legislação específica, observado o art. 137 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200038', descricao: 'Fornecimento dos insumos agropecuários e aquícolas relacionados no Anexo IX da Lei Complementar nº 214, de 2025, com a especificação das respectivas classificações da NCM/SH e da NBS, observado o art. 138 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200039', descricao: 'Fornecimento dos bens e serviços listados no Anexo X da Lei Complementar nº 214, de 2025, com a especificação das respectivas classificações da NCM/SH e NBS, nos casos relacionados com produções nacionais artísticas, culturais, de eventos, jornalísticas e audiovisuais, observado o art. 139 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200040', descricao: 'Fornecimento de serviços de comunicação institucional à administração pública direta, autarquias e fundações públicas: serviços direcionados ao planejamento, criação, programação e manutenção de páginas eletrônicas da administração pública, ao monitoramento e gestão de suas redes sociais e à otimização de páginas e canais digitais para mecanismos de buscas e produção de mensagens, infográficos, painéis interativos e conteúdo institucional, serviços de relações com a imprensa e serviços de relações públicas, observado o art. 140 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200041', descricao: 'Operações relacionadas às seguintes atividades desportivas: fornecimento de serviço de educação desportiva, classificado no código 1.2205.12.00 da NBS, e gestão e exploração do desporto por associações e clubes esportivos filiados ao órgão estadual ou federal responsável pela coordenação dos desportos, inclusive por meio de venda de ingressos para eventos desportivos, fornecimento oneroso ou não de bens e serviços, inclusive ingressos, por meio de programas de sócio-torcedor, cessão dos direitos desportivos dos atletas e transferência de atletas para outra entidade desportiva ou seu retorno à atividade em outra entidade desportiva, observado o art. 141 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200042', descricao: 'Operações relacionadas às seguintes atividades desportivas: gestão e exploração do desporto por associações e clubes esportivos filiados ao órgão estadual ou federal responsável pela coordenação dos desportos, observado o art. 141 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200043', descricao: 'Fornecimento à administração pública direta, autarquias e fundações púbicas dos serviços e dos bens relativos à soberania e à segurança nacional, à segurança da informação e à segurança cibernética relacionados no Anexo XI da Lei Complementar nº 214, de 2025, com a especificação das respectivas classificações da NBS e da NCM/SH, observado o art. 142 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200044', descricao: 'Operações e prestações de serviços de segurança da informação e segurança cibernética desenvolvidos por sociedade que tenha sócio brasileiro com o mínimo de 20% (vinte por cento) do seu capital social, relacionados no Anexo XI da Lei Complementar nº 214, de 2025, com a especificação das respectivas classificações da NBS e da NCM/SH, observado o art. 142 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200045', descricao: 'Operações relacionadas a projetos de reabilitação urbana de zonas históricas e de áreas críticas de recuperação e reconversão urbanística dos Municípios ou do Distrito Federal, a serem delimitadas por lei municipal ou distrital, observado o art. 158 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200046', descricao: 'Operações com bens imóveis, observado o art. 261 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200047', descricao: 'Bares e Restaurantes, observado o art. 275 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200048', descricao: 'Hotelaria, Parques de Diversão e Parques Temáticos, observado o art. 281 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200050', descricao: 'Serviços de transporte aéreo regional coletivo de passageiros ou de carga, observado o art. 287 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200051', descricao: 'Agências de Turismo, observado o art. 289 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200052', descricao: 'Prestação de serviços das seguintes profissões intelectuais de natureza científica, literária ou artística, submetidas à fiscalização por conselho profissional: administradores, advogados, arquitetos e urbanistas, assistentes sociais, bibliotecários, biólogos, contabilistas, economistas, economistas domésticos, profissionais de educação física, engenheiros e agrônomos, estatísticos, médicos veterinários e zootecnistas, museólogos, químicos, profissionais de relações públicas, técnicos industriais e técnicos agrícolas, observado o art. 127 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200053', descricao: 'Fornecimento de medicamentos registrados na Anvisa, quando classificados como soros ou vacinas, observado o art. 146 da Lei Complementar nº 214, de 2025.' },
      { codigo: '200054', descricao: 'Fornecimento de bem material pela cooperativa de produção agropecuária a associado não sujeito ao regime regular do IBS e da CBS com anulação de créditos referentes ao bem fornecido, observado o art. 271 da Lei Complementar nº 214, de 2025.' }
    ],
    '221': [
      { codigo: '221001', descricao: 'Locação, cessão onerosa ou arrendamento de bem imóvel com alíquota sobre a receita bruta, observado o art. 487 da Lei Complementar nº 214, de 2025.' }
    ],
    '400': [
      { codigo: '400001', descricao: 'Fornecimento de serviços de transporte público coletivo de passageiros rodoviário e metroviário de caráter urbano, semiurbano e metropolitano, sob regime de autorização, permissão ou concessão pública, observado o art. 157 da Lei Complementar nº 214, de 2025.' }
    ],
    '410': [
      { codigo: '410001', descricao: 'Fornecimento de bonificações quando constem do respectivo documento fiscal e que não dependam de evento posterior, observado o art. 5º da Lei Complementar nº 214, de 2025.' },
      { codigo: '410002', descricao: 'Transferências entre estabelecimentos pertencentes ao mesmo contribuinte, observado o art. 6º da Lei Complementar nº 214, de 2025.' },
      { codigo: '410003', descricao: 'Doações que não tenham por objeto bens ou serviços que tenham permitido a apropriação de créditos pelo doador, observado o art. 6º da Lei Complementar nº 214, de 2025.' },
      { codigo: '410004', descricao: 'Exportações de bens e serviços, observado o art. 8º da Lei Complementar nº 214, de 2025.' },
      { codigo: '410005', descricao: 'Fornecimentos realizados pela União, pelos Estados, pelo Distrito Federal e pelos Municípios, observado o art. 9º da Lei Complementar nº 214, de 2025.' },
      { codigo: '410006', descricao: 'Fornecimentos realizados por entidades religiosas e templos de qualquer culto, inclusive suas organizações assistenciais e beneficentes, observado o art. 9º da Lei Complementar nº 214, de 2025.' },
      { codigo: '410007', descricao: 'Fornecimentos realizados por partidos políticos, inclusive suas fundações, entidades sindicais dos trabalhadores e instituições de educação e de assistência social, sem fins lucrativos, observado o art. 9º da Lei Complementar nº 214, de 2025.' },
      { codigo: '410008', descricao: 'Fornecimentos de livros, jornais, periódicos e do papel destinado a sua impressão, observado o art. 9º da Lei Complementar nº 214, de 2025.' },
      { codigo: '410009', descricao: 'Fornecimentos de fonogramas e videofonogramas musicais produzidos no Brasil contendo obras musicais ou literomusicais de autores brasileiros e/ou obras em geral interpretadas por artistas brasileiros, bem como os suportes materiais ou arquivos digitais que os contenham, salvo na etapa de replicação industrial de mídias ópticas de leitura a laser, observado o art. 9º da Lei Complementar nº 214, de 2025.' },
      { codigo: '410010', descricao: 'Fornecimentos de serviço de comunicação nas modalidades de radiodifusão sonora e de sons e imagens de recepção livre e gratuita, observado o art. 9º da Lei Complementar nº 214, de 2025.' },
      { codigo: '410012', descricao: 'Fornecimento de condomínio edilício não optante pelo regime regular, observado o art. 26 da Lei Complementar nº 214, de 2025.' },
      { codigo: '410013', descricao: 'Exportações de combustíveis, observado o art. 98 da Lei Complementar nº 214, de 2025.' },
      { codigo: '410014', descricao: 'Fornecimento de produtor rural não contribuinte, observado o art. 164 da Lei Complementar nº 214, de 2025.' },
      { codigo: '410015', descricao: 'Fornecimento por transportador autônomo não contribuinte, observado o art. 169 da Lei Complementar nº 214, de 2025.' },
      { codigo: '410016', descricao: 'Fornecimento ou aquisição de resíduos sólidos, observado o art. 170 da Lei Complementar nº 214, de 2025.' },
      { codigo: '410017', descricao: 'Aquisição de bem móvel com crédito presumido sob condição de revenda realizada, observado o art. 171 da Lei Complementar nº 214, de 2025.' },
      { codigo: '410019', descricao: 'Exclusão da gorjeta na base de cálculo no fornecimento de alimentação, observado o art. 274 da Lei Complementar nº 214, de 2025.' },
      { codigo: '410020', descricao: 'Exclusão do valor de intermediação na base de cálculo no fornecimento de alimentação, observado o art. 274 da Lei Complementar nº 214, de 2025.' },
      { codigo: '410026', descricao: 'Doações sem contraprestação em benefício do doador, com anulação de crédito apropriados pelo doador referente ao fornecimento doado, observado o art. 6º da Lei Complementar nº 214, de 2025.' },
      { codigo: '410027', descricao: 'Fornecimento de bens e serviços, desde que vinculados direta e exclusivamente à exportação de bens materiais ou associados à entrega no exterior de bens materiais, observado o art. 6º da Lei Complementar nº 214, de 2025.' },
      { codigo: '410028', descricao: 'Operações com bens imóveis realizadas por pessoas físicas não consideradas contribuintes do regime regular do IBS e da CBS, observado o art. 251 da Lei Complementar nº 214, de 2025.' },
      { codigo: '410029', descricao: 'Operações não sujeitas à incidência de IBS e de CBS, alcançadas apenas por obrigação acessória do ICMS, observado o art. 4º da Lei Complementar nº 214, de 2025.' },
      { codigo: '410030', descricao: 'Estorno de crédito apropriado de bens adquiridos e venham a perecer, deteriorar-se ou ser objeto de roubo, furto ou extravio, observado o art. 47 da Lei Complementar nº 214, de 2025.' },
      { codigo: '410031', descricao: 'Fornecimento em período anterior ao início de vigência de incidências de CBS e IBS, observado o art. 544 da Lei Complementar nº 214, de 2025.' },
      { codigo: '410033', descricao: 'Operações com bens imóveis, inclusive operações com direitos reais sobre bens imóveis, realizadas por Fundos de Investimento Imobiliário (FII) e Fundos de Investimento nas Cadeias Produtivas do Agronegócio (Fiagro), observado o art. 26 da Lei Complementar nº 214, de 2025.' },
      { codigo: '410035', descricao: 'Fornecimento realizado por nanoempreendedor, observado o art. 26 da Lei Complementar nº 214, de 2025.' },
      { codigo: '410999', descricao: 'Operações não onerosas sem previsão de tributação, não especificadas anteriormente, observado o art. 4º da Lei Complementar nº 214, de 2025.' }
    ],
    '510': [
      { codigo: '510001', descricao: 'Operações, sujeitas a diferimento, com energia elétrica ou com direitos a ela relacionados, relativas à importação, geração, comercialização, distribuição e transmissão, observado o art. 28 da Lei Complementar nº 214, de 2025.' }
    ],
    '515': [
      { codigo: '515001', descricao: 'Operações, sujeitas a diferimento, com insumos agropecuários e aquícolas, observado o art. 138 da Lei Complementar nº 214, de 2025.' }
    ],
    '550': [
      { codigo: '550001', descricao: 'Exportações de bens materiais, observado o art. 82 da Lei Complementar nº 214, de 2025.' },
      { codigo: '550002', descricao: 'Regime de Trânsito, observado o art. 84 da Lei Complementar nº 214, de 2025.' },
      { codigo: '550003', descricao: 'Regimes de Depósito, observado o art. 85 da Lei Complementar nº 214, de 2025.' },
      { codigo: '550004', descricao: 'Regimes de Depósito, observado o art. 87 da Lei Complementar nº 214, de 2025.' },
      { codigo: '550005', descricao: 'Regimes de Depósito, observado o art. 87 da Lei Complementar nº 214, de 2025.' },
      { codigo: '550006', descricao: 'Regimes de Permanência Temporária, observado o art. 88 da Lei Complementar nº 214, de 2025.' },
      { codigo: '550007', descricao: 'Regimes de Aperfeiçoamento, observado o art. 90 da Lei Complementar nº 214, de 2025.' },
      { codigo: '550008', descricao: 'Importação de bens para o Regime de Repetro-Temporário, de que tratam o inciso I do art. 93 da Lei Complementar nº 214, de 2025.' },
      { codigo: '550009', descricao: 'GNL-Temporário, de que trata o inciso II do art. 93 da Lei Complementar nº 214, de 2025.' },
      { codigo: '550010', descricao: 'Repetro-Permanente, de que trata o inciso III do art. 93 da Lei Complementar nº 214, de 2025.' },
      { codigo: '550011', descricao: 'Repetro-Industrialização, de que trata o inciso IV do art. 93 da Lei Complementar nº 214, de 2025.' },
      { codigo: '550012', descricao: 'Repetro-Nacional, de que trata o inciso V do art. 93 da Lei Complementar nº 214, de 2025.' },
      { codigo: '550013', descricao: 'Repetro-Entreposto, de que trata o inciso VI do art. 93 da Lei Complementar nº 214, de 2025.' },
      { codigo: '550014', descricao: 'Zona de Processamento de Exportação, observado os arts. 99, 100 e 102 da Lei Complementar nº 214, de 2025.' },
      { codigo: '550015', descricao: 'Regime Tributário para Incentivo à Modernização e à Ampliação da Estrutura Portuária - Reporto, observado o art. 105 da Lei Complementar nº 214, de 2025.' },
      { codigo: '550016', descricao: 'Regime Especial de Incentivos para o Desenvolvimento da Infraestrutura - Reidi, observado o art. 106 da Lei Complementar nº 214, de 2025.' },
      { codigo: '550017', descricao: 'Regime Tributário para Incentivo à Atividade Econômica Naval – Renaval, observado o art. 107 da Lei Complementar nº 214, de 2025.' },
      { codigo: '550018', descricao: 'Desoneração da aquisição de bens de capital, observado o art. 109 da Lei Complementar nº 214, de 2025.' },
      { codigo: '550019', descricao: 'Importação de bem material por indústria incentivada para utilização na Zona Franca de Manaus, observado o art. 443 da Lei Complementar nº 214, de 2025.' },
      { codigo: '550020', descricao: 'Áreas de livre comércio, observado o art. 461 da Lei Complementar nº 214, de 2025.' },
      { codigo: '550021', descricao: 'Fornecimento de produtos agropecuários in natura para contribuinte do regime regular que promova industrialização destinada a exportação, observado o art. 82 da Lei Complementar nº 214, de 2025.' },
      { codigo: '550022', descricao: 'Regime Especial de Incentivos para a Produção de Hidrogênio de Baixa Emissão de Carbono (Rehidro), observado o art. 106 da Lei Complementar nº 214, de 2025.' },
      { codigo: '550023', descricao: 'Operações com hidrocarbonetos líquidos derivados de petróleo não combustíveis ou de gás natural, inclusive nafta, observado o art. 172 da Lei Complementar nº 214, de 2025.' }
    ],
    '620': [
      { codigo: '620001', descricao: 'Tributação monofásica sobre combustíveis, observados os art. 172 da Lei Complementar nº 214, de 2025.' },
      { codigo: '620002', descricao: 'Tributação monofásica com responsabilidade pela retenção sobre combustíveis, observado o art. 178 da Lei Complementar nº 214, de 2025.' },
      { codigo: '620003', descricao: 'Tributação monofásica com responsabilidade de retenção de tributos por terceiros, observado o art. 178 da Lei Complementar nº 214, de 2025.' },
      { codigo: '620004', descricao: 'Tributação monofásica sobre mistura de EAC com gasolina A em percentual superior ou inferior ao obrigatório, observado o art. 179 da Lei Complementar nº 214, de 2025.' },
      { codigo: '620005', descricao: 'Tributação monofásica sobre mistura de EAC com gasolina A em percentual superior ou inferior ao obrigatório, observado o art. 179 da Lei Complementar nº 214, de 2025.' },
      { codigo: '620006', descricao: 'Tributação monofásica sobre combustíveis cobrada anteriormente, observador o art. 180 da Lei Complementar nº 214, de 2025.' },
      { codigo: '620007', descricao: 'Perecimento, deteriorização, roubo, furto ou extravio no regime monofásico sem estorno de crédito, observado o art. 47 da Lei Complementar nº 214, de 2025.' }
    ],
    '800': [
      { codigo: '800001', descricao: 'Fusão, cisão ou incorporação, observado o art. 55 da Lei Complementar nº 214, de 2025.' },
      { codigo: '800002', descricao: 'Transferência de crédito do associado, inclusive as cooperativas singulares, para cooperativa de que participa das operações antecedentes às operações em que fornece bens e serviços e os créditos presumidos, observado o art. 272 da Lei Complementar nº 214, de 2025.' }
    ],
    '810': [
      { codigo: '810001', descricao: 'Crédito presumido sobre o valor apurado nos fornecimentos a partir da Zona Franca de Manaus, observado o art. 450 da Lei Complementar nº 214, de 2025.' }
    ],
    '811': [
      { codigo: '811001', descricao: 'Anulação de crédito proporcional ao valor das operações imunes e isentas, observado o art. 51 da Lei Complementar nº 214, de 2025.' },
      { codigo: '811002', descricao: 'Débitos de notas fiscais não processadas na apuração, observado o art. 45 da Lei Complementar nº 214, de 2025.' },
      { codigo: '811003', descricao: 'Débitos apurados após o desenquadramento do regime Simples Nacional, observado o art. 41 da Lei Complementar nº 214, de 2025.' }
    ],
    '820': [
      { codigo: '820001', descricao: 'Documento com informações de fornecimento de serviços de planos de assistência à saúde elencados no art. 234 da Lei Complementar nº 214, de 2025, mas com tributação realizada por outro meio.' },
      { codigo: '820002', descricao: 'Documento com informações de fornecimento de serviços de planos de assistência funerária, mas com tributação realizada por outro meio, observado o art. 236 da Lei Complementar nº 214, de 2025.' },
      { codigo: '820003', descricao: 'Documento com informações de fornecimento de serviços de planos de assistência à saúde de animais domésticos, mas com tributação realizada por outro meio, observado o art. 243 da Lei Complementar nº 214, de 2025.' },
      { codigo: '820004', descricao: 'Documento com informações de prestação de serviços de concursos de prognósticos, mas com tributação realizada por outro meio, observado o art. 248 da Lei Complementar nº 214, de 2025.' },
      { codigo: '820006', descricao: 'Documento com informações de fornecimento de serviços de exploração de via, mas com tributação realizada por outro meio, observado o art. 11 da Lei Complementar nº 214, de 2025.' },
      { codigo: '820007', descricao: 'Documento com informações de fornecimento de serviços financeiros, mas com tributação realizada por outro meio, observado o art. 181 da Lei Complementar nº 214, de 2025.' },
      { codigo: '820009', descricao: 'Cobrança relativa a fornecimentos declarados em outro documento, observado o art. 60 da Lei Complementar nº 214, de 2025.' }
    ],
    '830': [
      { codigo: '830001', descricao: 'Documento com exclusão da base de cálculo da CBS e do IBS referente à energia elétrica fornecida pela distribuidora à unidade consumidora, conforme art. 28, parágrafos 3º e 4º.' }
    ]
  };

  function getCstOptions() {
    return CST_OPTIONS.slice();
  }

  function getCclasstribList(cst) {
    return (CCLASSTRIB_BY_CST[cst] || []).slice();
  }

  function findCclasstrib(cst, codigo) {
    return getCclasstribList(cst).filter(function (c) { return c.codigo === codigo; })[0] || null;
  }

  function getFieldConfig(cst) {
    var config = FIELD_CONFIG_BY_CST[cst];
    return config ? { cbs: config.cbs.slice(), ibs: config.ibs.slice() } : { cbs: [], ibs: [] };
  }

  window.NiveloIbsCbs = {
    getCstOptions: getCstOptions,
    getCclasstribList: getCclasstribList,
    findCclasstrib: findCclasstrib,
    getFieldConfig: getFieldConfig
  };
})();
