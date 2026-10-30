// Camada de dados da demonstração. Site e painel leem daqui.
// Na versão real isso vira um banco (Supabase); aqui fica no navegador.
(function () {
  const K = { im: 'lm_imoveis_v1', leads: 'lm_leads_v1', views: 'lm_views_v1' };
  const WHATS = '5571999611500';

  function ler(k, padrao) {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : padrao; } catch (e) { return padrao; }
  }
  function gravar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* modo privado */ } }

  // edições do painel: { editados: {id: {...}}, novos: [...] }
  function estado() { return ler(K.im, { editados: {}, novos: [] }); }

  function imoveis() {
    const st = estado();
    const base = (window.IMOVEIS_BASE || []).map(im => Object.assign({}, im, st.editados[im.id] || {}));
    return st.novos.concat(base).filter(im => !im.excluido);
  }
  function imovel(id) { return imoveis().find(im => String(im.id) === String(id)); }

  function salvarImovel(im) {
    const st = estado();
    const ehBase = (window.IMOVEIS_BASE || []).some(b => b.id === im.id);
    if (ehBase) st.editados[im.id] = Object.assign({}, st.editados[im.id] || {}, im);
    else {
      const i = st.novos.findIndex(n => n.id === im.id);
      if (i >= 0) st.novos[i] = im; else st.novos.unshift(im);
    }
    gravar(K.im, st);
  }
  function proximoId() { return Date.now(); }

  // ---------- leads ----------
  const hoje = new Date(); const d = n => { const x = new Date(hoje); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
  const SEED = [
    { id: 1, nome: 'Mariana Teixeira', fone: '71 98811-2040', origem: 'Site', etapa: 'novo', interesse: 24, perfil: { bairros: ['Horto Florestal'], max: 5000000, suites: 4 }, proximo: d(0), nota: 'Pediu planta do Monvert pelo formulário.', criado: d(0) },
    { id: 2, nome: 'Rafael Andrade', fone: '71 99620-1187', origem: 'Instagram', etapa: 'conversa', interesse: 22, perfil: { bairros: ['Patamares'], max: 2300000, suites: 3 }, proximo: d(0), nota: 'Quer vista mar. Mandar opções de Patamares.', criado: d(-2) },
    { id: 3, nome: 'Juliana e Pedro Costa', fone: '71 99134-5560', origem: 'Indicação', etapa: 'visita', interesse: 33, perfil: { bairros: ['Busca Vida'], max: 3200000, suites: 3 }, proximo: d(1), nota: 'Visita sábado 10h na casa plana de Busca Vida.', criado: d(-6) },
    { id: 4, nome: 'Carlos Menezes', fone: '71 98702-3321', origem: 'Site', etapa: 'proposta', interesse: 17, perfil: { bairros: ['Caminho das Árvores'], max: 3200000, suites: 4 }, proximo: d(0), nota: 'Proposta de R$ 2,95 mi. Aguardando proprietário.', criado: d(-12) },
    { id: 5, nome: 'Ana Luiza Prado', fone: '71 99288-7410', origem: 'Portal', etapa: 'novo', interesse: 4, perfil: { bairros: ['Jaguaribe', 'Armação'], max: 1000000, suites: 1 }, proximo: d(0), nota: 'Primeiro imóvel, vai financiar.', criado: d(-1) },
    { id: 6, nome: 'Fernando Lima', fone: '71 98155-0093', origem: 'Instagram', etapa: 'conversa', interesse: 53, perfil: { bairros: ['Busca Vida', 'Itacimirim'], max: 15000000, suites: 5 }, proximo: d(2), nota: 'Investidor, quer casa de praia pé na areia.', criado: d(-4) },
    { id: 7, nome: 'Beatriz Souza', fone: '71 99470-6612', origem: 'Site', etapa: 'visita', interesse: 47, perfil: { bairros: ['Canela', 'Graça'], max: 2000000, suites: 3 }, proximo: d(3), nota: 'Mudando de São Paulo em janeiro.', criado: d(-8) },
    { id: 8, nome: 'Thiago Rocha', fone: '71 98821-4479', origem: 'Indicação', etapa: 'fechado', interesse: 60, perfil: { bairros: ['Alto do Itaigara'], max: 1500000, suites: 2 }, proximo: '', nota: 'Escritura assinada.', criado: d(-30) },
  ];
  function leads() { return ler(K.leads, null) || SEED.slice(); }
  function salvarLeads(ls) { gravar(K.leads, ls); }
  function novoLead(l) {
    const ls = leads();
    const lead = Object.assign({ id: Date.now(), etapa: 'novo', origem: 'Site', criado: d(0), proximo: d(0), nota: '' }, l);
    ls.unshift(lead); salvarLeads(ls); return lead;
  }

  function contarView(id) { const v = ler(K.views, {}); v[id] = (v[id] || 0) + 1; gravar(K.views, v); }
  function views() { return ler(K.views, {}); }

  // ---------- utilidades ----------
  const brl = v => v == null ? 'Sob consulta' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  const brlCurto = v => v == null ? 'Consulte' : v >= 1e6 ? 'R$ ' + (v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' mi' : 'R$ ' + Math.round(v / 1e3) + ' mil';
  // "Casa com 4 suítes", "Apartamento com 2 quartos", "Studio"
  function titulo(im) {
    if (!im.suites && !im.quartos || im.tipo === 'Studio' || im.tipo === 'Loft') return im.tipo;
    const n = im.suites || im.quartos, rot = im.suites ? (n > 1 ? 'suítes' : 'suíte') : (n > 1 ? 'quartos' : 'quarto');
    return im.tipo + ' com ' + n + ' ' + rot;
  }
  function whats(msg) { return 'https://wa.me/' + WHATS + '?text=' + encodeURIComponent(msg); }
  function msgImovel(im) { return 'Olá, Luiz! Vi no seu site o imóvel ' + im.cod + ' (' + im.bairro + ', ' + im.area + ' m², ' + brl(im.preco) + ') e quero saber mais.'; }

  // cliente x imóvel: quanto combina (0 a 100)
  function combina(perfil, im) {
    if (!perfil || im.status !== 'disponivel') return 0;
    let p = 0;
    if ((perfil.bairros || []).includes(im.bairro)) p += 50;
    if (perfil.max && im.preco && im.preco <= perfil.max) p += im.preco >= perfil.max * 0.6 ? 30 : 18;
    if (perfil.suites && im.suites >= perfil.suites) p += 20;
    return p;
  }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  window.LM = { imoveis, imovel, salvarImovel, proximoId, leads, salvarLeads, novoLead, contarView, views, brl, brlCurto, titulo, whats, msgImovel, combina, esc, WHATS };
})();
