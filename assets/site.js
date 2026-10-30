(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const E = LM.esc;
  const ZAP = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3M12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4c-1-1.6-1.5-3.4-1.5-5.2 0-5.4 4.4-9.8 9.8-9.8 2.6 0 5.1 1 6.9 2.9 1.8 1.8 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8m8.4-18.2C18.1 1.3 15.2.1 12 .1 5.5.1.1 5.4.1 12c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.6c1.7.9 3.7 1.4 5.7 1.4 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.4"/></svg>';

  // ---------- topo e rodapé (iguais em todas as páginas) ----------
  const pagina = document.body.dataset.page;
  $('#topo').outerHTML = `
  <header class="top"><div class="wrap">
    <a href="index.html" class="logo" aria-label="Luiz Machado Curadoria Imobiliária"></a>
    <nav class="nav">
      <a href="imoveis.html" class="${pagina === 'catalogo' ? 'on' : ''}">Imóveis</a>
      <a href="index.html#bairros">Bairros</a>
      <a href="index.html#curadoria">Curadoria</a>
      <a href="index.html#vendidos">Vendidos</a>
      <a href="index.html#sobre">Sobre</a>
    </nav>
    <a class="btn" href="${LM.whats('Olá, Luiz! Vim pelo seu site e quero ajuda para encontrar um imóvel.')}" target="_blank">${ZAP} Falar com o Luiz</a>
    <button class="burger" aria-label="Menu"><span></span><span></span><span></span></button>
  </div></header>`;
  $('#rodape').outerHTML = `
  <footer><div class="wrap">
    <div>
      <div><span class="logo"></span><p style="margin-top:20px;max-width:340px">Curadoria de imóveis em Salvador e Litoral Norte. Escolher o imóvel certo não é sorte, é estratégia.</p></div>
      <div><h4>Contato</h4><a href="${LM.whats('Olá, Luiz!')}" target="_blank">(71) 9 9961-1500</a><a href="mailto:luizmj2010@gmail.com">luizmj2010@gmail.com</a><a href="https://instagram.com/luizimoveisba" target="_blank">@luizimoveisba</a></div>
      <div><h4>Navegar</h4><a href="imoveis.html">Todos os imóveis</a><a href="imoveis.html?regiao=Litoral%20Norte">Litoral Norte</a><a href="index.html#perfil">Me ajude a escolher</a><a href="admin.html">Área do corretor</a></div>
    </div>
    <div class="base"><span>Luiz Machado · CRECI-BA 31767</span><span>Site de demonstração feito pela Zync</span></div>
  </div></footer>
  <a class="zap-fixo" href="${LM.whats('Olá, Luiz! Vim pelo seu site.')}" target="_blank" aria-label="WhatsApp">${ZAP}</a>`;
  const top = $('.top');
  addEventListener('scroll', () => top.classList.toggle('scrolled', scrollY > 10), { passive: true });
  $('.burger').onclick = () => top.classList.toggle('aberto');

  // ---------- cartão de imóvel ----------
  function card(im) {
    const v = im.status === 'vendido';
    return `<a class="card rv ${v ? 'vendido' : ''}" href="imovel.html?id=${im.id}">
      <div class="ft"><img loading="lazy" src="${E(im.foto)}" alt="${E(im.tipo + ' em ' + im.bairro)}">
        <span class="cod">${E(im.cod)}</span>${v ? '<span class="selo">Vendido</span>' : im.status === 'reservado' ? '<span class="selo">Reservado</span>' : ''}</div>
      <div class="info"><div class="loc">${E(im.bairro)}</div>
        <h3>${E(LM.titulo(im))}</h3><div class="ch">${E(im.chamada || '')}</div>
        <div class="specs"><span>${im.area} m²</span>${im.suites ? `<span>${im.suites} suíte${im.suites > 1 ? 's' : ''}</span>` : ''}${im.vagas ? `<span>${im.vagas} vaga${im.vagas > 1 ? 's' : ''}</span>` : ''}</div>
        <div class="preco">${LM.brl(im.preco)}</div></div></a>`;
  }

  // ---------- revelar ao rolar ----------
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  const revelar = () => $$('.rv:not(.in)').forEach(el => io.observe(el));

  const todos = LM.imoveis();
  const ativos = todos.filter(i => i.status !== 'vendido');
  const FAIXAS = [['', 'Qualquer valor'], ['0-1000000', 'Até R$ 1 mi'], ['1000000-2000000', 'R$ 1 a 2 mi'], ['2000000-4000000', 'R$ 2 a 4 mi'], ['4000000-', 'Acima de R$ 4 mi']];
  const bairrosDe = lista => [...new Set(lista.map(i => i.bairro))].sort((a, b) => a.localeCompare(b));

  // ================= HOME =================
  if (pagina === 'home') {
    $('#n-ativos').textContent = ativos.length;
    $('#n-bairros').textContent = bairrosDe(ativos).length;
    setTimeout(() => $('.hero-fotos').classList.add('in'), 80);

    // busca
    const sel = $('#b-local');
    sel.innerHTML = '<option value="">Salvador e Litoral Norte</option>' +
      '<optgroup label="Região"><option value="r:Salvador">Salvador</option><option value="r:Lauro de Freitas">Lauro de Freitas</option><option value="r:Litoral Norte">Litoral Norte</option></optgroup>' +
      '<optgroup label="Bairro">' + bairrosDe(ativos).map(b => `<option value="b:${E(b)}">${E(b)}</option>`).join('') + '</optgroup>';
    $('#b-preco').innerHTML = FAIXAS.map(([v, t]) => `<option value="${v}">${t}</option>`).join('');
    $('#busca').onsubmit = e => {
      e.preventDefault();
      const p = new URLSearchParams(); const l = sel.value;
      if (l.startsWith('r:')) p.set('regiao', l.slice(2)); else if (l.startsWith('b:')) p.set('bairro', l.slice(2));
      if ($('#b-tipo').value) p.set('tipo', $('#b-tipo').value);
      if ($('#b-preco').value) p.set('preco', $('#b-preco').value);
      location.href = 'imoveis.html?' + p;
    };

    // faixa de bairros que anda com a rolagem
    const nomes = ['Horto Florestal', 'Caminho das Árvores', '<i>vista mar</i>', 'Jaguaribe', 'Busca Vida', '<i>nascente total</i>', 'Itacimirim', 'Patamares', '<i>porteira fechada</i>', 'Graça', 'Barra'];
    const tr = $('.faixa .trilho');
    tr.innerHTML = (nomes.map(n => `<span>${n}</span>`).join('')).repeat(3);
    const anda = () => { const r = tr.getBoundingClientRect(); tr.style.transform = `translateX(${-(innerHeight - r.top) * 0.45}px)`; };
    addEventListener('scroll', anda, { passive: true }); anda();

    // destaques: escolha do corretor (ids) — editável no painel
    const marcados = ativos.filter(i => i.destaque);
    const dest = (marcados.length ? marcados : [24, 40, 53, 22, 28, 47].map(id => ativos.find(i => i.id === id)).filter(Boolean)).slice(0, 6);
    $('#destaques').innerHTML = dest.map(card).join('');

    // bairros
    const fotoB = { 'Horto Florestal': 48, 'Caminho das Árvores': 17, 'Busca Vida': 53, 'Patamares': 22, 'Jaguaribe': 10, 'Itaigara': 3, 'Barra': 5, 'Graça': 43 };
    $('#lista-bairros').innerHTML = Object.entries(fotoB).map(([b, id]) => {
      const l = ativos.filter(i => i.bairro === b || (b === 'Barra' && i.bairro === 'Ladeira da Barra'));
      const min = Math.min(...l.map(i => i.preco || Infinity));
      const im = todos.find(i => i.id === id);
      return `<a class="bairro rv" href="imoveis.html?bairro=${encodeURIComponent(b)}"><img loading="lazy" src="${im.foto}" alt=""><b>${b}</b><span>${l.length} imóve${l.length > 1 ? 'is' : 'l'} · a partir de ${LM.brlCurto(min)}</span></a>`;
    }).join('');

    // vendidos
    $('#lista-vendidos').innerHTML = todos.filter(i => i.status === 'vendido').slice(0, 4).map(card).join('');

    // perfil -> CRM
    const bs = ['Horto Florestal', 'Caminho das Árvores', 'Pituba', 'Patamares', 'Jaguaribe', 'Barra', 'Graça', 'Busca Vida', 'Itacimirim'];
    $('#p-bairros').innerHTML = bs.map(b => `<label><input type="checkbox" value="${b}"><span>${b}</span></label>`).join('');
    $('#p-max').innerHTML = '<option value="1000000">Até R$ 1 milhão</option><option value="2000000" selected>Até R$ 2 milhões</option><option value="4000000">Até R$ 4 milhões</option><option value="15000000">Acima de R$ 4 milhões</option>';
    $('#form-perfil').onsubmit = e => {
      e.preventDefault();
      const f = e.target;
      const perfil = { bairros: $$('#p-bairros input:checked').map(i => i.value), max: +f.max.value, suites: +f.suites.value };
      const lead = LM.novoLead({ nome: f.nome.value.trim(), fone: f.fone.value.trim(), origem: 'Site', perfil, nota: 'Pediu curadoria pelo site. Prazo: ' + f.prazo.value + '.' });
      const top3 = ativos.map(im => [LM.combina(perfil, im), im]).filter(x => x[0] > 0).sort((a, b) => b[0] - a[0]).slice(0, 3);
      $('#ok-qtd').textContent = top3.length ? top3.length + ' imóveis da carteira já combinam com o que você procura.' : 'Vou procurar fora da carteira também.';
      $('#ok-zap').href = LM.whats(`Olá, Luiz! Sou ${lead.nome} e acabei de preencher meu perfil no site (${perfil.bairros.join(', ') || 'qualquer bairro'}, até ${LM.brl(perfil.max)}).`);
      $('.form').classList.add('enviado');
    };
  }

  // ================= CATÁLOGO =================
  if (pagina === 'catalogo') {
    const q = new URLSearchParams(location.search);
    const f = { regiao: $('#f-regiao'), bairro: $('#f-bairro'), tipo: $('#f-tipo'), preco: $('#f-preco'), suites: $('#f-suites'), ordem: $('#f-ordem') };
    f.regiao.innerHTML = '<option value="">Todas as regiões</option><option>Salvador</option><option>Lauro de Freitas</option><option>Litoral Norte</option>';
    f.tipo.innerHTML = '<option value="">Todos os tipos</option>' + [...new Set(todos.map(i => i.tipo))].map(t => `<option>${t}</option>`).join('');
    f.preco.innerHTML = FAIXAS.map(([v, t]) => `<option value="${v}">${t}</option>`).join('');
    f.suites.innerHTML = '<option value="">Suítes</option><option value="1">1+ suíte</option><option value="2">2+ suítes</option><option value="3">3+ suítes</option><option value="4">4+ suítes</option>';
    f.ordem.innerHTML = '<option value="rec">Mais recentes</option><option value="menor">Menor preço</option><option value="maior">Maior preço</option><option value="area">Maior área</option>';
    const encheBairros = () => {
      const r = f.regiao.value, atual = f.bairro.value;
      f.bairro.innerHTML = '<option value="">Todos os bairros</option>' + bairrosDe(ativos.filter(i => !r || i.cidade === r)).map(b => `<option>${E(b)}</option>`).join('');
      f.bairro.value = atual;
    };
    f.regiao.value = q.get('regiao') || ''; encheBairros();
    for (const k of ['bairro', 'tipo', 'preco', 'suites']) if (q.get(k)) f[k].value = q.get(k);
    if (q.get('bairro')) { const b = ativos.find(i => i.bairro === q.get('bairro')); if (b) { f.regiao.value = b.cidade; encheBairros(); f.bairro.value = q.get('bairro'); } }

    function aplica() {
      const [pmin, pmax] = (f.preco.value || '-').split('-').map(x => x ? +x : null);
      let l = ativos.filter(i => (!f.regiao.value || i.cidade === f.regiao.value)
        && (!f.bairro.value || i.bairro === f.bairro.value || (f.bairro.value === 'Barra' && i.bairro === 'Ladeira da Barra'))
        && (!f.tipo.value || i.tipo === f.tipo.value)
        && (pmin == null || (i.preco || 0) >= pmin) && (pmax == null || (i.preco && i.preco <= pmax))
        && (!f.suites.value || (i.suites || 0) >= +f.suites.value));
      const o = f.ordem.value;
      if (o === 'menor') l.sort((a, b) => (a.preco || 9e9) - (b.preco || 9e9));
      if (o === 'maior') l.sort((a, b) => (b.preco || 0) - (a.preco || 0));
      if (o === 'area') l.sort((a, b) => b.area - a.area);
      $('#n-res').textContent = l.length + (l.length === 1 ? ' imóvel' : ' imóveis');
      $('#resultado').innerHTML = l.length ? l.map(card).join('') : '';
      $('#vazio').style.display = l.length ? 'none' : 'block';
      revelar();
      const p = new URLSearchParams(); for (const k of ['regiao', 'bairro', 'tipo', 'preco', 'suites']) if (f[k].value) p.set(k, f[k].value);
      history.replaceState(null, '', '?' + p);
    }
    f.regiao.onchange = () => { encheBairros(); aplica(); };
    for (const k of ['bairro', 'tipo', 'preco', 'suites', 'ordem']) f[k].onchange = aplica;
    $('.limpar').onclick = () => { for (const k in f) f[k].selectedIndex = 0; encheBairros(); aplica(); };
    $('#vazio a').href = LM.whats('Olá, Luiz! Não achei no site o imóvel que procuro. Pode me ajudar?');
    aplica();
  }

  // ================= IMÓVEL =================
  if (pagina === 'imovel') {
    const im = LM.imovel(new URLSearchParams(location.search).get('id')) || ativos[0];
    LM.contarView(im.id);
    document.title = `${LM.titulo(im)} em ${im.bairro} · Luiz Machado`;
    const v = im.status === 'vendido';
    $('#imv').innerHTML = `
      <div class="migalha"><a href="imoveis.html">Imóveis</a> · <a href="imoveis.html?bairro=${encodeURIComponent(im.bairro)}">${E(im.bairro)}</a> · ${E(im.cod)}</div>
      <div class="imv-grid">
        <div>
          <div class="imv-foto"><img src="${E(im.foto)}" alt="">${im.reel ? `<a class="reel" href="${E(im.reel)}" target="_blank">▶ Assistir o tour em vídeo</a>` : ''}</div>
          <div class="desc"><h2>Sobre o imóvel</h2>${E(im.descricao || im.chamada || '')}</div>
          ${v ? '' : `<div class="simul"><h2>Simule o financiamento</h2>
            <div class="row">
              <label class="campo"><span>Entrada</span><select id="s-ent"><option value=".2">20%</option><option value=".3" selected>30%</option><option value=".4">40%</option><option value=".5">50%</option></select></label>
              <label class="campo"><span>Prazo</span><select id="s-prazo"><option value="240">20 anos</option><option value="360" selected>30 anos</option><option value="420">35 anos</option></select></label>
              <label class="campo"><span>Juros ao ano</span><select id="s-tx"><option value="10.5">10,5%</option><option value="11.5" selected>11,5%</option><option value="12.5">12,5%</option></select></label>
            </div>
            <small>Primeira parcela estimada (tabela SAC, sem seguros e taxas)</small><output id="s-out"></output>
            <small id="s-fin"></small></div>`}
        </div>
        <aside class="lado">
          <div class="eyebrow">${E(im.bairro)} · ${E(im.cidade)}</div>
          <h1>${E(LM.titulo(im))}</h1>
          <div class="ch">${E(im.chamada || '')}${im.condominio ? ' · ' + E(im.condominio) : ''}</div>
          <div class="preco" style="${v ? 'text-decoration:line-through;color:var(--muted)' : ''}">${LM.brl(im.preco)}</div>
          ${im.taxa_cond || im.iptu ? `<p style="color:var(--muted);font-size:14px">${im.taxa_cond ? 'Condomínio ' + LM.brl(im.taxa_cond) : ''}${im.taxa_cond && im.iptu ? ' · ' : ''}${im.iptu ? 'IPTU ' + LM.brl(im.iptu) : ''}</p>` : ''}
          ${v ? '<p style="color:var(--brass);font-weight:500">Este imóvel já foi vendido pelo Luiz.</p>' : ''}
          <div class="ficha"><div><b>${im.area}</b><span>m²</span></div><div><b>${im.quartos || '–'}</b><span>Quartos</span></div><div><b>${im.suites || '–'}</b><span>Suítes</span></div><div><b>${im.vagas || '–'}</b><span>Vagas</span></div></div>
          <a class="btn zap" target="_blank" href="${LM.whats(v ? `Olá, Luiz! Vi o ${im.cod} vendido no site. Tem algo parecido em ${im.bairro}?` : LM.msgImovel(im))}">${ZAP} ${v ? 'Quero algo parecido' : 'Quero saber mais'}</a>
          <button class="btn ghost" id="compart">Copiar link do imóvel</button>
          ${v ? '' : `<form class="visita" id="f-visita"><h3>Agendar uma visita</h3>
            <label class="campo"><span>Seu nome</span><input name="nome" required></label>
            <label class="campo"><span>WhatsApp</span><input name="fone" required inputmode="tel" placeholder="(71) 9 0000-0000"></label>
            <label class="campo"><span>Melhor dia</span><select name="dia"><option>Durante a semana</option><option>Sábado de manhã</option><option>Qualquer dia</option></select></label>
            <button class="btn" style="margin:0">Pedir visita</button></form>`}
        </aside>
      </div>`;
    $('#compart').onclick = e => { navigator.clipboard?.writeText(location.href); e.target.textContent = 'Link copiado'; };
    if (!v) {
      const calc = () => {
        const fin = im.preco * (1 - +$('#s-ent').value), n = +$('#s-prazo').value, i = Math.pow(1 + +$('#s-tx').value / 100, 1 / 12) - 1;
        $('#s-out').textContent = (fin / n + fin * i).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
        $('#s-fin').textContent = 'Valor financiado: ' + LM.brl(Math.round(fin));
      };
      if (im.preco) { $$('.simul select').forEach(s => s.onchange = calc); calc(); } else $('.simul').remove();
      $('#f-visita').onsubmit = e => {
        e.preventDefault(); const f = e.target;
        LM.novoLead({ nome: f.nome.value.trim(), fone: f.fone.value.trim(), origem: 'Site', etapa: 'visita', interesse: im.id, perfil: { bairros: [im.bairro], max: im.preco, suites: im.suites }, nota: 'Pediu visita pelo site (' + f.dia.value + ').' });
        f.innerHTML = `<h3>Pedido enviado ✓</h3><p style="color:var(--muted);font-size:14px">O Luiz vai te chamar no WhatsApp para confirmar o horário.</p>`;
      };
    }
    // parecidos
    const par = ativos.filter(i => i.id !== im.id).map(i => [(i.bairro === im.bairro ? 2 : 0) + (Math.abs((i.preco || 0) - (im.preco || 0)) < (im.preco || 1) * 0.35 ? 1 : 0), i]).sort((a, b) => b[0] - a[0]).slice(0, 3).map(x => x[1]);
    $('#parecidos').innerHTML = par.map(card).join('');
  }

  revelar();
})();
