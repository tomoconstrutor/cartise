import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check } from '@phosphor-icons/react';
import { createLeadPayload, submitLead } from './formSubmission.js';
import { isLocalPreview, track } from './analytics.js';
import { pageLink } from './routes.js';

export function MediaKitForm({ lang = 'pt' }) {
  const en = lang === 'en';
  const [status, setStatus] = useState('idle');
  const [local, setLocal] = useState(false);
  const [simulation, setSimulation] = useState('success');
  const result = useRef(null);
  useEffect(() => setLocal(isLocalPreview()), []);
  useEffect(() => { if (status === 'success' || status === 'error') result.current?.focus(); }, [status]);
  return <div className="media-kit-form-wrap">
    {local && <details className="local-test">
      <summary>{en ? 'Local test · no emails are sent' : 'Teste local · não são enviados emails'}</summary>
      <p>{en ? 'Use fictional details. This only tests the confirmation state in this browser.' : 'Use dados fictícios. Isto testa apenas a confirmação neste navegador.'}</p>
      <label>{en ? 'Simulated outcome' : 'Resultado simulado'}<select value={simulation} onChange={event => setSimulation(event.target.value)}><option value="success">{en ? 'Success' : 'Sucesso'}</option><option value="error">{en ? 'Delivery error' : 'Erro de envio'}</option></select></label>
    </details>}
    {status === 'success' ? <div className="success-state" role="status" tabIndex={-1} ref={result}>
      <span className="success-icon"><Check size={24} /></span>
      <h2>{local ? (en ? 'Local test completed.' : 'Teste local concluído.') : (en ? 'Check your inbox.' : 'Consulte o seu email.')}</h2>
      <p>{local ? (en ? 'No email was sent in this local test.' : 'Neste teste local não foi enviado nenhum email.') : (en ? 'We have sent the media kit link to the email address you provided.' : 'Enviámos o link do media kit para o email indicado.')}</p>
      <button className="solid-button" onClick={() => setStatus('idle')}>{en ? 'Make another request' : 'Fazer outro pedido'}</button>
    </div> : <form className="lead-form" onSubmit={async event => {
      event.preventDefault();
      if (status === 'submitting') return;
      setStatus('submitting'); track('media_kit_submit');
      try { await submitLead(createLeadPayload(event.currentTarget, 'mediaKit', lang), undefined, { simulation }); setStatus('success'); track('media_kit_success'); }
      catch { setStatus('error'); track('media_kit_error'); }
    }}>
      <fieldset disabled={status === 'submitting'}>
        <input className="honeypot" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <input type="hidden" name="request" value="media_kit" />
        <div className="form-row"><label>{en ? 'Full name *' : 'Nome completo *'}<input name="name" required maxLength={120} autoComplete="name" /></label><label>{en ? 'Work email *' : 'Email profissional *'}<input name="email" type="email" required maxLength={200} autoComplete="email" /></label></div>
        <div className="form-row"><label>{en ? 'Company *' : 'Empresa *'}<input name="company" required maxLength={160} autoComplete="organization" /></label><label>{en ? 'Job title *' : 'Cargo *'}<input name="job_title" required maxLength={120} autoComplete="organization-title" /></label></div>
        <label>{en ? 'Phone number *' : 'Contacto telefónico *'}<input name="phone" type="tel" required maxLength={40} autoComplete="tel" /></label>
        <p className="small-copy">{en ? 'We use these details to send the media kit and reply to your request. Read the ' : 'Usamos estes dados para enviar o media kit e responder ao seu pedido. Consulte a '}<a href={pageLink('privacy', lang)}>{en ? 'privacy information' : 'informação de privacidade'}</a>.</p>
        {status === 'error' && <p className="form-error" role="alert" tabIndex={-1} ref={result}>{local ? (en ? 'Simulated error. Choose Success and try again.' : 'Erro simulado. Escolha Sucesso e tente novamente.') : (en ? 'We could not confirm your request. Please try again or email hello@cartise.pt.' : 'Não foi possível confirmar o pedido. Tente novamente ou escreva para hello@cartise.pt.')}</p>}
        <button className="solid-button form-submit" disabled={status === 'submitting'}>{status === 'submitting' ? (en ? 'Sending…' : 'A enviar…') : (en ? 'Send me the media kit' : 'Enviar-me o media kit')}<ArrowRight size={18} /></button>
      </fieldset>
    </form>}
  </div>;
}
