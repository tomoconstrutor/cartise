import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check } from '@phosphor-icons/react';
import { createLeadPayload, submitLead } from './formSubmission.js';
import { isLocalPreview, track } from './analytics.js';
import { pageLink } from './routes.js';

export function LeadForm({ lang = 'pt', initialType = 'proposal' }) {
  const en = lang === 'en';
  const [audience, setAudience] = useState(initialType === 'driver' ? 'fleet' : 'brand');
  const [status, setStatus] = useState('idle');
  const [local, setLocal] = useState(false);
  const [simulation, setSimulation] = useState('success');
  const [context, setContext] = useState('');
  const [events, setEvents] = useState([]);
  const [city, setCity] = useState('');
  const started = useRef(false);
  const result = useRef(null);
  const fleet = audience === 'fleet' || audience === 'driver';
  useEffect(() => {
    setLocal(isLocalPreview());
    const params = new URLSearchParams(location.search);
    if (params.get('type') === 'fleet') setAudience('fleet');
    if (params.get('city')) setCity(params.get('city').slice(0, 100));
    const example = params.get('example');
    if (['cafe', 'viagem', 'evento', 'comida', 'cultura', 'bemestar', 'image', 'video'].includes(example)) setContext(example);
  }, []);
  useEffect(() => {
    if (status === 'success' || status === 'error') result.current?.focus();
  }, [status]);
  function readEvents() {
    try { setEvents(JSON.parse(sessionStorage.getItem('cartise:events') || '[]')); } catch { setEvents([]); }
  }
  return <div className="lead-form-wrap">
    {local && <details className="local-test" onToggle={readEvents}>
      <summary>{en ? 'Local test · no emails are sent' : 'Teste local · não são enviados emails'}</summary>
      <p>{en ? 'Use fictional details. The result is simulated in this browser; there is no network submission.' : 'Usa dados fictícios. O resultado é simulado neste navegador; não há envio pela rede.'}</p>
      <label>{en ? 'Simulated outcome' : 'Resultado simulado'}<select value={simulation} onChange={e => setSimulation(e.target.value)}><option value="success">{en ? 'Success' : 'Sucesso'}</option><option value="error">{en ? 'Delivery error' : 'Erro de envio'}</option></select></label>
      <div className="inline-actions"><button type="button" onClick={readEvents}>{en ? 'Refresh events' : 'Atualizar eventos'}</button><button type="button" onClick={() => { try { sessionStorage.removeItem('cartise:events'); } catch {} setEvents([]); }}>{en ? 'Clear events' : 'Limpar eventos'}</button></div>
      <p>{en ? 'Local events only. No personal form fields.' : 'Apenas eventos locais. Sem campos pessoais do formulário.'}</p>
      <ul className="event-log">{events.map((event, i) => <li key={i}>{event.name} · {event.audience || event.page}</li>)}</ul>
    </details>}
    {status === 'success' ? <div className="success-state" role="status" tabIndex={-1} ref={result}>
      <span className="success-icon"><Check size={24} /></span>
      <h3>{local ? (en ? 'Local test completed.' : 'Teste local concluído.') : (en ? 'Request sent.' : 'Pedido enviado.')}</h3>
      <p>{local ? (en ? 'No email was sent. Try the error option or a different audience.' : 'Não foi enviado nenhum email. Podes testar a opção de erro ou outro tipo de pedido.') : (en ? 'Thank you. Our team will review your request and get in touch.' : 'Obrigado. A nossa equipa vai analisar o pedido e entrar em contacto.')}</p>
      <button className="solid-button" onClick={() => { setStatus('idle'); started.current = false; }}>{en ? 'New request' : 'Novo pedido'}</button>
    </div> : <form className="lead-form" onFocus={() => { if (!started.current) { started.current = true; track('form_start', { audience }); } }} onSubmit={async event => {
      event.preventDefault();
      if (status === 'submitting') return;
      const payload = createLeadPayload(event.currentTarget, fleet ? 'driver' : 'proposal', lang);
      setStatus('submitting');
      track('form_submit', { audience });
      try {
        await submitLead(payload, undefined, { simulation });
        setStatus('success'); track('form_success', { audience });
      } catch { setStatus('error'); track('form_error', { audience }); }
    }}>
      <fieldset disabled={status === 'submitting'}>
      <input className="honeypot" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <input type="hidden" name="example" value={context} />
      <label>{en ? 'I represent' : 'Represento'}<select name="audience" value={audience} onChange={e => { setAudience(e.target.value); setStatus('idle'); started.current = false; }}><option value="brand">{en ? 'A brand' : 'Uma marca'}</option><option value="agency">{en ? 'An agency' : 'Uma agência'}</option><option value="fleet">{en ? 'A fleet' : 'Uma frota'}</option><option value="driver">{en ? 'Myself, as a driver' : 'Sou motorista individual'}</option></select></label>
      <div className="form-row"><label>{en ? 'Name *' : 'Nome *'}<input name="name" required maxLength={120} autoComplete="name" /></label><label>Email *<input name="email" type="email" required maxLength={200} autoComplete="email" /></label></div>
      <div className="form-row"><label>{en ? 'Company' : 'Empresa'}{audience !== 'driver' && ' *'}<input name="company" required={audience !== 'driver'} maxLength={160} autoComplete="organization" /></label><label>{en ? 'City / region *' : 'Cidade / região *'}<input name="city" value={city} onChange={e => setCity(e.target.value)} required maxLength={100} autoComplete="address-level2" /></label></div>
      {!fleet && <label>{en ? 'How many cars for the campaign? *' : 'Quantos carros para a campanha? *'}<select name="campaign_vehicles" required defaultValue=""><option value="" disabled>{en ? 'Select a range' : 'Selecione um intervalo'}</option>{['1–10', '11–25', '26–50', '51–100', '101+'].map(range => <option key={range} value={range}>{range} {en ? 'cars' : 'carros'}</option>)}<option value="undecided">{en ? 'I need help deciding' : 'Preciso de ajuda para definir'}</option></select></label>}
      {fleet ? <div className="form-row"><label>{en ? 'Number of vehicles *' : 'Número de viaturas *'}<input key={audience} name="vehicles" type="number" required min="1" max="100000" step="1" defaultValue={audience === 'driver' ? '1' : ''} /></label><label>{en ? 'Phone (optional)' : 'Telefone (opcional)'}<input name="phone" type="tel" maxLength={40} autoComplete="tel" /></label></div> : <details className="brief-details"><summary>{en ? 'Campaign details (optional)' : 'Detalhes da campanha (opcional)'}</summary><div className="form-row"><label>{en ? 'Objective' : 'Objetivo'}<select name="objective"><option value="">{en ? 'Not yet defined' : 'Ainda não definido'}</option><option>{en ? 'Brand awareness' : 'Notoriedade'}</option><option>{en ? 'Venue or event promotion' : 'Divulgar espaço ou evento'}</option><option>{en ? 'Visits to a page' : 'Visitas a uma página'}</option></select></label><label>{en ? 'Preferred start' : 'Início pretendido'}<input name="start_date" type="date" /></label></div><div className="form-row"><label>{en ? 'Duration / dates' : 'Duração / datas'}<input name="period" maxLength={120} placeholder={en ? 'e.g. two weeks in October' : 'Ex.: duas semanas em outubro'} /></label><label>{en ? 'Available budget' : 'Investimento disponível'}<select name="budget"><option>{en ? 'Not yet defined' : 'Ainda não definido'}</option><option>{en ? 'Up to €1 000' : 'Até €1 000'}</option><option>€1 000–€5 000</option><option>€5 000–€10 000</option><option>€10 000+</option></select></label></div><p className="small-copy">{en ? 'Budget ranges are briefing options, not Cartise prices.' : 'Os intervalos servem para o briefing; não são preços Cartise.'}</p></details>}
      {context && <p className="context-chip">{en ? 'Studio reference' : 'Referência do estúdio'}: {context} · {en ? 'file not attached' : 'ficheiro não anexado'}</p>}
      <label>{en ? 'Anything else? (optional)' : 'O que mais devemos saber? (opcional)'}<textarea name="message" rows="3" maxLength={2000} /></label>
      <p className="small-copy">{en ? 'We use these details to answer your request. Read the ' : 'Usamos estes dados para responder ao pedido. Consulte a '}<a href={pageLink('privacy', lang)}>{en ? 'privacy information' : 'informação de privacidade'}</a>.</p>
      {status === 'error' && <p className="form-error" role="alert" tabIndex={-1} ref={result}>{local ? (en ? 'Simulated error. Choose Success and retry; your fields have been kept.' : 'Erro simulado. Escolhe Sucesso e tenta novamente; os campos foram mantidos.') : (en ? 'Your request could not be confirmed. Retry or email hello@cartise.pt.' : 'Não foi possível confirmar o pedido. Tente novamente ou escreva para hello@cartise.pt.')}</p>}
      <button className="solid-button form-submit" disabled={status === 'submitting'}>{status === 'submitting' ? (en ? 'Sending…' : 'A enviar…') : local ? (en ? 'Test request locally' : 'Testar pedido localmente') : (fleet ? (en ? 'Request partnership terms' : 'Pedir condições da parceria') : (en ? 'Request proposal' : 'Pedir proposta'))}<ArrowRight size={18} /></button>
      </fieldset>
    </form>}
  </div>;
}
