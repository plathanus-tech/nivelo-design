(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Dropdown genérico (mesmo padrão já usado em dashboard.js/
  // cadastros.js: wrapper/trigger/menu/option/open, reimplementado em JS
  // puro por cima da estrutura real do componente Dropdown). ----------
  function initDropdown(root, onChange) {
    var trigger = root.querySelector('[data-dropdown-trigger]');
    var valueEl = root.querySelector('[data-dropdown-value]');
    var menu = root.querySelector('[data-dropdown-menu]');

    // Menu reposicionado via JS em `position:fixed` (inline, só nesta
    // instância — Dropdown.module.css/Dropdown.tsx continuam com o
    // `position:absolute` padrão intocados, o componente React real não
    // tem esse problema resolvido aqui de propósito, ver rules.md) sempre
    // que abre: escapa do `overflow:hidden` de qualquer `.card`/container
    // ancestral (mesma técnica já usada no Popover/tooltip da Sidebar) e
    // nunca deixa a caixa sair da tela, abrindo pra CIMA quando não há
    // espaço suficiente abaixo (`maxHeight` sempre recalculado pro espaço
    // disponível real, nunca corta a caixa, só limita quantos itens cabem
    // sem rolar — `overflow-y:auto` do próprio `.menu` cuida do resto).
    function positionMenu() {
      var rect = trigger.getBoundingClientRect();
      var margin = 8;
      var preferredMaxHeight = 240;
      var spaceBelow = window.innerHeight - rect.bottom - margin;
      var spaceAbove = rect.top - margin;
      menu.style.position = 'fixed';
      menu.style.left = rect.left + 'px';
      menu.style.width = rect.width + 'px';
      if (spaceBelow < 160 && spaceAbove > spaceBelow) {
        menu.style.top = 'auto';
        menu.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
        menu.style.maxHeight = Math.min(preferredMaxHeight, spaceAbove) + 'px';
      } else {
        menu.style.bottom = 'auto';
        menu.style.top = (rect.bottom + 4) + 'px';
        menu.style.maxHeight = Math.min(preferredMaxHeight, spaceBelow) + 'px';
      }
    }

    function close() {
      root.classList.remove('open');
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    }
    function open() {
      if (trigger.disabled) return;
      root.classList.add('open');
      positionMenu();
      window.addEventListener('scroll', close, true);
      window.addEventListener('resize', close);
    }

    function selectOption(optionEl) {
      var existing = Array.prototype.slice.call(menu.querySelectorAll('.option'));
      existing.forEach(function (o) { o.classList.remove('selected'); });
      optionEl.classList.add('selected');
      valueEl.textContent = optionEl.textContent;
      valueEl.classList.remove('placeholder');
      root.dataset.value = optionEl.dataset.value;
      close();
      if (onChange) onChange(optionEl.dataset.value, optionEl.textContent);
    }

    trigger.addEventListener('click', function () {
      if (root.classList.contains('open')) close(); else open();
    });

    menu.addEventListener('click', function (event) {
      var optionEl = event.target.closest('.option');
      if (!optionEl) return;
      selectOption(optionEl);
    });

    document.addEventListener('click', function (event) {
      if (!root.contains(event.target)) close();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
    });

    return { selectOption: selectOption, root: root, setOptions: function (html) { menu.innerHTML = html; } };
  }

  // ---------- Dropdown multi-seleção (Tipo: Cliente/Fornecedor/
  // Transportadora, uma pessoa/empresa pode ter mais de um papel) — mesma
  // estrutura visual/posicionamento de `initDropdown()` acima (copiado
  // deliberadamente em vez de generalizar a função única: o comportamento
  // realmente diverge — o menu não fecha ao selecionar, e o valor vira uma
  // lista de tags dentro do próprio trigger, não um texto único). ----------
  function initMultiDropdown(root, onChange) {
    var trigger = root.querySelector('[data-dropdown-trigger]');
    var tagsEl = root.querySelector('[data-dropdown-value]');
    var menu = root.querySelector('[data-dropdown-menu]');
    var selected = [];

    function positionMenu() {
      var rect = trigger.getBoundingClientRect();
      var margin = 8;
      var preferredMaxHeight = 240;
      var spaceBelow = window.innerHeight - rect.bottom - margin;
      var spaceAbove = rect.top - margin;
      menu.style.position = 'fixed';
      menu.style.left = rect.left + 'px';
      menu.style.width = rect.width + 'px';
      if (spaceBelow < 160 && spaceAbove > spaceBelow) {
        menu.style.top = 'auto';
        menu.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
        menu.style.maxHeight = Math.min(preferredMaxHeight, spaceAbove) + 'px';
      } else {
        menu.style.bottom = 'auto';
        menu.style.top = (rect.bottom + 4) + 'px';
        menu.style.maxHeight = Math.min(preferredMaxHeight, spaceBelow) + 'px';
      }
    }

    function close() {
      root.classList.remove('open');
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    }
    function open() {
      if (trigger.disabled) return;
      root.classList.add('open');
      positionMenu();
      window.addEventListener('scroll', close, true);
      window.addEventListener('resize', close);
    }

    function renderTags() {
      if (!selected.length) {
        tagsEl.innerHTML = '';
        tagsEl.classList.add('placeholder');
        tagsEl.textContent = tagsEl.dataset.placeholder;
        return;
      }
      tagsEl.classList.remove('placeholder');
      tagsEl.innerHTML = selected.map(function (opt) {
        return '<span class="novo-cadastro-tag">' + opt.label +
          '<button type="button" class="novo-cadastro-tag-remove" data-remove-value="' + opt.value + '" aria-label="Remover ' + opt.label + '"><i data-lucide="x" width="12" height="12"></i></button></span>';
      }).join('');
      if (window.lucide) lucide.createIcons();
    }

    function toggleValue(value) {
      var optionEl = menu.querySelector('.option[data-value="' + value + '"]');
      if (!optionEl) return;
      var index = selected.map(function (o) { return o.value; }).indexOf(value);
      if (index === -1) {
        optionEl.classList.add('selected');
        selected.push({ value: value, label: optionEl.textContent.trim() });
      } else {
        optionEl.classList.remove('selected');
        selected.splice(index, 1);
      }
      renderTags();
      root.classList.remove('error');
      if (onChange) onChange(selected.map(function (o) { return o.value; }));
    }

    function selectValues(values) {
      Array.prototype.slice.call(menu.querySelectorAll('.option')).forEach(function (o) { o.classList.remove('selected'); });
      selected = [];
      (values || []).forEach(function (value) {
        var optionEl = menu.querySelector('.option[data-value="' + value + '"]');
        if (!optionEl) return;
        optionEl.classList.add('selected');
        selected.push({ value: value, label: optionEl.textContent.trim() });
      });
      renderTags();
      if (onChange) onChange(selected.map(function (o) { return o.value; }));
    }

    function getValues() { return selected.map(function (o) { return o.value; }); }

    trigger.addEventListener('click', function () {
      if (root.classList.contains('open')) close(); else open();
    });

    menu.addEventListener('click', function (event) {
      var optionEl = event.target.closest('.option');
      if (!optionEl) return;
      toggleValue(optionEl.dataset.value);
    });

    // Remover uma tag direto no trigger (sem abrir o menu) — precisa de
    // `stopPropagation` pra não disparar o toggle open/close do trigger.
    tagsEl.addEventListener('click', function (event) {
      var removeBtn = event.target.closest('[data-remove-value]');
      if (!removeBtn) return;
      event.stopPropagation();
      toggleValue(removeBtn.dataset.removeValue);
    });

    document.addEventListener('click', function (event) {
      if (!root.contains(event.target)) close();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
    });

    return { selectValues: selectValues, getValues: getValues, root: root };
  }

  // ---------- Tooltip em `position:fixed` (JS), não mais CSS puro ----------
  // Necessário sempre que um tooltip pode abrir perto da borda de um `.card`
  // (Table.module.css, `overflow:hidden`) — a Sidebar já resolvia isso com
  // JS + `position:fixed` (ver interface-principal.js/rules.md), aqui é o
  // mesmo princípio aplicado a triggers isolados (não um único elemento
  // compartilhado, já que cada tip tem texto/posição própria). Também
  // resolve de vez o "duas tooltips ao mesmo tempo": a visibilidade agora é
  // 100% controlada por `style.opacity` inline (sempre vence contra CSS sem
  // `!important`), nunca pela regra `.wrapper:hover .tip` do
  // Tooltip.module.css — só o `trigger` explicitamente hovered/focado tem
  // seu PRÓPRIO `.tip` alterado.
  function initFixedTooltip(trigger, placement) {
    var tip = trigger.querySelector('.tip');
    if (!tip) return;

    function show() {
      var rect = trigger.getBoundingClientRect();
      var centerX = rect.left + rect.width / 2;
      tip.style.position = 'fixed';
      tip.style.left = centerX + 'px';
      tip.style.transform = 'translateX(-50%)';
      if (placement === 'bottom') {
        tip.style.top = (rect.bottom + 8) + 'px';
        tip.style.bottom = 'auto';
      } else {
        tip.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
        tip.style.top = 'auto';
      }
      tip.style.opacity = '1';

      // Trava nas bordas da viewport: garante que a caixa apareça inteira
      // mesmo perto da margem esquerda/direita da tela, mesmo que isso
      // descentralize um pouco a seta em relação ao alvo (prioridade:
      // visível por completo > perfeitamente centralizada).
      var margin = 8;
      var tipRect = tip.getBoundingClientRect();
      if (tipRect.left < margin) {
        tip.style.left = (centerX + (margin - tipRect.left)) + 'px';
      } else if (tipRect.right > window.innerWidth - margin) {
        tip.style.left = (centerX - (tipRect.right - (window.innerWidth - margin))) + 'px';
      }
    }

    function hide() {
      tip.style.opacity = '0';
    }

    trigger.addEventListener('mouseenter', show);
    trigger.addEventListener('mouseleave', hide);
    trigger.addEventListener('focus', show);
    trigger.addEventListener('blur', hide);
  }

  initFixedTooltip(document.getElementById('code-input-tip-trigger'), 'top');
  initFixedTooltip(document.getElementById('code-icon-tip-trigger'), 'top');

  // ---------- Código gerado automaticamente ----------
  // Sem backend neste protótipo: o "próximo número" é só um contador fixo em
  // memória, continuando a numeração fictícia já usada em cadastros.html
  // (maior existente: C-1003 / F-2003 / T-4002). Recalculado ao trocar o
  // campo "Tipo" (o prefixo do código reflete o tipo do cadastro).
  var CODE_PREFIX = { cliente: 'C', fornecedor: 'F', transportadora: 'T' };
  var NEXT_NUMBER = { cliente: 1004, fornecedor: 2004, transportadora: 4003 };
  var codeInput = document.getElementById('nc-code');

  // Com Tipo em multi-seleção, o código reflete o PRIMEIRO tipo marcado
  // (ordem de exibição do menu: Cliente > Fornecedor > Transportadora) —
  // só um prefixo cosmético, não uma regra de negócio real. Sem nenhum tipo
  // marcado (campo nasce em branco, ver abaixo), o código fica vazio até o
  // usuário escolher explicitamente.
  function updateCode(tipos) {
    var tipo = tipos && tipos[0];
    codeInput.value = tipo ? (CODE_PREFIX[tipo] + '-' + NEXT_NUMBER[tipo]) : '';
  }

  // ---------- Tipo (Cliente/Fornecedor/Transportadora, multi-seleção) ----------
  // Campo nasce SEM nenhuma seleção (pedido explícito: "o campo Tipo deve
  // iniciar em branco. Não selecionar automaticamente nenhum tipo.") — o
  // usuário precisa escolher pelo menos um tipo antes de salvar (ver
  // `runValidation()` abaixo).
  var tipoField = document.getElementById('tipo-field');
  var vehiclesSection = document.getElementById('vehicles-section');
  var tipoDropdown = initMultiDropdown(tipoField, function (values) {
    updateCode(values);
    vehiclesSection.hidden = values.indexOf('transportadora') === -1;
  });

  // ---------- Modo de edição: calculado cedo (via hash) porque a
  // renderização dos veículos (abaixo) já precisa saber se está editando um
  // cadastro existente ou criando um novo — Situação do veículo só aparece
  // no modo de edição (ver `vehicleCardHTML()`). ----------
  var stateMatch = location.hash.match(/state=([a-z]+)/);
  var demoState = stateMatch ? stateMatch[1] : null;
  var isEditMode = demoState === 'edit';

  // ---------- Tipo de pessoa (Física/Jurídica) → campo único de documento ----------
  // Um só campo (não dois campos alternando `hidden`): troca label,
  // placeholder, máscara E LIMPA o valor ao trocar de tipo (o dígito de CPF
  // não faz sentido reaproveitado como início de um CNPJ, então preservar o
  // valor ao trocar só confundiria o usuário).
  var documentInput = document.getElementById('nc-document');
  var documentLabel = document.getElementById('nc-document-label');
  var documentType = 'fisica';

  var DOCUMENT_CONFIG = {
    fisica: { label: 'CPF', placeholder: '000.000.000-00', maxlength: '14' },
    juridica: { label: 'CNPJ', placeholder: '00.000.000/0000-00', maxlength: '18' }
  };

  function formatCPF(value) {
    var digits = value.replace(/\D/g, '').slice(0, 11);
    var out = digits.slice(0, 3);
    if (digits.length > 3) out += '.' + digits.slice(3, 6);
    if (digits.length > 6) out += '.' + digits.slice(6, 9);
    if (digits.length > 9) out += '-' + digits.slice(9, 11);
    return out;
  }

  function formatCNPJ(value) {
    var digits = value.replace(/\D/g, '').slice(0, 14);
    var out = digits.slice(0, 2);
    if (digits.length > 2) out += '.' + digits.slice(2, 5);
    if (digits.length > 5) out += '.' + digits.slice(5, 8);
    if (digits.length > 8) out += '/' + digits.slice(8, 12);
    if (digits.length > 12) out += '-' + digits.slice(12, 14);
    return out;
  }

  function formatDocument(value) {
    return documentType === 'juridica' ? formatCNPJ(value) : formatCPF(value);
  }

  function setDocumentType(value) {
    documentType = value;
    var config = DOCUMENT_CONFIG[value];
    documentLabel.textContent = config.label;
    documentInput.setAttribute('placeholder', config.placeholder);
    documentInput.setAttribute('maxlength', config.maxlength);
    documentInput.value = '';
  }

  var pessoaTipoDropdown = initDropdown(document.getElementById('pessoa-tipo-field'), function (value) {
    setDocumentType(value);
  });

  documentInput.addEventListener('input', function () {
    this.value = formatDocument(this.value);
  });

  // ---------- Contribuinte ----------
  var contribuinteDropdown = initDropdown(document.getElementById('contribuinte-field'));

  function formatPhone(value) {
    var digits = value.replace(/\D/g, '').slice(0, 11);
    var out = digits;
    if (digits.length > 0) out = '(' + digits.slice(0, 2);
    if (digits.length >= 2) out += ') ' + digits.slice(2, digits.length > 10 ? 7 : 6);
    if (digits.length > 6) out += '-' + digits.slice(digits.length > 10 ? 7 : 6, 11);
    return out;
  }
  document.getElementById('nc-phone').addEventListener('input', function () {
    this.value = formatPhone(this.value);
  });

  // ---------- Endereço: Estado/Cidade (dropdowns dependentes) + CEP ----------
  // Dados fictícios de exemplo (sem backend neste protótipo): cobre as 27
  // UFs, cada uma com uma amostra representativa de cidades (não é uma base
  // exaustiva de municípios — em produção isso viria de uma API real, ex.
  // IBGE). Suficiente pra demonstrar a dependência Estado → Cidade de verdade.
  var STATES = [
    { uf: 'AC', name: 'Acre' }, { uf: 'AL', name: 'Alagoas' }, { uf: 'AP', name: 'Amapá' },
    { uf: 'AM', name: 'Amazonas' }, { uf: 'BA', name: 'Bahia' }, { uf: 'CE', name: 'Ceará' },
    { uf: 'DF', name: 'Distrito Federal' }, { uf: 'ES', name: 'Espírito Santo' }, { uf: 'GO', name: 'Goiás' },
    { uf: 'MA', name: 'Maranhão' }, { uf: 'MT', name: 'Mato Grosso' }, { uf: 'MS', name: 'Mato Grosso do Sul' },
    { uf: 'MG', name: 'Minas Gerais' }, { uf: 'PA', name: 'Pará' }, { uf: 'PB', name: 'Paraíba' },
    { uf: 'PR', name: 'Paraná' }, { uf: 'PE', name: 'Pernambuco' }, { uf: 'PI', name: 'Piauí' },
    { uf: 'RJ', name: 'Rio de Janeiro' }, { uf: 'RN', name: 'Rio Grande do Norte' }, { uf: 'RS', name: 'Rio Grande do Sul' },
    { uf: 'RO', name: 'Rondônia' }, { uf: 'RR', name: 'Roraima' }, { uf: 'SC', name: 'Santa Catarina' },
    { uf: 'SP', name: 'São Paulo' }, { uf: 'SE', name: 'Sergipe' }, { uf: 'TO', name: 'Tocantins' }
  ];

  var CITIES_BY_UF = {
    AC: ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira'],
    AL: ['Maceió', 'Arapiraca', 'Palmeira dos Índios'],
    AP: ['Macapá', 'Santana', 'Laranjal do Jari'],
    AM: ['Manaus', 'Parintins', 'Itacoatiara'],
    BA: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Barreiras'],
    CE: ['Fortaleza', 'Juazeiro do Norte', 'Sobral'],
    DF: ['Brasília'],
    ES: ['Vitória', 'Vila Velha', 'Cariacica', 'Linhares'],
    GO: ['Goiânia', 'Anápolis', 'Rio Verde'],
    MA: ['São Luís', 'Imperatriz', 'Caxias'],
    MT: ['Cuiabá', 'Rondonópolis', 'Sinop'],
    MS: ['Campo Grande', 'Dourados', 'Três Lagoas'],
    MG: ['Belo Horizonte', 'Uberlândia', 'Juiz de Fora', 'Uberaba'],
    PA: ['Belém', 'Ananindeua', 'Santarém'],
    PB: ['João Pessoa', 'Campina Grande', 'Patos'],
    PR: ['Curitiba', 'Londrina', 'Maringá', 'Cascavel'],
    PE: ['Recife', 'Caruaru', 'Petrolina'],
    PI: ['Teresina', 'Parnaíba', 'Picos'],
    RJ: ['Rio de Janeiro', 'Niterói', 'Campos dos Goytacazes', 'Petrópolis'],
    RN: ['Natal', 'Mossoró', 'Parnamirim'],
    RS: ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Santa Maria'],
    RO: ['Porto Velho', 'Ji-Paraná', 'Ariquemes'],
    RR: ['Boa Vista', 'Rorainópolis'],
    SC: ['Florianópolis', 'Joinville', 'Blumenau', 'Chapecó'],
    SP: ['São Paulo', 'Campinas', 'Ribeirão Preto', 'Sorocaba', 'São José do Rio Preto'],
    SE: ['Aracaju', 'Nossa Senhora do Socorro', 'Itabaiana'],
    TO: ['Palmas', 'Araguaína', 'Gurupi']
  };

  var UF_LIST = STATES.map(function (s) { return s.uf; });

  var estadoDropdown = initDropdown(document.getElementById('estado-field'), function (uf) {
    setCidadeOptions(uf);
  });
  estadoDropdown.setOptions(STATES.map(function (s) {
    return '<div class="option" data-value="' + s.uf + '">' + s.name + ' (' + s.uf + ')</div>';
  }).join(''));

  var cidadeFieldEl = document.getElementById('cidade-field');
  var cidadeDropdown = initDropdown(cidadeFieldEl);
  var cidadeTrigger = cidadeFieldEl.querySelector('[data-dropdown-trigger]');
  var cidadeValueEl = cidadeFieldEl.querySelector('[data-dropdown-value]');

  function setCidadeOptions(uf, preferredCity) {
    var cities = (CITIES_BY_UF[uf] || []).slice();
    // A amostra de cidades por UF é pequena/representativa, não exaustiva
    // (ver comentário acima) — se a cidade preferida (vinda do ViaCEP ou de
    // um registro existente em modo de edição) não estiver na amostra,
    // ela é adicionada como mais uma opção em vez de silenciosamente não
    // selecionar nada. Sem isso, editar um cadastro cuja cidade não está
    // nas ~3-5 cidades de exemplo da UF deixaria o campo Cidade vazio,
    // mesmo o dado existindo de verdade no registro.
    if (preferredCity && !cities.some(function (c) { return c.toLowerCase() === preferredCity.toLowerCase(); })) {
      cities.push(preferredCity);
    }
    cidadeDropdown.setOptions(cities.map(function (city) {
      return '<div class="option" data-value="' + city + '">' + city + '</div>';
    }).join(''));
    cidadeTrigger.disabled = false;
    cidadeValueEl.textContent = 'Selecione a cidade';
    cidadeValueEl.classList.add('placeholder');
    delete cidadeFieldEl.dataset.value;

    if (preferredCity) {
      var match = cities.filter(function (c) { return c.toLowerCase() === preferredCity.toLowerCase(); })[0];
      if (match) {
        var optionEl = cidadeFieldEl.querySelector('.option[data-value="' + match + '"]');
        if (optionEl) cidadeDropdown.selectOption(optionEl);
      }
    }
  }

  // ---------- CEP: máscara + preenchimento automático (ViaCEP) ----------
  // Mesma integração já usada em cadastro-endereco.js — só que aqui Estado/
  // Cidade são Dropdowns (não campos de texto), então o preenchimento
  // seleciona a opção correspondente em vez de escrever um valor solto.
  var cepInput = document.getElementById('nc-cep');
  var streetInput = document.getElementById('nc-street');
  var districtInput = document.getElementById('nc-district');

  function formatCEP(value) {
    var digits = value.replace(/\D/g, '').slice(0, 8);
    var out = digits.slice(0, 5);
    if (digits.length > 5) out += '-' + digits.slice(5, 8);
    return out;
  }

  function fillIfEmpty(input, value) {
    if (!value || input.value.trim()) return;
    input.value = value;
  }

  function lookupCEP(digits) {
    fetch('https://viacep.com.br/ws/' + digits + '/json/')
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (!data || data.erro) return;
        fillIfEmpty(streetInput, data.logradouro);
        fillIfEmpty(districtInput, data.bairro);

        if (data.uf && !estadoDropdown.root.dataset.value) {
          var ufOption = estadoDropdown.root.querySelector('.option[data-value="' + data.uf + '"]');
          if (ufOption) {
            estadoDropdown.selectOption(ufOption);
            setCidadeOptions(data.uf, data.localidade);
          }
        }
      })
      .catch(function () {
        // Falha na consulta (offline, CEP inexistente etc.): os campos
        // seguem vazios/editáveis pra preenchimento manual, sem travar o fluxo.
      });
  }

  cepInput.addEventListener('input', function () {
    cepInput.value = formatCEP(cepInput.value);
    var digits = cepInput.value.replace(/\D/g, '');
    if (digits.length === 8) lookupCEP(digits);
  });

  // ---------- Cadastro de veículos (só Transportadora) ----------
  // Estrutura de dados de verdade: Transportadora → muitos veículos → cada
  // veículo possui de 1 a 3 placas (nunca 3 campos fixos de placa soltos no
  // cadastro principal). `vehicles` é a fonte da verdade em memória; o DOM
  // é só a renderização dela.
  var vehiclesListEl = document.getElementById('vehicles-list');
  var vehiclesEmptyEl = document.getElementById('vehicles-empty');
  var addVehicleBtn = document.getElementById('add-vehicle-btn');
  var vehicles = [];
  var vehicleIdSeq = 0;
  var plateIdSeq = 0;

  function addVehicle() {
    vehicleIdSeq += 1;
    plateIdSeq += 1;
    vehicles.push({
      id: vehicleIdSeq,
      situacao: 'ativo',
      descricao: '',
      plates: [{ id: plateIdSeq, value: '', uf: '' }]
    });
    renderVehicles();
  }

  function removeVehicle(vehicleId) {
    vehicles = vehicles.filter(function (v) { return v.id !== vehicleId; });
    renderVehicles();
  }

  // Carrega veículos/placas de um registro existente (modo de edição) — não
  // reaproveita `addVehicle()` porque aqui os dados já vêm prontos (situação
  // + placas reais), em vez de um veículo novo vazio.
  function loadVehicles(vehiclesData) {
    vehicles = (vehiclesData || []).map(function (v) {
      var plates = (v.plates && v.plates.length) ? v.plates : [{ value: '', uf: '' }];
      return {
        id: ++vehicleIdSeq,
        situacao: v.situacao || 'ativo',
        descricao: v.descricao || '',
        plates: plates.map(function (p) {
          return { id: ++plateIdSeq, value: p.value || '', uf: p.uf || '' };
        })
      };
    });
    renderVehicles();
  }

  function addPlate(vehicleId) {
    var vehicle = vehicles.filter(function (v) { return v.id === vehicleId; })[0];
    if (!vehicle || vehicle.plates.length >= 3) return;
    plateIdSeq += 1;
    vehicle.plates.push({ id: plateIdSeq, value: '', uf: '' });
    renderVehicles();
  }

  function removePlate(vehicleId, plateId) {
    var vehicle = vehicles.filter(function (v) { return v.id === vehicleId; })[0];
    if (!vehicle || vehicle.plates.length <= 1) return;
    vehicle.plates = vehicle.plates.filter(function (p) { return p.id !== plateId; });
    renderVehicles();
  }

  function formatPlate(value) {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
  }

  function ufOptionsHTML(selectedUf) {
    return UF_LIST.map(function (uf) {
      return '<div class="option' + (uf === selectedUf ? ' selected' : '') + '" data-value="' + uf + '">' + uf + '</div>';
    }).join('');
  }

  // `removable` agora depende só da CONTAGEM de placas do veículo (mais de
  // 1), não da posição — a Placa 1 também precisa ficar removível assim que
  // houver uma 2ª/3ª placa (antes só as placas 2/3 tinham botão de remover,
  // então a 1ª nunca podia ser excluída mesmo com outras já cadastradas).
  function plateRowHTML(vehicle, plate, index, removable) {
    var rowClass = 'novo-cadastro-plate-row' + (removable ? '' : ' novo-cadastro-plate-row-single');
    var label = 'Placa ' + (index + 1) + (index === 0 ? '' : ' (opcional)');
    return (
      '<div class="' + rowClass + '" data-plate-id="' + plate.id + '">' +
        '<div class="wrapper">' +
          '<label class="label" for="plate-input-' + plate.id + '">' + label + '</label>' +
          '<div class="inputWrap">' +
            '<input class="input" type="text" id="plate-input-' + plate.id + '" data-plate-value value="' + plate.value + '" placeholder="ABC1D23" maxlength="7" />' +
          '</div>' +
        '</div>' +
        '<div class="wrapper novo-cadastro-dropdown" data-plate-uf-field data-value="' + plate.uf + '">' +
          '<label class="label">UF</label>' +
          '<button type="button" class="trigger" data-dropdown-trigger>' +
            '<span class="' + (plate.uf ? '' : 'placeholder') + '" data-dropdown-value>' + (plate.uf || 'UF') + '</span>' +
            '<span class="chevron"><i data-lucide="chevron-down" width="16" height="16"></i></span>' +
          '</button>' +
          '<div class="menu" data-dropdown-menu>' + ufOptionsHTML(plate.uf) + '</div>' +
        '</div>' +
        (removable
          ? '<div class="novo-cadastro-plate-remove-cell">' +
              '<span class="label" aria-hidden="true">&nbsp;</span>' +
              '<button type="button" class="actionBtn novo-cadastro-plate-remove" data-remove-plate aria-label="Remover placa"><i data-lucide="x" width="16" height="16"></i></button>' +
            '</div>'
          : '') +
      '</div>'
    );
  }

  // Situação do veículo só aparece durante a EDIÇÃO de uma transportadora
  // existente (`isEditMode`) — no cadastro inicial (criação), a Situação
  // fica fora do formulário por completo (pedido explícito), mostrando só
  // os campos necessários pra criar o veículo (Placa/UF/Descrição). O
  // objeto `vehicle` continua guardando `situacao` (default 'ativo') mesmo
  // quando o campo não é exibido, pra não perder o dado se a tela virar
  // edição depois (ex.: reentrar via `#state=edit`).
  function vehicleCardHTML(vehicle, position) {
    var removablePlates = vehicle.plates.length > 1;
    var situacaoHTML = isEditMode
      ? ('<div class="wrapper novo-cadastro-dropdown novo-cadastro-vehicle-situacao" data-situacao-field data-value="' + vehicle.situacao + '">' +
          '<span class="label">Situação</span>' +
          '<button type="button" class="trigger" data-dropdown-trigger>' +
            '<span data-dropdown-value>' + (vehicle.situacao === 'ativo' ? 'Ativo' : 'Inativo') + '</span>' +
            '<span class="chevron"><i data-lucide="chevron-down" width="16" height="16"></i></span>' +
          '</button>' +
          '<div class="menu" data-dropdown-menu>' +
            '<div class="option' + (vehicle.situacao === 'ativo' ? ' selected' : '') + '" data-value="ativo">Ativo</div>' +
            '<div class="option' + (vehicle.situacao === 'inativo' ? ' selected' : '') + '" data-value="inativo">Inativo</div>' +
          '</div>' +
        '</div>')
      : '';
    return (
      '<div class="card novo-cadastro-vehicle" data-vehicle-id="' + vehicle.id + '">' +
        '<div class="novo-cadastro-vehicle-header">' +
          '<h3 class="novo-cadastro-vehicle-name text-subtitle-s">Veículo ' + position + '</h3>' +
          '<span class="novo-cadastro-remove-vehicle-tooltip" data-remove-vehicle-tooltip>' +
            '<button type="button" class="actionBtn actionDanger" data-remove-vehicle aria-label="Remover veículo">' +
              '<i data-lucide="trash-2" width="16" height="16"></i>' +
            '</button>' +
            '<span class="tip text-body-xs bottom">' +
              '<span class="arrow"></span>' +
              'Remover veículo' +
            '</span>' +
          '</span>' +
        '</div>' +
        situacaoHTML +
        '<div>' +
          vehicle.plates.map(function (plate, index) { return plateRowHTML(vehicle, plate, index, removablePlates); }).join('') +
          '<button type="button" class="btn secondary sm hasLeft novo-cadastro-add-plate" data-add-plate' + (vehicle.plates.length >= 3 ? ' hidden' : '') + '>' +
            '<span class="icon"><i data-lucide="plus" width="14" height="14"></i></span>' +
            'Adicionar outra placa' +
          '</button>' +
        '</div>' +
        '<div class="wrapper" data-descricao-field>' +
          '<label class="label" for="vehicle-descricao-' + vehicle.id + '">Descrição</label>' +
          '<div class="inputWrap">' +
            '<input class="input" type="text" id="vehicle-descricao-' + vehicle.id + '" data-descricao-value value="' + vehicle.descricao + '" placeholder="Ex.: Caminhão graneleiro Mercedes" />' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderVehicles() {
    vehiclesEmptyEl.hidden = vehicles.length > 0;
    vehiclesListEl.innerHTML = vehicles.map(function (vehicle, index) {
      return vehicleCardHTML(vehicle, index + 1);
    }).join('');

    if (window.lucide) lucide.createIcons();

    vehicles.forEach(function (vehicle) {
      var card = vehiclesListEl.querySelector('[data-vehicle-id="' + vehicle.id + '"]');

      var situacaoField = card.querySelector('[data-situacao-field]');
      if (situacaoField) {
        initDropdown(situacaoField, function (value) {
          vehicle.situacao = value;
        });
      }

      var descricaoInput = card.querySelector('[data-descricao-value]');
      descricaoInput.addEventListener('input', function () {
        vehicle.descricao = descricaoInput.value;
      });

      vehicle.plates.forEach(function (plate) {
        var row = card.querySelector('[data-plate-id="' + plate.id + '"]');
        var input = row.querySelector('[data-plate-value]');
        input.addEventListener('input', function () {
          input.value = formatPlate(input.value);
          plate.value = input.value;
        });
        initDropdown(row.querySelector('[data-plate-uf-field]'), function (value) {
          plate.uf = value;
        });
        var removeBtn = row.querySelector('[data-remove-plate]');
        if (removeBtn) {
          removeBtn.addEventListener('click', function () { removePlate(vehicle.id, plate.id); });
        }
      });

      card.querySelector('[data-add-plate]').addEventListener('click', function () { addPlate(vehicle.id); });
      card.querySelector('[data-remove-vehicle]').addEventListener('click', function () { removeVehicle(vehicle.id); });
      initFixedTooltip(card.querySelector('[data-remove-vehicle-tooltip]'), 'bottom');
    });
  }

  addVehicleBtn.addEventListener('click', addVehicle);
  renderVehicles();

  // ---------- Validação + envio ----------
  var form = document.getElementById('novo-cadastro-form');
  var nameField = document.getElementById('name-field');
  var nameInput = document.getElementById('nc-name');

  function setNameError(hasError) {
    nameField.classList.toggle('error', hasError);
  }
  setNameError(false);

  nameInput.addEventListener('input', function () {
    if (nameField.classList.contains('error') && nameInput.value.trim()) setNameError(false);
  });

  // Validação isolada numa função própria (não só dentro do handler de
  // submit) pra poder ser acionada também pelos estados de demonstração
  // `#state=required`/`#state=vehiclesinvalid` abaixo, sem precisar simular
  // um clique real no botão "Salvar cadastro".
  function runValidation() {
    var hasError = !nameInput.value.trim();
    setNameError(hasError);

    // Tipo nasce em branco (pedido explícito) — o usuário precisa escolher
    // pelo menos um tipo antes de salvar, senão nem o Código (que depende
    // do tipo) faria sentido.
    var tipoInvalid = tipoDropdown.getValues().length === 0;
    tipoField.classList.toggle('error', tipoInvalid);

    // Transportadora: cada veículo precisa de Placa 1 preenchida + UF.
    var vehiclesInvalid = false;
    if (!vehiclesSection.hidden) {
      vehicles.forEach(function (vehicle) {
        var firstPlate = vehicle.plates[0];
        var row = vehiclesListEl.querySelector('[data-plate-id="' + firstPlate.id + '"]');
        var invalid = !firstPlate.value.trim() || !firstPlate.uf;
        row.classList.toggle('novo-cadastro-plate-row-invalid', invalid);
        if (invalid) vehiclesInvalid = true;
      });
    }

    return !hasError && !tipoInvalid && !vehiclesInvalid;
  }

  // ---------- Estados de demonstração via #state= ----------
  // `transportadora`: pré-seleciona Tipo = Transportadora (revela a seção de
  // veículos) e já adiciona um veículo de exemplo, só pra facilitar
  // visualizar esse estado direto pelo prototype-nav sem precisar interagir
  // primeiro. `required`/`vehiclesinvalid`: aciona a validação sem navegar,
  // só pra exibir os estados de erro direto pelo prototype-nav. `edit`: modo
  // de edição (`stateMatch`/`demoState`/`isEditMode` já calculados mais
  // acima, antes da renderização dos veículos).

  // ---------- Atalho "+ Cadastrar novo fornecedor"/"+ Cadastrar novo
  // cliente" (Nova Conta a Pagar / Nova Conta a Receber) ----------
  // Query string (não hash, que já é usado pro mecanismo `#state=` acima):
  // `?tipo=fornecedor|cliente` pré-seleciona o Tipo; `?return=` marca que o
  // submit deve voltar pra lá (com o cadastro persistido de verdade em
  // `NiveloCadastros`, ver `cadastros-data.js`) em vez do fluxo padrão
  // (toast + `cadastros.html`). Só se aplica à criação — nunca sobrescreve
  // um `#state=edit` real. Mapa genérico — cada entrada é a tela de origem
  // + a chave de sessionStorage que ela lê ao voltar (ver
  // nova-conta-pagar.js/nova-conta-receber.js).
  var RETURN_TARGETS = {
    'nova-conta-pagar': { screen: 'nova-conta-pagar.html', sessionKey: 'nivelo.novacontapagar.fornecedor-criado' },
    'nova-conta-receber': { screen: 'nova-conta-receber.html', sessionKey: 'nivelo.novacontareceber.cliente-criado' },
    'nova-conta-receber-v2': { screen: 'nova-conta-receber-v2.html', sessionKey: 'nivelo.novacontareceberv2.cliente-criado' }
  };

  var urlParams = new URLSearchParams(location.search);
  var preselectTipo = urlParams.get('tipo');
  var returnTarget = urlParams.get('return');
  var returnConfig = RETURN_TARGETS[returnTarget] || null;

  if (!isEditMode && preselectTipo) {
    tipoDropdown.selectValues([preselectTipo]);
  }
  if (!isEditMode && returnConfig) {
    // "Cancelar"/"← Voltar" também devem voltar pra tela de origem nesse
    // contexto, não pra listagem de Cadastro (que nem foi de onde o
    // usuário veio).
    document.getElementById('novo-cadastro-back-top').href = returnConfig.screen;
    document.getElementById('novo-cadastro-cancel').href = returnConfig.screen;
  }

  if (demoState === 'transportadora' || demoState === 'vehiclesinvalid') {
    tipoDropdown.selectValues(['transportadora']);
    addVehicle();
  }

  if (demoState === 'required' || demoState === 'vehiclesinvalid') {
    runValidation();
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!runValidation()) {
      if (!nameInput.value.trim()) nameInput.focus();
      return;
    }

    // Atalho "+ Cadastrar novo fornecedor"/"+ Cadastrar novo cliente":
    // persiste o cadastro DE VERDADE em `NiveloCadastros` (não é mais só
    // cosmético como o resto deste fluxo) e volta pra tela de origem com o
    // cadastro recém-criado já selecionado, restaurando o resto do
    // formulário que o usuário tinha preenchido antes de sair (rascunho
    // salvo por nova-conta-pagar.js/nova-conta-receber.js antes de navegar
    // pra cá).
    if (!isEditMode && returnConfig) {
      var cidadeValue = cidadeFieldEl.dataset.value || '';
      var estadoValue = estadoDropdown.root.dataset.value || '';
      var novoCadastro = window.NiveloCadastros.add({
        nome: nameInput.value.trim(),
        tipo: tipoDropdown.getValues(),
        documento: documentInput.value.trim(),
        cidade: cidadeValue && estadoValue ? (cidadeValue + '/' + estadoValue) : (cidadeValue || estadoValue)
      });
      try {
        sessionStorage.setItem(returnConfig.sessionKey, novoCadastro.codigo);
      } catch (e) {}
      window.location.href = returnConfig.screen;
      return;
    }

    // Sem backend neste protótipo: "salvar" volta pra listagem já mostrando
    // o toast de sucesso correspondente (flag lido por cadastros.js, mesmo
    // mecanismo já usado no flag de sucesso do fluxo de recuperação de
    // senha) — mensagem diferente se for edição ou criação nova.
    try {
      sessionStorage.setItem(isEditMode ? 'nivelo.editcadastro.success' : 'nivelo.novocadastro.success', '1');
    } catch (e) {}
    window.location.href = 'cadastros.html';
  });

  // ---------- Modo de edição ("Editar cadastro") ----------
  // Reaproveita a MESMA tela/estrutura de Novo Cadastro (pedido explícito do
  // usuário: "reutilizar a mesma estrutura visual e os mesmos componentes"),
  // só troca o título e pré-preenche os campos com os dados do registro
  // selecionado em `cadastros.html` (que grava o payload em `sessionStorage`
  // antes de navegar pra cá, ver `openEditScreen()` em cadastros.js — payload
  // grande demais pra caber em hash/query string). Flag é lido uma única vez
  // e removido em seguida (mesmo padrão de "flag de uso único" já usado no
  // toast de sucesso) — recarregar a tela de edição perde os dados
  // pré-preenchidos, limitação aceitável de protótipo sem backend real.
  //
  // Fallback: se `#state=edit` for aberto sem um payload real em
  // `sessionStorage` (ex.: clicando direto nessa variante pelo
  // prototype-nav, sem passar pela listagem antes), usa um registro de
  // exemplo fixo — mesma ideia dos outros estados de demonstração, só pra
  // esse ficar navegável isoladamente também.
  var DEMO_EDIT_PAYLOAD = {
    codigo: 'CFT-7001', nome: 'Agropecuária Central Ltda', fantasia: 'Agro Central',
    tipo: ['fornecedor', 'transportadora'], pessoaTipo: 'juridica', documento: '55.666.777/0001-88',
    ie: '777.888.999.000', contribuinte: 'icms', telefone: '(16) 3232-1010', email: '',
    cep: '14010-000', rua: 'Avenida Presidente Vargas', numero: '3200', complemento: '',
    bairro: 'Centro', cidade: 'Ribeirão Preto', estado: 'SP',
    vehicles: [{ situacao: 'ativo', plates: [{ value: 'RIB7E56', uf: 'SP' }, { value: 'RIB8F67', uf: 'SP' }] }]
  };

  function applyEditPayload(payload) {
    document.getElementById('novo-cadastro-title').textContent = 'Editar cadastro';
    document.getElementById('novo-cadastro-submit').textContent = 'Salvar alterações';

    nameInput.value = payload.nome || '';
    document.getElementById('nc-fantasy').value = payload.fantasia || '';

    // Aceita tanto array (payload real, vindo de `cadastros.js`) quanto
    // string única (fallback, caso algo ainda mande o formato antigo).
    var tipoValues = payload.tipo ? (Array.isArray(payload.tipo) ? payload.tipo : [payload.tipo]) : [];
    if (tipoValues.length) tipoDropdown.selectValues(tipoValues);
    // `selectValues` acima já disparou `updateCode()` (gera um código NOVO
    // pro tipo selecionado) — sobrescreve com o código real do registro.
    if (payload.codigo) codeInput.value = payload.codigo;

    if (payload.pessoaTipo) {
      var pessoaOption = document.querySelector('#pessoa-tipo-field .option[data-value="' + payload.pessoaTipo + '"]');
      if (pessoaOption) pessoaTipoDropdown.selectOption(pessoaOption);
    }
    // Idem Código: selecionar Tipo de pessoa acima já LIMPA o campo de
    // documento (`setDocumentType()`) — reescreve com o valor real depois.
    documentInput.value = payload.documento || '';

    document.getElementById('nc-ie').value = payload.ie || '';
    if (payload.contribuinte) {
      var contribuinteOption = document.querySelector('#contribuinte-field .option[data-value="' + payload.contribuinte + '"]');
      if (contribuinteOption) contribuinteDropdown.selectOption(contribuinteOption);
    }
    document.getElementById('nc-phone').value = payload.telefone || '';
    document.getElementById('nc-email').value = payload.email || '';

    document.getElementById('nc-cep').value = payload.cep || '';
    streetInput.value = payload.rua || '';
    document.getElementById('nc-number').value = payload.numero || '';
    document.getElementById('nc-complement').value = payload.complemento || '';
    districtInput.value = payload.bairro || '';

    if (payload.estado) {
      var estadoOption = estadoDropdown.root.querySelector('.option[data-value="' + payload.estado + '"]');
      if (estadoOption) {
        estadoDropdown.selectOption(estadoOption);
        setCidadeOptions(payload.estado, payload.cidade);
      }
    }

    if (tipoValues.indexOf('transportadora') !== -1 && payload.vehicles && payload.vehicles.length) {
      loadVehicles(payload.vehicles);
    }
  }

  if (isEditMode) {
    var editPayload = null;
    try {
      var rawEditData = sessionStorage.getItem('nivelo.editcadastro.data');
      if (rawEditData) {
        editPayload = JSON.parse(rawEditData);
        sessionStorage.removeItem('nivelo.editcadastro.data');
      }
    } catch (e) {}
    applyEditPayload(editPayload || DEMO_EDIT_PAYLOAD);
  }
})();
