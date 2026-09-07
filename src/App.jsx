import { lazy, Suspense, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Globe,
  List,
  MapPin,
  X,
} from "@phosphor-icons/react";
import { createLeadPayload, submitLead } from "./formSubmission.js";

const TabletShowcase = lazy(() => import('./TabletViewer.jsx').then((module) => ({ default: module.TabletShowcase })));

const content = {
  pt: {
    nav: [["A solução", "solution"], ["Como funciona", "process"], ["Para marcas", "brands"], ["Motoristas", "drivers"]],
    headerCta: "Pedir proposta",
    eyebrow: "Publicidade em movimento · Portugal",
    heroTitle: "Publicidade que viaja consigo.",
    heroBody: "Transformamos veículos TVDE em espaços de publicidade para marcas que querem estar mais perto das pessoas.",
    heroCta: "Pedir proposta",
    heroSecondary: "Descobrir a Cartise",
    heroCaption: "Um novo ponto de contacto, dentro de cada viagem.",
    introKicker: "Um meio que já está em movimento",
    introTitle: "Transformamos viagens em atenção.",
    introBody: "Todos os dias, milhares de pessoas passam vários minutos dentro de veículos TVDE. A Cartise transforma esse tempo num novo espaço para marcas.",
    introWords: ["Mais próximo.", "Mais presente.", "Em movimento."],
    processKicker: "Simples, do briefing aos resultados",
    processTitle: "Uma campanha. Milhares de viagens.",
    steps: [
      ["01", "Defina a campanha", "Escolha a cidade, duração, público e dimensão da campanha."],
      ["02", "Nós tratamos do resto", "Distribuímos a campanha pela nossa rede de veículos e gerimos toda a operação."],
      ["03", "Acompanhe os resultados", "Receba informação sobre a atividade e desempenho da sua campanha."],
    ],
    valueOverline: "Presença que se sente",
    valueTitleA: "Outdoor passa por si.",
    valueTitleB: "Cartise viaja consigo.",
    values: [
      ["Mais tempo", "A sua marca acompanha o passageiro durante a viagem."],
      ["Mais atenção", "Um ambiente mais próximo e com menos distrações do que muitos formatos tradicionais."],
      ["Mais cobertura", "Uma rede de veículos em circulação diária pelas zonas onde as pessoas vivem, trabalham e saem."],
    ],
    brandsKicker: "Para marcas e agências",
    brandsTitle: "A sua marca. Dentro da viagem.",
    brandsBody: "A Cartise cria um novo ponto de contacto entre marcas e passageiros. Campanhas podem ser adaptadas por localização, período, veículo e objetivo.",
    range: ["Da notoriedade à aquisição.", "Da campanha nacional à ativação local."],
    fitTitleA: "Feito para marcas.",
    fitTitleB: "E para quem trabalha com elas.",
    fitBody: "Trabalhamos diretamente com marcas, agências de publicidade e agências de media.",
    fitQuestion: "Precisa de uma campanha específica?",
    fitCta: "Falar com a Cartise",
    driversKicker: "Rede Cartise",
    driversTitle: "Conduz TVDE?",
    driversBody: "O seu veículo pode fazer parte da rede Cartise. Disponibilize espaço publicitário no seu carro e receba por participar nas campanhas da nossa rede.",
    driversAlt: "Sedan premium em movimento numa rua de Lisboa",
    driversCta: "Quero aderir",
    closing: "A próxima campanha pode começar numa viagem.",
    closingSub: "Coloque a sua marca em movimento.",
    footerLine: "Publicidade em movimento.",
    formProposalTitle: "Vamos pôr a sua marca em movimento.",
    formDriverTitle: "Junte-se à rede Cartise.",
    formBody: "Deixe-nos os seus dados. A nossa equipa entrará em contacto consigo em breve.",
    name: "Nome", email: "Email profissional", company: "Empresa", city: "Cidade", submit: "Enviar pedido",
    sending: "A enviar…",
    submitError: "Não foi possível enviar o pedido. Verifique a ligação e tente novamente.",
    success: "Obrigado. Falamos em breve.",
    successBody: "Recebemos o seu pedido e entraremos em contacto consigo.",
    close: "Fechar",
  },
  en: {
    nav: [["The solution", "solution"], ["How it works", "process"], ["For brands", "brands"], ["Drivers", "drivers"]],
    headerCta: "Request a proposal",
    eyebrow: "Advertising in motion · Portugal",
    heroTitle: "Advertising that moves with you.",
    heroBody: "We turn ride-hailing vehicles into advertising spaces for brands that want to get closer to people.",
    heroCta: "Request a proposal",
    heroSecondary: "Discover Cartise",
    heroCaption: "A new brand touchpoint, inside every journey.",
    introKicker: "A medium already in motion",
    introTitle: "We turn journeys into attention.",
    introBody: "Every day, thousands of people spend several minutes inside ride-hailing vehicles. Cartise turns that time into a new advertising space for brands.",
    introWords: ["Closer.", "More present.", "Always moving."],
    processKicker: "Simple, from brief to results",
    processTitle: "One campaign. Thousands of journeys.",
    steps: [
      ["01", "Define your campaign", "Choose the city, campaign duration, audience and scale."],
      ["02", "We handle the rest", "We distribute your campaign across our vehicle network and manage the operation."],
      ["03", "Track the results", "Receive information about campaign activity and performance."],
    ],
    valueOverline: "Presence people can feel",
    valueTitleA: "Outdoor advertising passes you by.",
    valueTitleB: "Cartise travels with you.",
    values: [
      ["More time", "Your brand stays with the passenger throughout the journey."],
      ["More attention", "A closer environment with fewer distractions than many traditional advertising formats."],
      ["More coverage", "A network of vehicles moving daily through the places where people live, work and go out."],
    ],
    brandsKicker: "For brands and agencies",
    brandsTitle: "Your brand. Inside the journey.",
    brandsBody: "Cartise creates a new touchpoint between brands and passengers. Campaigns can be adapted by location, period, vehicle and objective.",
    range: ["From awareness to acquisition.", "From national campaigns to local activations."],
    fitTitleA: "Built for brands.",
    fitTitleB: "And the agencies behind them.",
    fitBody: "We work directly with brands, advertising agencies and media agencies.",
    fitQuestion: "Need something specific?",
    fitCta: "Talk to Cartise",
    driversKicker: "Cartise network",
    driversTitle: "Drive with TVDE platforms?",
    driversBody: "Your vehicle can become part of the Cartise network. Make advertising space available inside your vehicle and earn by participating in campaigns across our network.",
    driversAlt: "Premium sedan moving through a Lisbon street",
    driversCta: "Join the network",
    closing: "Your next campaign could start with a journey.",
    closingSub: "Put your brand in motion.",
    footerLine: "Advertising in motion.",
    formProposalTitle: "Let’s put your brand in motion.",
    formDriverTitle: "Join the Cartise network.",
    formBody: "Leave your details and our team will get in touch shortly.",
    name: "Name", email: "Work email", company: "Company", city: "City", submit: "Send request",
    sending: "Sending…",
    submitError: "We couldn’t send your request. Check your connection and try again.",
    success: "Thank you. We’ll talk soon.",
    successBody: "We’ve received your request and will be in touch.",
    close: "Close",
  },
};

function BrandMark() {
  return <a className="brand-mark" href="#top" aria-label="Cartise — home">CARTISE</a>;
}

function ArrowLink({ children, onClick }) {
  return (
    <button className="arrow-link" onClick={onClick} type="button">
      <span>{children}</span><span className="arrow-link__icon" aria-hidden="true"><ArrowUpRight weight="bold" /></span>
    </button>
  );
}

function LeadModal({ type, copy, lang, onClose }) {
  const [status, setStatus] = useState("idle");
  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.classList.add("modal-open");
    return () => { document.removeEventListener("keydown", onKey); document.body.classList.remove("modal-open"); };
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="lead-modal" role="dialog" aria-modal="true" aria-labelledby="lead-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label={copy.close}><X size={20} /></button>
        {status === "success" ? (
          <div className="success-state">
            <span className="success-icon"><Check size={26} weight="bold" /></span>
            <p className="eyebrow">Cartise</p><h2 id="lead-title">{copy.success}</h2><p>{copy.successBody}</p>
            <button className="solid-button" type="button" onClick={onClose}>{copy.close}</button>
          </div>
        ) : (
          <>
            <p className="eyebrow">Cartise · {type === "driver" ? copy.driversKicker : copy.brandsKicker}</p>
            <h2 id="lead-title">{type === "driver" ? copy.formDriverTitle : copy.formProposalTitle}</h2>
            <p className="modal-copy">{copy.formBody}</p>
            <form onSubmit={async (event) => {
              event.preventDefault();
              setStatus("submitting");
              try {
                const payload = createLeadPayload(event.currentTarget, type, lang);
                await submitLead(payload);
                setStatus("success");
              } catch {
                setStatus("error");
              }
            }}>
              <input className="honeypot" type="text" name="_honey" tabIndex="-1" autoComplete="off" aria-hidden="true" />
              <label>{copy.name}<input name="name" autoFocus required /></label>
              <label>{copy.email}<input name="email" type="email" required /></label>
              <div className="form-row">
                <label>{copy.company}<input name="company" required={type !== "driver"} /></label>
                <label>{copy.city}<input name="city" required /></label>
              </div>
              {status === "error" && <p className="form-error" role="alert">{copy.submitError}</p>}
              <button className="solid-button form-submit" type="submit" disabled={status === "submitting"}>
                {status === "submitting" ? copy.sending : copy.submit}<ArrowRight size={18} weight="bold" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export function App() {
  const [lang, setLang] = useState("pt");
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const copy = content[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lang === "pt" ? "Cartise — Publicidade em movimento" : "Cartise — Advertising in motion";
  }, [lang]);

  const openLead = (type = "proposal") => { setMenuOpen(false); setModal(type); };
  const goTo = (id) => { setMenuOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };

  return (
    <div className="site-shell" id="top">
      <header className="header">
        <BrandMark />
        <nav className={menuOpen ? "nav nav--open" : "nav"} aria-label="Main navigation">
          {copy.nav.map(([label, id]) => <button key={id} type="button" onClick={() => goTo(id)}>{label}</button>)}
        </nav>
        <div className="header-actions">
          <div className="language-switch" aria-label="Language selector">
            <Globe size={15} aria-hidden="true" />
            {["pt", "en"].map((code) => <button key={code} type="button" aria-pressed={lang === code} className={lang === code ? "active" : ""} onClick={() => setLang(code)}>{code.toUpperCase()}</button>)}
          </div>
          <button className="header-cta" type="button" onClick={() => openLead()}>{copy.headerCta}<ArrowUpRight size={15} weight="bold" /></button>
          <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <List size={22} />}</button>
        </div>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy"><p className="eyebrow">{copy.eyebrow}</p><h1 id="hero-title">{copy.heroTitle}</h1><p className="hero-body">{copy.heroBody}</p>
            <div className="hero-actions">
              <button className="solid-button" type="button" onClick={() => openLead()}>{copy.heroCta}<ArrowUpRight size={18} weight="bold" /></button>
              <button className="text-button" type="button" onClick={() => goTo("solution")}>{copy.heroSecondary}<ArrowDown size={16} weight="bold" /></button>
            </div>
          </div>
          <div className="hero-media"><img src="/assets/cartise-hero-passengers.jpg" alt="Duas passageiras a interagir com um ecrã publicitário dentro de um veículo Cartise em Lisboa" /><div className="image-caption"><MapPin size={16} weight="fill" /><span>Lisboa · Portugal</span></div><p>{copy.heroCaption}</p></div>
        </section>

        <section className="intro section" id="solution">
          <div className="section-label"><span>01</span><p>{copy.introKicker}</p></div>
          <div className="intro-grid"><h2>{copy.introTitle}</h2><div><p className="large-copy">{copy.introBody}</p><div className="word-row">{copy.introWords.map((word, index) => <span key={word} className={index === 1 ? "accent-word" : ""}>{word}</span>)}</div></div></div>
        </section>

        <section className="process section" id="process">
          <div className="section-label"><span>02</span><p>{copy.processKicker}</p></div><h2>{copy.processTitle}</h2>
          <div className="step-grid">{copy.steps.map(([number, title, body], index) => <article className={`step-card step-card--${index + 1}`} key={number}><div className="step-top"><span>{number}</span><ArrowUpRight size={20} /></div><div><h3>{title}</h3><p>{body}</p></div></article>)}</div>
        </section>

        <section className="value section">
          <div className="section-label section-label--light"><span>03</span><p>{copy.valueOverline}</p></div>
          <div className="value-title"><h2>{copy.valueTitleA}</h2><h2>{copy.valueTitleB}</h2></div>
          <div className="value-grid">{copy.values.map(([title, body], index) => <article key={title}><span className="value-index">0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
        </section>

        <section className="brands section" id="brands">
          <div className="brands-copy"><div className="section-label"><span>04</span><p>{copy.brandsKicker}</p></div><h2>{copy.brandsTitle}</h2><p className="large-copy">{copy.brandsBody}</p></div>
          <Suspense fallback={<div className="brand-range" aria-busy="true">CARTISE</div>}><TabletShowcase lang={lang} /></Suspense>
        </section>

        <section className="fit section">
          <div className="fit-heading"><h2>{copy.fitTitleA}</h2><h2>{copy.fitTitleB}</h2></div>
          <div className="fit-copy"><p className="large-copy">{copy.fitBody}</p><p className="fit-question">{copy.fitQuestion}</p><ArrowLink onClick={() => openLead()}>{copy.fitCta}</ArrowLink></div>
        </section>

        <section className="drivers section" id="drivers">
          <div className="drivers-visual"><img src="/assets/cartise-drivers-premium.png" alt={copy.driversAlt} /></div>
          <div className="drivers-copy"><p className="eyebrow">{copy.driversKicker}</p><h2>{copy.driversTitle}</h2><p className="large-copy">{copy.driversBody}</p><ArrowLink onClick={() => openLead("driver")}>{copy.driversCta}</ArrowLink></div>
        </section>

        <section className="closing section"><p className="eyebrow">Cartise · 2026</p><h2>{copy.closing}</h2><p>{copy.closingSub}</p><button className="solid-button solid-button--light" type="button" onClick={() => openLead()}>{copy.heroCta}<ArrowUpRight size={18} weight="bold" /></button></section>
      </main>

      <footer className="footer"><BrandMark /><p>{copy.footerLine}</p><div><a href="mailto:hello@cartise.pt">hello@cartise.pt</a><span>Portugal</span></div></footer>
      {modal && <LeadModal type={modal} copy={copy} lang={lang} onClose={() => setModal(null)} />}
    </div>
  );
}
