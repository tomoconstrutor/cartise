import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, List, X } from '@phosphor-icons/react';
import { copy } from './content.js';
import { pageLink, routeFor } from './routes.js';
import { AdExamples, useAdCycle } from './AdExamples.jsx';
import { LeadForm } from './LeadForm.jsx';
import { track } from './analytics.js';
import './tablet.css';

const TabletShowcase = lazy(() => import('./TabletViewer.jsx').then(module => ({ default: module.TabletShowcase })));
const TabletDemo = lazy(() => import('./TabletViewer.jsx'));

class ViewerBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
function LinkButton({ href, children, light = false, ...props }) { return <a className={`solid-button${light ? ' solid-button--light' : ''}`} href={href} {...props}>{children}<ArrowUpRight size={18} aria-hidden="true" /></a>; }
function SectionTitle({ label, children }) { return <><p className="eyebrow">{label}</p><h2>{children}</h2></>; }
function Cards({ items }) { return <div className="info-grid">{items.map(([title, text], i) => <article className="info-card" key={title}><span className="card-number">0{i + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>; }
function FAQ({ items }) { return <div className="faq-list">{items.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>; }


export function DemoSection({ lang }) {
  const c = copy[lang];
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const cycle = useAdCycle('brands');
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } }, { rootMargin: '180px' });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const fallback = <div className="tablet-fallback"><img src={cycle.media.poster} alt={lang === 'en' ? 'Fictional ad preview' : 'Pré-visualização de anúncio fictício'} width="780" height="500" /><p>{lang === 'en' ? 'Image preview · open the studio for the interactive tablet.' : 'Pré-visualização de imagem · abra o estúdio para explorar o tablet.'}</p></div>;
  return <section className="brands section" id="brands" ref={ref}>
    <div className="brands-copy"><SectionTitle label={lang === 'en' ? '01 / Explore the medium' : '01 / Explore o meio'}>{c.demoTitle}</SectionTitle><p className="large-copy">{c.demoBody}</p><a className="brands-demo-link" data-track="demo_open" href={`${pageLink('tablet', lang)}?example=${cycle.media.id}`}>{c.demo}<ArrowUpRight size={24} /></a><AdExamples cycle={cycle} lang={lang} /><p className="small-copy">{c.demoNote}</p></div>
    <ViewerBoundary fallback={fallback}>{visible ? <Suspense fallback={fallback}><TabletShowcase lang={lang} media={cycle.media} paused={!cycle.playing} /></Suspense> : fallback}</ViewerBoundary>
  </section>;
}
function Coverage({ lang, detailed = false }) {
  const c = copy[lang];
  return <section className="section coverage-section">{detailed ? <><p className="eyebrow">{lang === 'en' ? 'Portugal / Coverage' : 'Portugal / Cobertura'}</p><h1>{c.coverageTitle}</h1></> : <SectionTitle label={lang === 'en' ? 'Portugal / Coverage' : 'Portugal / Cobertura'}>{c.coverageTitle}</SectionTitle>}<p className="large-copy section-intro">{c.coverageBody}</p><div className="city-grid">{['Lisboa', 'Porto', 'Algarve'].map((city, i) => <a key={city} href={`${pageLink('contact', lang)}?city=${city}`} className="city-card">{i < 2 && <img src={`/assets/cartise-${i === 0 ? "lisboa" : "porto"}.jpg`} alt={lang === "en" ? `Illustrative AI photograph of ${city}` : `Fotografia ilustrativa de ${city}, gerada com IA`} width="1536" height="1024" loading="lazy" />}<span className="city-index">PT / 0{i + 1}</span><h3>{lang === 'en' && city === 'Lisboa' ? 'Lisbon' : city}</h3><span>{i < 2 ? (lang === 'en' ? 'Active network · enquire about dates' : 'Rede ativa · consultar datas') : c.availability}<ArrowUpRight size={18} /></span></a>)}</div>{!detailed && <a className="text-button" href={pageLink('coverage', lang)}>{c.coverageLink}<ArrowUpRight size={16} /></a>}</section>;
}
function Closing({ lang, onProposal }) { const c = copy[lang]; return <section className="closing section"><p className="eyebrow">{c.signature}</p><h2>{c.closing}</h2><p>{c.closingBody}</p><LinkButton href={pageLink('contact', lang)} onClick={onProposal} light>{c.proposal}</LinkButton></section>; }
function PageIntro({ label, title, children }) { return <section className="page-intro section"><p className="eyebrow">{label}</p><h1>{title}</h1><p className="large-copy">{children}</p></section>; }

export function App({ pathname = '/' }) {
  const route = routeFor(pathname);
  const { key, lang } = route;
  const c = copy[lang];
  const en = lang === 'en';
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [studioReady, setStudioReady] = useState(false);
  const dialog = useRef(null);
  const link = key => pageLink(key, lang);
  useEffect(() => {
    track('page_view');
    if (key === 'tablet') setStudioReady(true);
    function click(event) {
      const target = event.target.closest?.('[data-track]');
      if (target) track(target.dataset.track);
    }
    document.addEventListener('click', click);
    return () => document.removeEventListener('click', click);
  }, [key]);
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement;
    dialog.current.showModal();
    document.body.classList.add('modal-open');
    return () => { document.body.classList.remove('modal-open'); previous?.focus(); };
  }, [modal]);
  function openProposal(event, type = 'proposal') {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); setMenuOpen(false); setModal(type); track('proposal_open', { audience: type === 'driver' ? 'fleet' : 'brand' });
  }
  const studioFallback = <section className="section"><h1>{en ? 'Your campaign on the tablet.' : 'A sua campanha no tablet.'}</h1><p>{en ? 'Interactive studio · fictional ads. Your files stay in the browser.' : 'Estúdio interativo · anúncios fictícios. Os seus ficheiros ficam no navegador.'}</p><img className="studio-poster" src="/ads/cafe.jpg" alt={en ? 'Fictional coffee campaign' : 'Campanha fictícia de café'} width="780" height="500" /><p><a href={link('contact')}>{c.proposal}</a></p></section>;
  return <div className="site-shell" id="top">
    <a className="skip-link" href="#main">{en ? 'Skip to content' : 'Saltar para o conteúdo'}</a>
    <header className="header"><a className="brand-mark" href={link('home')} aria-label={en ? 'Cartise — home' : 'Cartise — início'}>CARTISE</a><nav id="navigation" className={menuOpen ? 'nav nav--open' : 'nav'} aria-label={en ? 'Main navigation' : 'Navegação principal'}>{['solution', 'formats', 'coverage', 'fleets'].map((item, i) => <a key={item} href={link(item)} aria-current={item === key ? 'page' : undefined}>{c.nav[i]}</a>)}</nav><div className="header-actions"><div className="language-switch" aria-label={en ? 'Language' : 'Idioma'}>{['pt', 'en'].map(locale => <a key={locale} href={pageLink(key, locale)} lang={locale} hrefLang={locale} aria-current={lang === locale ? 'true' : undefined}>{locale.toUpperCase()}</a>)}</div><a className="header-cta" href={key === 'fleets' ? '#fleet-form' : link('contact')} onClick={key === 'fleets' ? undefined : openProposal}>{key === 'fleets' ? (en ? 'Partnership terms' : 'Conhecer condições') : (en ? 'Request proposal' : 'Pedir proposta')}<ArrowUpRight size={15} /></a><button className="menu-toggle" aria-controls="navigation" aria-expanded={menuOpen} aria-label={menuOpen ? (en ? 'Close menu' : 'Fechar menu') : (en ? 'Open menu' : 'Abrir menu')} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <List size={22} />}</button></div></header>
    {key !== 'home' && <nav className="breadcrumbs" aria-label={en ? 'Breadcrumb' : 'Percurso'}><a href={link('home')}>{en ? 'Home' : 'Início'}</a><span aria-hidden="true">/</span><span aria-current="page">{route.title[en ? 1 : 0]}</span></nav>}
    <main id="main">
      {key === 'home' && <>
        <section className="hero"><div className="hero-copy"><p className="eyebrow">In-Car DOOH · Portugal</p><h1>{c.signature}</h1><p className="hero-body">{c.heroBody}</p><div className="hero-actions"><LinkButton href={link('contact')} onClick={openProposal}>{c.proposal}</LinkButton><a className="text-button" href={link('formats')}>{en ? 'Explore formats' : 'Conhecer os formatos'}<ArrowUpRight size={16} /></a></div></div><div className="hero-media"><img src="/assets/cartise-hero-passengers.jpg" alt={c.heroAlt} width="1536" height="1024" fetchPriority="high" /><span className="image-caption">{c.visualLabel}</span></div></section>
        <DemoSection lang={lang} />
        <section className="section process"><SectionTitle label={en ? '02 / How it works' : '02 / Como funciona'}>{c.processTitle}</SectionTitle><Cards items={c.steps} /><a className="text-button" href={link('solution')}>{c.learn}<ArrowUpRight size={16} /></a></section>
        <Coverage lang={lang} />
        <section className="section formats-section"><SectionTitle label={en ? '03 / Creative' : '03 / Criatividade'}>{c.formatTitle}</SectionTitle><Cards items={c.formats} /><a className="text-button" href={link('formats')}>{c.formatLink}<ArrowUpRight size={16} /></a></section>
        <section className="section drivers"><div className="drivers-copy"><SectionTitle label={en ? '04 / The network' : '04 / A rede'}>{c.fleetTitle}</SectionTitle><p className="large-copy">{c.fleetBody}</p><LinkButton href={link('fleets')}>{c.fleetLink}</LinkButton><p className="small-copy">{c.driverLine}</p></div><div className="drivers-visual"><img src="/assets/cartise-drivers-premium.jpg" alt={en ? "Dark sedan on a Lisbon street, illustrative image" : "Sedan numa rua de Lisboa, imagem ilustrativa"} width="1123" height="1401" loading="lazy" /></div></section>
        <section className="section"><SectionTitle label="FAQ">{c.faqTitle}</SectionTitle><FAQ items={c.faq} /></section>
      </>}
      {key === 'solution' && <><PageIntro label="In-Car DOOH" title={c.solutionTitle}>{c.solutionIntro}</PageIntro><section className="section compact-top"><Cards items={c.solutionCards} /></section><section className="section process"><SectionTitle label={en ? 'Campaign planning' : 'Planeamento da campanha'}>{c.processTitle}</SectionTitle><Cards items={c.steps} /></section><section className="section"><SectionTitle label={en ? 'Brands & agencies' : 'Marcas e agências'}>{c.audiencesTitle}</SectionTitle><Cards items={c.audiences} /></section><section className="section tinted"><SectionTitle label={en ? 'Investment' : 'Investimento'}>{c.costTitle}</SectionTitle><p className="large-copy section-intro">{c.costBody}</p><div className="inline-actions"><LinkButton href={link('formats')}>{c.formatLink}</LinkButton></div></section></>}
      {key === 'formats' && <><PageIntro label={en ? 'Image / Video' : 'Imagem / Vídeo'} title={c.formatTitle}>{c.specsIntro}</PageIntro><section className="section compact-top"><Cards items={c.formats} /><a className="text-button" href={link('coverage')}>{c.coverageLink}<ArrowUpRight size={16} /></a></section><DemoSection lang={lang} /><section className="section tinted"><SectionTitle label={en ? 'Creative essentials' : 'Preparar a peça'}>{c.creativeTitle}</SectionTitle><Cards items={c.creative} /><div className="text-panel"><h3>{c.handoffTitle}</h3><p>{c.handoffBody}</p></div></section></>}
      {key === 'coverage' && <><Coverage lang={lang} detailed /><section className="section"><SectionTitle label={en ? 'Your location' : 'A sua localização'}>{c.coverageOther}</SectionTitle><p className="large-copy">{c.coverageOtherBody}</p><LinkButton href={link('contact')}>{c.proposal}</LinkButton></section></>}
      {key === 'fleets' && <><section className="section fleet-intro"><div className="fleet-intro-copy"><p className="eyebrow">{en ? 'Fleets / Individual drivers' : 'Frotas / Motoristas individuais'}</p><h1>{c.fleetTitle}</h1><p className="large-copy">{c.fleetIntro}</p></div><div className="fleet-form" id="fleet-form"><h2>{c.fleetCta}</h2><LeadForm lang={lang} initialType="driver" /></div><figure className="fleet-page-photo"><img src="/assets/cartise-drivers-premium.jpg" alt={en ? 'Illustrative photograph of a sedan in Lisbon' : 'Fotografia ilustrativa de um sedan em Lisboa'} width="1123" height="1401" /><figcaption>{c.visualLabel}</figcaption></figure></section><section className="section compact-top"><Cards items={c.fleetSteps} /></section><section className="section tinted"><SectionTitle label={en ? 'Partnership terms' : 'Condições da parceria'}>{en ? 'Know the terms before joining.' : 'Conheça as condições antes de aderir.'}</SectionTitle><FAQ items={c.fleetFaq} /></section></>}
      {key === 'contact' && <><PageIntro label={en ? 'Let’s talk' : 'Vamos conversar'} title={c.contactTitle}>{c.contactIntro}</PageIntro><section className="section contact-layout compact-top"><div className="contact-aside"><h2>{c.nextTitle}</h2><p className="large-copy">{c.nextBody}</p><a className="contact-email" href="mailto:hello@cartise.pt">hello@cartise.pt ↗</a><a className="contact-phone" href="tel:+351928406723">{c.phone} ↗</a><a href={link('fleets')}>{c.fleetLink}</a></div><LeadForm lang={lang} /></section></>}
      {key === 'privacy' && <><PageIntro label={en ? 'Information' : 'Informação'} title={c.privacyTitle}>{c.privacyIntro}</PageIntro><section className="section compact-top legal-copy">{c.privacySections.map(([title, text]) => <article key={title}><h2>{title}</h2><p>{text}</p></article>)}<a href="https://formsubmit.co/privacy.pdf" target="_blank" rel="noreferrer">{en ? 'FormSubmit privacy information ↗' : 'Informação de privacidade do FormSubmit ↗'}</a></section></>}
      {key === 'tablet' && <ViewerBoundary fallback={studioFallback}>{studioReady ? <Suspense fallback={studioFallback}><TabletDemo lang={lang} /></Suspense> : studioFallback}</ViewerBoundary>}
      {key === 'notFound' && <><PageIntro label="404" title={c.notFoundTitle}>{c.notFoundBody}</PageIntro><section className="section compact-top"><LinkButton href={link('home')}>{c.back}</LinkButton></section></>}
      {!['contact', 'privacy', 'tablet', 'notFound', 'fleets'].includes(key) && <Closing lang={lang} onProposal={openProposal} />}
    </main>
    <footer className="footer"><div className="footer-brand"><a className="brand-mark" href={link('home')}>CARTISE</a><p>{c.signature}</p><span>{c.footerCompany}</span></div><nav aria-label={en ? 'Footer navigation' : 'Navegação de rodapé'}>{[['solution', c.nav[0]], ['formats', c.nav[1]], ['coverage', c.nav[2]], ['fleets', c.nav[3]], ['privacy', c.privacy]].map(([key, label]) => <a href={link(key)} key={key}>{label}</a>)}</nav><div className="footer-contact"><a href="mailto:hello@cartise.pt">hello@cartise.pt ↗</a><a className="footer-phone" href="tel:+351928406723">{c.phone} ↗</a><a href={link('contact')}>{c.contact}</a></div></footer>
    {modal && <dialog className="lead-modal" ref={dialog} onCancel={() => setModal(null)} onClick={event => { if (event.target === dialog.current) { const r = dialog.current.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) setModal(null); } }} aria-labelledby="lead-title"><button className="modal-close" onClick={() => setModal(null)} aria-label={en ? 'Close' : 'Fechar'}><X size={20} /></button><p className="eyebrow">Cartise</p><h2 id="lead-title">{modal === 'driver' ? c.fleetCta : c.proposal}</h2><p className="modal-copy">{c.contactIntro}</p><LeadForm lang={lang} initialType={modal} /></dialog>}
  </div>;
}
