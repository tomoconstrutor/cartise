import { useEffect, useState } from 'react';
import { track } from './analytics.js';

export const exampleAds = [
  ['cafe', 'Café', 'Coffee', 'image'],
  ['viagem', 'Viagens', 'Travel', 'image'],
  ['evento', 'Eventos', 'Events', 'image'],
  ['comida', 'Gastronomia', 'Food', 'image'],
  ['cultura', 'Cultura', 'Culture', 'image'],
  ['bemestar', 'Bem-estar', 'Wellness', 'image'],
].map(([id, pt, en, type]) => ({ id, pt, en, type, poster: `/ads/${id}.jpg`, url: `/ads/${id}.${type === 'video' ? 'mp4' : 'jpg'}` }));

export function useAdCycle(elementId, enabled = true) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPlaying(false); }, []);
  useEffect(() => {
    if (!playing || !enabled) return;
    let visible = false;
    let last = performance.now();
    const element = document.getElementById(elementId);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; last = performance.now(); });
    if (element) observer.observe(element);
    const timer = setInterval(() => {
      const now = performance.now();
      const delta = now - last;
      last = now;
      if (visible && !document.hidden) setElapsed((value) => value + Math.min(delta, 500));
    }, 100);
    return () => { clearInterval(timer); observer.disconnect(); };
  }, [elementId, playing, enabled]);
  useEffect(() => {
    if (elapsed >= 10000) { setIndex((value) => (value + 1) % exampleAds.length); setElapsed(0); }
  }, [elapsed]);
  return { index, playing, elapsed, media: exampleAds[index],
    toggle: () => setPlaying((value) => !value),
    select: (next) => { setIndex(next); setElapsed(0); track('demo_select', { example: exampleAds[next].id }); },
  };
}

export function AdExamples({ cycle, lang = 'pt', disabled = false }) {
  const en = lang === 'en';
  return <div className="ad-examples">
    <div className="ad-examples-heading"><span>{en ? 'Explore sample campaigns' : 'Explore os anúncios de exemplo'}</span><button type="button" disabled={disabled} onClick={cycle.toggle}>{disabled ? (en ? 'Examples paused' : 'Exemplos em pausa') : cycle.playing ? (en ? 'Pause' : 'Pausar') : (en ? 'Play' : 'Reproduzir')}</button></div>
    <div className="ad-example-grid">{exampleAds.map((ad, index) => <button type="button" key={ad.id} aria-pressed={!disabled && cycle.index === index} onClick={() => cycle.select(index)}>
      <img src={ad.poster} alt="" loading="lazy" width="156" height="100" /><span>{en ? ad.en : ad.pt}<small>{ad.type === 'video' ? (en ? 'Video' : 'Vídeo') : (en ? 'Image' : 'Imagem')}</small></span>
    </button>)}</div>
    <div className="ad-cycle-progress" aria-hidden="true"><span style={{ width: `${disabled ? 0 : Math.min(cycle.elapsed / 100, 100)}%` }} /></div>
    <p>{en ? 'Fictional ads · 6 examples · 10 seconds each · 1-minute loop' : 'Anúncios fictícios · 6 exemplos · 10 s cada · ciclo de 1 minuto'}</p>
  </div>;
}
