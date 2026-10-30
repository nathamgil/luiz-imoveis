(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const E = LM.esc;
  const HOJE = new Date().toISOString().slice(0, 10);
  const ETAPAS = [['novo', 'Novos'], ['conversa', 'Em conversa'], ['visita', 'Visita marcada'], ['proposta', 'Proposta'], ['fechado', 'Fechado']];
  const toast = t => { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 2600); };
  const iniciais = n => n.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  const dataBR = s => s ? s.split('-').reverse().slice(0, 2).join('/') : '—';

  // ---------- login ----------
  const entrar = () => { $('#login').style.display = 'none'; $('#app').style.display = ''; try { sessionStorage.setItem('lm_in', '1'); } catch (e) {} ir(location.hash.slice(1) || 'geral'); };
  $('#entrar').onclick = entrar;
  try { if (sessionStorage.getItem('lm_in')) entrar(); } catch (e) {}

  // ---------- navegação ----------
  function ir(t) {
    if (!$('#t-' + t)) t = 'geral';
    $$('.menu button').forEach(b => b.classList.toggle('on', b.dataset.t === t));
    $$('.tela').forEach(s => s.classList.toggle('on', s.id === 't-' + t));
    history.replaceState(null, '', '#' + t);
    ({ geral, imoveis: tabela, crm: kanban, novo: () => {} })[t]();
    scrollTo(0, 0);
  }
  $$('.menu button').forEach(b => b.onclick = () => ir(b.dataset.t));
  document.addEventListener('click', e => { const b = e.target.closest('[data-ir]'); if (b) ir(b.dataset.ir); });

  function contaHoje() {
    const n = LM.leads().filter(l => l.etapa !== 'fechado' && l.proximo && l.proximo <= HOJE).length;
    $('#qt-hoje').textContent = n || ''; $('#qt-hoje').style.display = n ? '' : 'none';
    return n;
  }

  // ================= VISÃO GERAL =================
  function geral() {
    const h = new Date().getHours();
    $('#ola').textContent = (h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite') + ', Luiz';
    $('#hoje-txt').textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    const ims = LM.imoveis(), disp = ims.filter(i => i.status === 'disponivel'), leads = LM.leads();
    const ativos = leads.filter(l => l.etapa !== 'fechado'), nHoje = contaHoje();
    const vgv = disp.reduce((s, i) => s + (i.preco || 0), 0);
    const semana = leads.filter(l => l.criado >= new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10)).length;
    $('#kpis').innerHTML = [
      ['Imóveis à venda', disp.length, ims.filter(i => i.status === 'vendido').length + ' vendidos no site'],
      ['Carteira em valor', 'R$ ' + (vgv / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mi', 'soma dos disponíveis'],
      ['Clientes em andamento', ativos.length, semana + ' novos nesta semana'],
      ['Para responder hoje', nHoje, nHoje ? 'não deixe esfriar' : 'tudo em dia'],
    ].map(([a, b, c]) => `<div class="kpi"><span>${a}</span><b>${b}</b><small style="${a.startsWith('Para') && nHoje ? 'color:var(--red)' : ''}">${c}</small></div>`).join('');

    const tarefas = ativos.filter(l => l.proximo && l.proximo <= HOJE).sort((a, b) => a.proximo.localeCompare(b.proximo));
    $('#tarefas').innerHTML = tarefas.length ? tarefas.map(l => {
      const im = LM.imovel(l.interesse);
      return `<div class="tarefa"><span class="av">${iniciais(l.nome)}</span><div><b>${E(l.nome)}</b><span>${E(l.nota || '')}${im ? ' · ' + im.cod : ''}</span></div><button class="btn peq sec" data-lead="${l.id}">Abrir</button></div>`;
    }).join('') : '<p style="color:var(--muted)">Nenhum retorno pendente. 👌</p>';

    const orig = {}; leads.forEach(l => orig[l.origem] = (orig[l.origem] || 0) + 1);
    const max = Math.max(...Object.values(orig));
    $('#origens').innerHTML = Object.entries(orig).sort((a, b) => b[1] - a[1]).map(([o, n]) => `<div class="barra"><span>${E(o)}</span><i style="width:${n / max * 100}%;max-width:calc(100% - 140px)"></i><b>${n}</b></div>`).join('') +
      '<p style="font-size:13px;color:var(--muted);margin-top:14px">Todo contato do site entra aqui sozinho, com o imóvel que a pessoa viu.</p>';

    const vw = LM.views();
    const vistos = disp.map(i => [(vw[i.id] || 0) * 10 + ((i.id * 37) % 23), i]).sort((a, b) => b[0] - a[0]).slice(0, 4);
    $('#vistos').innerHTML = vistos.map(([n, i]) => `<div class="mini"><img src="${E(i.foto)}" alt=""><div><b>${E(i.bairro)}</b> · ${E(i.cod)}<span>${E(LM.titulo(i))} · ${LM.brlCurto(i.preco)}</span></div><b>${n}</b>&nbsp;<span style="font-size:12px;color:var(--muted)">visitas</span></div>`).join('');

    const reg = {}; disp.forEach(i => { reg[i.cidade] = reg[i.cidade] || [0, 0]; reg[i.cidade][0]++; reg[i.cidade][1] += i.preco || 0; });
    const mr = Math.max(...Object.values(reg).map(r => r[0]));
    $('#regioes').innerHTML = Object.entries(reg).map(([c, [n, v]]) => `<div class="barra"><span>${E(c)}</span><i style="width:${n / mr * 100}%;max-width:calc(100% - 210px);background:var(--brass)"></i><b>${n}</b>&nbsp;<span style="width:auto;color:var(--muted);font-size:13px">${LM.brlCurto(v)}</span></div>`).join('');
  }

  // ================= IMÓVEIS =================
  function tabela() {
    const q = $('#q').value.trim().toLowerCase(), st = $('#q-st').value;
    const l = LM.imoveis().filter(i => (!st || i.status === st) && (!q || [i.bairro, i.cod, i.condominio, i.tipo].join(' ').toLowerCase().includes(q)));
    $('#tabela').innerHTML = l.map(i => `<tr data-id="${i.id}">
      <td><img src="${E(i.foto)}" alt=""></td>
      <td><div class="t">${E(i.bairro)} · ${E(i.cod)}</div><div class="s">${E(LM.titulo(i))} · ${i.area} m²${i.condominio ? ' · ' + E(i.condominio) : ''}</div></td>
      <td style="white-space:nowrap">${LM.brl(i.preco)}</td>
      <td><select class="st ${i.status}" data-acao="status"><option value="disponivel" ${i.status === 'disponivel' ? 'selected' : ''}>Disponível</option><option value="reservado" ${i.status === 'reservado' ? 'selected' : ''}>Reservado</option><option value="vendido" ${i.status === 'vendido' ? 'selected' : ''}>Vendido</option></select></td>
      <td><button class="estrela ${i.destaque ? 'on' : ''}" data-acao="destaque" title="Mostrar na página inicial">★</button></td>
      <td><div class="acoes"><a class="btn peq sec" href="imovel.html?id=${i.id}" target="_blank">Ver</a><button class="btn peq sec" data-acao="link">Copiar link</button></div></td></tr>`).join('');
  }
  $('#q').oninput = tabela; $('#q-st').onchange = tabela;
  $('#tabela').addEventListener('change', e => {
    if (e.target.dataset.acao !== 'status') return;
    const id = +e.target.closest('tr').dataset.id, im = LM.imovel(id);
    im.status = e.target.value; LM.salvarImovel(im); e.target.className = 'st ' + im.status;
    toast(im.status === 'vendido' ? 'Marcado como vendido. Já aparece em "Vendidos" no site.' : 'Status atualizado no site.');
  });
  $('#tabela').addEventListener('click', e => {
    const b = e.target.closest('[data-acao]'); if (!b || b.tagName === 'SELECT') return;
    const im = LM.imovel(+b.closest('tr').dataset.id);
    if (b.dataset.acao === 'destaque') { im.destaque = !im.destaque; LM.salvarImovel(im); b.classList.toggle('on'); toast(im.destaque ? 'Entrou na seleção da página inicial.' : 'Saiu da seleção.'); }
    if (b.dataset.acao === 'link') { navigator.clipboard?.writeText(new URL('imovel.html?id=' + im.id, location.href).href); toast('Link copiado. É só colar no WhatsApp do cliente.'); }
  });

  // ================= CADASTRO RÁPIDO =================
  const BAIRROS = [...new Set((window.IMOVEIS_BASE || []).map(i => i.bairro).concat(['Alphaville Litoral Norte', 'Abrantes', 'Praia do Forte', 'Guarajuba', 'Stella Maris', 'Vila Laura', 'Brotas', 'Costa Azul', 'Stiep', 'Piatã', 'Itapuã', 'Vitória', 'Corredor da Vitória', 'Horto', 'Alphaville']))];
  const LN = ['Busca Vida', 'Itacimirim', 'Alphaville Litoral Norte', 'Abrantes', 'Praia do Forte', 'Guarajuba', 'Linha Verde'];
  const LF = ['Vilas do Atlântico', 'Buraquinho', 'Encontro das Águas', 'Jardim Aeroporto', 'Lauro de Freitas', 'Ipitanga'];
  const num = s => { if (!s) return null; s = s.replace(/\s/g, ''); s = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : (/^\d{1,3}(\.\d{3})+$/.test(s) ? s.replace(/\./g, '') : s); const n = parseFloat(s); return isNaN(n) ? null : n; };
  const TAGS = [['nascente', 'Nascente'], ['vista mar', 'Vista mar'], ['porteira fechada', 'Porteira fechada'], ['andar alto', 'Andar alto'], ['nunca habitado', 'Nunca habitado'], ['mobiliad', 'Mobiliado'], ['quitado', 'Quitado'], ['varanda gourmet', 'Varanda gourmet'], ['1 por andar', '1 por andar'], ['2 por andar', '2 por andar'], ['reformad', 'Reformado'], ['decorad', 'Decorado'], ['closet', 'Closet'], ['depósito', 'Depósito'], ['piscina', 'Piscina'], ['pé na areia', 'Pé na areia'], ['infraestrutura', 'Lazer completo'], ['financiamento', 'Aceita financiamento']];

  function ler(txt) {
    const r = {}, low = txt.toLowerCase();
    const l1 = txt.split('\n').map(s => s.trim()).find(s => s.length > 2) || '';
    const cab = l1.replace(/^[^\p{L}\d]+/u, '').split(/\s+[I|\-–•]\s+|\s*\|\s*|\s+-\s+/)[0].trim();
    const achou = BAIRROS.filter(b => low.slice(0, 200).includes(b.toLowerCase())).sort((a, b) => b.length - a.length)[0];
    r.bairro = achou || cab.toLowerCase().replace(/(^|\s)\S/g, m => m.toUpperCase());
    r.cidade = LN.some(b => r.bairro.includes(b)) ? 'Litoral Norte' : LF.some(b => r.bairro.includes(b)) ? 'Lauro de Freitas' : 'Salvador';
    r.tipo = /cobertura/i.test(txt) ? 'Cobertura' : /\bstudio\b/i.test(txt) ? 'Studio' : /\blo[tf]t\b|\blotf\b/i.test(txt) ? 'Loft' : /\bcasa\b|resid[êe]ncia/i.test(txt) ? 'Casa' : 'Apartamento';
    const area = txt.match(/(\d{1,3}(?:\.\d{3})*(?:,\d+)?|\d+)\s*m\s*[²2]/i); r.area = area ? Math.round(num(area[1])) : null;
    const su = txt.match(/(\d+)\s*su[ií]tes?/i); r.suites = su ? +su[1] : null;
    const q = txt.match(/(\d+)\s*(?:quartos?\b|\/4|q\b)/i); r.quartos = q ? +q[1] : (/quarto e sala/i.test(txt) ? 1 : r.suites);
    const v = txt.match(/(\d+)\s*vagas?/i); r.vagas = v ? +v[1] : null;
    let preco = null;
    for (const m of txt.matchAll(/(?:R\$\s*|investimento:?\s*|venda:?\s*|valor:?\s*)(\d{1,3}(?:\.\d{3})+(?:,\d{2})?)/gi)) {
      const antes = txt.slice(Math.max(0, m.index - 14), m.index).toLowerCase();
      const n = num(m[1]); if (/cond|iptu/.test(antes)) continue; if (n >= 100000 && (!preco || n > preco)) preco = n;
    }
    r.preco = preco;
    const cd = txt.match(/cond[a-zíô.]*\s*:?\s*R?\$?\s*(\d[\d.]*(?:,\d{2})?)/i); r.taxa_cond = cd ? num(cd[1]) : null;
    const ip = txt.match(/iptu[a-z\s.]*:?\s*R?\$?\s*(\d[\d.]*(?:,\d{2})?)/i); r.iptu = ip ? num(ip[1]) : null;
    r.tags = TAGS.filter(([k]) => low.includes(k)).map(t => t[1]);
    r.chamada = r.tags.slice(0, 3).join(' · ');
    r.status = /vendido/i.test(txt) ? 'vendido' : 'disponivel';
    return r;
  }

  const ficha = $('#ficha');
  $('#ler').onclick = () => {
    const txt = $('#legenda').value.trim();
    if (!txt) { $('#legenda').focus(); return toast('Cole a legenda do post primeiro.'); }
    const r = ler(txt); let n = 0;
    for (const k of ['bairro', 'cidade', 'tipo', 'area', 'quartos', 'suites', 'vagas', 'preco', 'taxa_cond', 'iptu', 'chamada']) {
      const el = ficha.elements[k]; if (!el) continue;
      el.classList.remove('auto');
      if (r[k] != null && r[k] !== '') {
        el.value = k === 'preco' || k === 'taxa_cond' || k === 'iptu' ? r[k].toLocaleString('pt-BR') : r[k];
        void el.offsetWidth; el.classList.add('auto'); n++;
      }
    }
    $('#tags').innerHTML = r.tags.length ? r.tags.map(t => `<span>${E(t)}</span>`).join('') : '<span style="color:var(--muted)">nenhum</span>';
    $('#lido-txt').textContent = n + ' campos preenchidos a partir da legenda. Confira e publique.';
    $('#lido').classList.add('on');
    ficha.dataset.descricao = txt; ficha.dataset.status = r.status;
    if (innerWidth < 900) ficha.scrollIntoView({ behavior: 'smooth' });
  };
  $('#exemplo').onclick = () => {
    const ex = (window.IMOVEIS_BASE || []).find(i => i.id === 22);
    $('#legenda').value = ex ? ex.descricao : '';
    if (!$('#foto-prev').src.startsWith('data:')) { $('#foto-prev').src = 'fotos/im22.webp'; ficha.dataset.foto = 'fotos/im22.webp'; }
    ficha.elements.reel.value = ex ? ex.reel : '';
    $('#ler').click();
  };
  $('#foto').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const img = new Image(); img.onload = () => {
      // reels vêm em 9:16 com texto embaixo: guarda só a parte de cima, quadrada
      const w = img.width, h = img.height, alto = h / w > 1.5;
      const sh = alto ? w * 1.04 : h, sy = alto ? h * 0.02 : 0;
      const c = document.createElement('canvas'); c.width = 864; c.height = Math.round(864 * sh / w);
      c.getContext('2d').drawImage(img, 0, sy, w, sh, 0, 0, c.width, c.height);
      const url = c.toDataURL('image/jpeg', 0.8); $('#foto-prev').src = url; ficha.dataset.foto = url;
    };
    img.src = URL.createObjectURL(f);
  };
  ficha.onreset = () => { setTimeout(() => { $('#lido').classList.remove('on'); $('#foto-prev').removeAttribute('src'); delete ficha.dataset.foto; $$('.auto', ficha).forEach(x => x.classList.remove('auto')); $('#tags').innerHTML = ''; }); };
  ficha.onsubmit = e => {
    e.preventDefault();
    const g = k => ficha.elements[k].value.trim();
    const intn = k => g(k) ? +g(k) : null;
    const id = LM.proximoId(), tipo = g('tipo');
    const im = { id, cod: (tipo === 'Casa' ? 'CA' : tipo === 'Cobertura' ? 'CO' : 'AP') + String(id).slice(-3), bairro: g('bairro'), cidade: g('cidade'), tipo, area: intn('area'), quartos: intn('quartos'), suites: intn('suites'), vagas: intn('vagas'),
      preco: num(g('preco')), taxa_cond: num(g('taxa_cond')), iptu: num(g('iptu')), chamada: g('chamada'), status: ficha.dataset.status || 'disponivel', condominio: '', reel: g('reel'),
      foto: ficha.dataset.foto || 'fotos/im24.webp', descricao: ficha.dataset.descricao || g('chamada'), destaque: true };
    LM.salvarImovel(im);
    ficha.reset(); $('#legenda').value = '';
    toast('Publicado! Já está no site e na seleção da página inicial.');
    setTimeout(() => window.open('imovel.html?id=' + id, '_blank'), 700);
  };

  // ================= CRM =================
  function kanban() {
    const ls = LM.leads();
    $('#kanban').innerHTML = ETAPAS.map(([k, t]) => {
      const col = ls.filter(l => l.etapa === k);
      return `<div class="col" data-etapa="${k}"><h3>${t} <span>${col.length}</span></h3>${col.map(cartao).join('')}</div>`;
    }).join('');
    contaHoje();
  }
  function cartao(l) {
    const im = LM.imovel(l.interesse), atrasado = l.etapa !== 'fechado' && l.proximo && l.proximo <= HOJE;
    const oc = l.origem === 'Site' ? 'site' : l.origem === 'Instagram' ? 'insta' : '';
    return `<div class="lead" draggable="true" data-lead="${l.id}"><b>${E(l.nome)}</b>
      <div class="s">${im ? E(im.bairro) + ' · ' + LM.brlCurto(im.preco) : E((l.perfil?.bairros || []).join(', '))}</div>
      <div class="rodape"><span class="pill ${oc}">${E(l.origem)}</span>${l.etapa === 'fechado' ? '<span class="pill">✓ fechado</span>' : `<span class="pill ${atrasado ? 'hoje' : ''}">${atrasado ? 'retornar hoje' : 'retorno ' + dataBR(l.proximo)}</span>`}</div></div>`;
  }
  const kb = $('#kanban');
  kb.addEventListener('dragstart', e => { const c = e.target.closest('.lead'); if (!c) return; e.dataTransfer.setData('text/plain', c.dataset.lead); c.classList.add('arrasta'); });
  kb.addEventListener('dragend', e => e.target.classList?.remove('arrasta'));
  kb.addEventListener('dragover', e => { const col = e.target.closest('.col'); if (!col) return; e.preventDefault(); $$('.col.over').forEach(c => c !== col && c.classList.remove('over')); col.classList.add('over'); });
  kb.addEventListener('dragleave', e => { const col = e.target.closest('.col'); if (col && !col.contains(e.relatedTarget)) col.classList.remove('over'); });
  kb.addEventListener('drop', e => {
    const col = e.target.closest('.col'); if (!col) return; e.preventDefault(); col.classList.remove('over');
    const id = +e.dataTransfer.getData('text/plain'); moveEtapa(id, col.dataset.etapa);
  });
  function moveEtapa(id, etapa) {
    const ls = LM.leads(), l = ls.find(x => x.id === id); if (!l || l.etapa === etapa) return;
    l.etapa = etapa; (l.hist = l.hist || []).unshift({ d: HOJE, t: 'Movido para ' + ETAPAS.find(x => x[0] === etapa)[1] });
    LM.salvarLeads(ls); kanban(); toast(etapa === 'fechado' ? 'Negócio fechado! 🎉' : 'Cliente movido para ' + ETAPAS.find(x => x[0] === etapa)[1] + '.');
  }
  document.addEventListener('click', e => { const c = e.target.closest('[data-lead]'); if (c && !e.target.closest('.gaveta')) abrir(+c.dataset.lead); });

  // gaveta do cliente
  const gav = $('#gaveta'), fundo = $('#fundo');
  const fechar = () => { gav.classList.remove('on'); fundo.classList.remove('on'); };
  fundo.onclick = fechar; addEventListener('keydown', e => e.key === 'Escape' && fechar());
  function abrir(id) {
    const ls = LM.leads(), l = ls.find(x => x.id === id); if (!l) return;
    const im = LM.imovel(l.interesse);
    const sug = LM.imoveis().map(i => [LM.combina(l.perfil, i), i]).filter(x => x[0] >= 50 && x[1].id !== l.interesse).sort((a, b) => b[0] - a[0]).slice(0, 4);
    const tel = '55' + (l.fone || '').replace(/\D/g, '');
    const linkIm = i => new URL('imovel.html?id=' + i.id, location.href).href;
    gav.innerHTML = `<button class="fecha" aria-label="Fechar">✕</button>
      <span class="pill ${l.origem === 'Site' ? 'site' : l.origem === 'Instagram' ? 'insta' : ''}">${E(l.origem)}</span>
      <h2>${E(l.nome)}</h2><div style="color:var(--muted)">${E(l.fone)} · chegou em ${dataBR(l.criado)}</div>
      <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">
        <a class="btn zap" target="_blank" href="https://wa.me/${tel}?text=${encodeURIComponent('Oi, ' + l.nome.split(' ')[0] + '! Aqui é o Luiz Machado.')}">Chamar no WhatsApp</a>
        <select class="btn sec" id="g-etapa" style="padding-right:30px">${ETAPAS.map(([k, t]) => `<option value="${k}" ${k === l.etapa ? 'selected' : ''}>${t}</option>`).join('')}</select>
      </div>
      ${im ? `<div class="bloco"><h3>Imóvel que pediu</h3><div class="match"><img src="${E(im.foto)}" alt=""><div><b>${E(im.bairro)} · ${E(im.cod)}</b><span>${E(LM.titulo(im))} · ${LM.brl(im.preco)}</span></div></div></div>` : ''}
      <div class="bloco"><h3>O que procura</h3><p style="font-size:14px">${E((l.perfil?.bairros || []).join(', ') || 'Qualquer bairro')} · até ${LM.brl(l.perfil?.max)} · ${l.perfil?.suites || 1}+ suítes</p></div>
      <div class="bloco"><h3>Da sua carteira, combinam com ${E(l.nome.split(' ')[0])}</h3>
        ${sug.length ? sug.map(([p, i]) => `<div class="match"><img src="${E(i.foto)}" alt=""><div><b>${E(i.bairro)} · ${E(i.cod)}</b><span>${E(LM.titulo(i))} · ${LM.brlCurto(i.preco)}</span></div><span class="pc">${p}%</span>
          <a class="btn peq sec" target="_blank" href="https://wa.me/${tel}?text=${encodeURIComponent('Oi, ' + l.nome.split(' ')[0] + '! Separei esse aqui pra você: ' + LM.titulo(i) + ' em ' + i.bairro + ', ' + LM.brl(i.preco) + '. ' + linkIm(i))}">Enviar</a></div>`).join('') : '<p style="font-size:14px;color:var(--muted)">Nada na carteira ainda. Bom motivo pra captar.</p>'}
      </div>
      <div class="bloco"><h3>Próximo passo</h3>
        <div class="grade" style="grid-template-columns:1fr 2fr"><label class="c"><span>Retornar em</span><input type="date" id="g-prox" value="${E(l.proximo || '')}"></label>
        <label class="c"><span>Anotação</span><input id="g-nota" value="${E(l.nota || '')}"></label></div>
        <button class="btn" id="g-salvar" style="margin-top:12px;width:100%">Salvar</button></div>
      <div class="bloco"><h3>Histórico</h3>${(l.hist || []).concat([{ d: l.criado, t: 'Entrou pelo ' + l.origem }]).map(h => `<div style="font-size:14px;padding:6px 0;border-top:1px solid var(--line)"><b style="font-weight:500">${dataBR(h.d)}</b> · ${E(h.t)}</div>`).join('')}</div>`;
    gav.classList.add('on'); fundo.classList.add('on');
    $('.fecha', gav).onclick = fechar;
    $('#g-etapa').onchange = e => { moveEtapa(id, e.target.value); abrir(id); };
    $('#g-salvar').onclick = () => {
      const ls2 = LM.leads(), x = ls2.find(y => y.id === id);
      x.proximo = $('#g-prox').value; x.nota = $('#g-nota').value; (x.hist = x.hist || []).unshift({ d: HOJE, t: 'Anotou: ' + x.nota });
      LM.salvarLeads(ls2); fechar(); if ($('#t-crm').classList.contains('on')) kanban(); else geral(); toast('Salvo.');
    };
  }
  $('#novo-cli').onclick = () => {
    gav.innerHTML = `<button class="fecha" aria-label="Fechar">✕</button><h2>Novo cliente</h2>
      <form class="bloco" id="f-novo"><div class="grade" style="grid-template-columns:1fr 1fr">
        <label class="c w2"><span>Nome</span><input name="nome" required></label>
        <label class="c"><span>WhatsApp</span><input name="fone" required></label>
        <label class="c"><span>Origem</span><select name="origem"><option>Instagram</option><option>Indicação</option><option>Portal</option><option>Placa</option><option>Site</option></select></label>
        <label class="c w2"><span>Bairros (separe por vírgula)</span><input name="bairros" placeholder="Horto Florestal, Caminho das Árvores"></label>
        <label class="c"><span>Até (R$)</span><input name="max" inputmode="numeric" placeholder="2.000.000"></label>
        <label class="c"><span>Suítes</span><input name="suites" type="number" value="3"></label>
      </div><button class="btn" style="margin-top:14px;width:100%">Adicionar</button></form>`;
    gav.classList.add('on'); fundo.classList.add('on'); $('.fecha', gav).onclick = fechar;
    $('#f-novo').onsubmit = e => {
      e.preventDefault(); const f = e.target;
      LM.novoLead({ nome: f.nome.value, fone: f.fone.value, origem: f.origem.value, perfil: { bairros: f.bairros.value.split(',').map(s => s.trim()).filter(Boolean), max: num(f.max.value) || null, suites: +f.suites.value }, nota: 'Cadastrado manualmente.' });
      fechar(); kanban(); toast('Cliente adicionado.');
    };
  };

  addEventListener('hashchange', () => $('#app').style.display !== 'none' && ir(location.hash.slice(1)));
})();
