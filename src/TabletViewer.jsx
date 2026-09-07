import { useCallback, useEffect, useRef, useState } from 'react';
import { AdExamples, useAdCycle } from './AdExamples.jsx';
import { pageLink } from './routes.js';
import { track } from './analytics.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import './tablet.css';

const SCREEN_RATIO = 2.342 / 1.505;
const ignoreVideoState = () => {};

function exampleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1560;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#dcd8ef'; ctx.fillRect(0, 0, 1560, 1000);
  ctx.fillStyle = '#b5aedb'; ctx.beginPath(); ctx.arc(1420, 960, 530, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#272238'; ctx.font = 'bold 30px sans-serif'; ctx.fillText('CARTISE', 100, 110);
  ctx.font = '80px sans-serif'; ctx.fillText('A sua marca.', 100, 365); ctx.fillText('Dentro da viagem.', 100, 465);
  ctx.font = '28px sans-serif'; ctx.fillText('Um novo ponto de contacto.', 105, 550);
  ctx.fillStyle = '#272238'; ctx.beginPath(); ctx.roundRect(100, 735, 410, 85, 43); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.font = '26px sans-serif'; ctx.fillText('Publicidade em movimento', 135, 788);
  ctx.fillStyle = '#615974'; ctx.font = '21px sans-serif'; ctx.fillText('CAMPANHA DE DEMONSTRAÇÃO', 100, 925);
  const texture = new THREE.CanvasTexture(canvas);
  texture.flipY = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function disposeModel(model) {
  model?.traverse((object) => {
    object.geometry?.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => material?.dispose());
  });
}

// Reusable viewer: media is { url, type: 'image' | 'video' }. Local files stay in the browser.
export function TabletViewer({ media, resetPosition = 0, paused = false, onStatus, onVideoState = ignoreVideoState, controlsRef, lang = 'pt' }) {
  const host = useRef(null);
  const runtime = useRef(null);
  const [ready, setReady] = useState(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const report = useCallback(message => {
    const messages = {
      'O navegador não conseguiu iniciar o 3D. Experimente outro navegador.': '3D is unavailable in this browser. The image preview remains available.',
      'O modelo não contém o ecrã esperado.': 'The expected screen is missing from the model.',
      'Não foi possível carregar o tablet. Atualize a página para tentar novamente.': 'The tablet could not load. Refresh to retry.',
      'A preparar o vídeo…': 'Preparing video…',
      'Prima Reproduzir para iniciar o vídeo.': 'Press Play to start the video.',
      'Este vídeo não pôde ser aberto. Experimente MP4 (H.264) ou WebM.': 'This video could not open. Try MP4 (H.264) or WebM.',
      'A preparar a imagem…': 'Preparing image…',
      'Não foi possível abrir esta imagem. Experimente JPG, PNG ou WebP.': 'This image could not open. Try JPG, PNG or WebP.',
      'Não foi possível iniciar o vídeo.': 'The video could not start.',
    };
    onStatus(lang === 'en' ? (messages[message] || message) : message);
  }, [lang, onStatus]);

  useEffect(() => {
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch { report('O navegador não conseguiu iniciar o 3D. Experimente outro navegador.'); return; }
    const container = host.current;
    let disposed = false;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, .01, 100);
    camera.position.set(0, 0, 4);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false; controls.enableZoom = false;
    controls.enableDamping = false; controls.rotateSpeed = .65;
    controls.minPolarAngle = Math.PI * .12;
    controls.maxPolarAngle = Math.PI * .88;
    controls.update(); controls.saveState();
    if (controlsRef) controlsRef.current = controls;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, .04);
    scene.environment = environment.texture;
    room.dispose(); pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8c819e, 2));
    const key = new THREE.DirectionalLight(0xffffff, 3); key.position.set(-3, 4, 5); scene.add(key);
    let model;
    let corners = [];
    const projected = new THREE.Vector3();
    function fitTablet() {
      camera.updateMatrixWorld();
      let tangent = Math.max(.88, 1.3 / camera.aspect) / 4;
      for (const corner of corners) {
        projected.copy(corner).applyMatrix4(camera.matrixWorldInverse);
        tangent = Math.max(tangent, Math.abs(projected.y) / -projected.z * 1.07,
          Math.abs(projected.x) / -projected.z / camera.aspect * 1.07);
      }
      camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(tangent));
      camera.updateProjectionMatrix();
    }
    const resize = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height); camera.aspect = width / height;
      fitTablet();
      renderer.render(scene, camera);
    });
    resize.observe(container);
    runtime.current = { renderer, scene, camera, controls };
    new GLTFLoader().load('/models/cartise-tablet.glb', (gltf) => {
      if (disposed) { disposeModel(gltf.scene); return; }
      model = gltf.scene;
      // Match the illustrative tablet to the artwork, preserving the full image.
      const originalHeight = model.scale.y;
      runtime.current.fitMedia = (ratio) => {
        model.scale.y = originalHeight * SCREEN_RATIO / ratio;
        const bounds = new THREE.Box3().setFromObject(model);
        corners = [bounds.min.x, bounds.max.x].flatMap(x =>
          [bounds.min.y, bounds.max.y].flatMap(y =>
            [bounds.min.z, bounds.max.z].map(z => new THREE.Vector3(x, y, z))));
        fitTablet();
      };
      runtime.current.fitMedia(SCREEN_RATIO);
      const screen = model.getObjectByName('Screen');
      if (!screen) { disposeModel(model); report('O modelo não contém o ecrã esperado.'); return; }
      screen.material.dispose();
      screen.material = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
      scene.add(model); runtime.current.screen = screen;
      fitTablet(); renderer.render(scene, camera);
      setReady(true); report('');
    }, undefined, () => { if (!disposed) report('Não foi possível carregar o tablet. Atualize a página para tentar novamente.'); });
    let visible = true;
    function syncVideo() {
      const video = runtime.current?.video;
      if (!video) return;
      if (!visible || document.hidden || pausedRef.current) video.pause();
      else if (video.readyState >= 2) video.play().catch(() => {});
    }
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (runtime.current) runtime.current.visible = visible;
      syncVideo();
    });
    document.addEventListener('visibilitychange', syncVideo);
    visibility.observe(container);
    renderer.setAnimationLoop(() => {
      if (visible && !document.hidden) { controls.update(); fitTablet(); renderer.render(scene, camera); }
    });
    return () => {
      disposed = true; setReady(false); runtime.current = null;
      if (controlsRef) controlsRef.current = null;
      renderer.setAnimationLoop(null); resize.disconnect(); visibility.disconnect();
      document.removeEventListener('visibilitychange', syncVideo);
      controls.dispose(); disposeModel(model); environment.dispose(); renderer.dispose();
      renderer.domElement.remove();
    };
  }, [report, controlsRef]);

  useEffect(() => {
    const rt = runtime.current;
    if (!ready || !rt?.screen) return;
    let cancelled = false;
    let texture;
    let video;
    function apply(next, width, height) {
      if (cancelled) { next.dispose(); return; }
      texture = next; texture.flipY = false; texture.colorSpace = THREE.SRGBColorSpace;
      rt.fitMedia(width / height);
      rt.screen.material.map = texture; rt.screen.material.needsUpdate = true;
      rt.renderer.render(rt.scene, rt.camera);
      report('');
    }
    if (!media) apply(exampleTexture(), 1560, 1000);
    else if (media.type === 'video') {
      report('A preparar o vídeo…');
      video = document.createElement('video'); video.crossOrigin = 'anonymous';
      video.muted = true; video.loop = true; video.playsInline = true; video.preload = 'auto';
      video.onloadeddata = () => {
        if (cancelled) return;
        apply(new THREE.VideoTexture(video), video.videoWidth, video.videoHeight);
        if (!pausedRef.current && !document.hidden && rt.visible !== false) video.play().catch(() => { if (!cancelled) { onVideoState(true); report('Prima Reproduzir para iniciar o vídeo.'); } });
      };
      video.onerror = () => { if (!cancelled) report('Este vídeo não pôde ser aberto. Experimente MP4 (H.264) ou WebM.'); };
      rt.video = video; video.src = media.url; video.load();
    } else {
      report('A preparar a imagem…');
      new THREE.TextureLoader().load(media.url, (next) => apply(next, next.image.width, next.image.height), undefined,
        () => { if (!cancelled) report('Não foi possível abrir esta imagem. Experimente JPG, PNG ou WebP.'); });
    }
    return () => {
      cancelled = true;
      if (video) { video.onloadeddata = null; video.onerror = null; video.pause(); video.removeAttribute('src'); video.load(); }
      rt.video = null; rt.screen.material.map = null; rt.screen.material.needsUpdate = true; texture?.dispose();
    };
  }, [ready, media, report, onVideoState]);

  useEffect(() => {
    const video = runtime.current?.video;
    if (!video) return;
    if (paused || document.hidden || runtime.current?.visible === false) video.pause();
    else if (video.readyState >= 2) video.play().then(() => report('')).catch(() => { onVideoState(true); report('Não foi possível iniciar o vídeo.'); });
  }, [paused, ready, report, onVideoState]);

  useEffect(() => {
    const rt = runtime.current;
    if (!rt) return;
    rt.controls.reset();
  }, [resetPosition, ready]);
  return <div ref={host} className="tablet-canvas" role="img" aria-label={lang === 'en' ? 'Cartise 3D tablet. Drag horizontally or vertically; use the adjacent arrow control with a keyboard.' : 'Tablet 3D Cartise. Arraste na horizontal ou vertical; use o controlo de setas adjacente com o teclado.'}>{!ready && <img className="viewer-poster" src={media?.poster || '/ads/cafe.jpg'} alt={lang === 'en' ? 'Fictional ad preview' : 'Pré-visualização de anúncio fictício'} />}</div>;
}

function RotationPad({ controlsRef, lang = 'pt' }) {
  const drag = useRef(null);
  const [offset, setOffset] = useState([0, 0]);
  function rotate(x, y) {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.rotateLeft(x); controls.rotateUp(y); controls.update();
  }
  function finish(event) {
    const start = drag.current;
    if (!start || start.id !== event.pointerId) return;
    if (!start.moved && event.type === 'pointerup') {
      const box = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - box.left - box.width / 2;
      const y = event.clientY - box.top - box.height / 2;
      if (Math.max(Math.abs(x), Math.abs(y)) > 6) {
        rotate(Math.abs(x) > Math.abs(y) ? Math.sign(x) * .22 : 0,
          Math.abs(y) >= Math.abs(x) ? Math.sign(y) * .22 : 0);
      }
    }
    drag.current = null; setOffset([0, 0]);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }
  return <button type="button" className="tablet-rotation-pad"
    aria-label={lang === 'en' ? 'Rotate tablet: drag the ball or use arrow keys' : 'Rodar tablet: arraste a bolinha ou use as teclas de setas'}
    onPointerDown={(event) => {
      if (event.button !== 0 || drag.current) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = { id:event.pointerId, x:event.clientX, y:event.clientY, originX:event.clientX, originY:event.clientY, moved:false };
    }}
    onPointerMove={(event) => {
      const start = drag.current;
      if (!start || start.id !== event.pointerId) return;
      const x = event.clientX - start.originX, y = event.clientY - start.originY;
      if (!start.moved && Math.hypot(x, y) < 3) return;
      start.moved = true;
      rotate((event.clientX - start.x) * .014, (event.clientY - start.y) * .014);
      start.x = event.clientX; start.y = event.clientY;
      const scale = Math.min(1, 4 / (Math.hypot(x, y) || 1));
      setOffset([x * scale, y * scale]);
    }}
    onPointerUp={finish} onPointerCancel={finish}
    onLostPointerCapture={() => { drag.current = null; setOffset([0, 0]); }}
    onKeyDown={(event) => {
      const directions = { ArrowLeft:[-.16,0], ArrowRight:[.16,0], ArrowUp:[0,-.16], ArrowDown:[0,.16] };
      if (directions[event.key]) { event.preventDefault(); rotate(...directions[event.key]); }
    }}>
    <svg className="rotation-arrows" viewBox="0 0 44 44" aria-hidden="true" fill="none">
      <path d="M19.5 14.5 22 12 24.5 14.5 M29.5 19.5 32 22 29.5 24.5 M19.5 29.5 22 32 24.5 29.5 M14.5 19.5 12 22 14.5 24.5" />
    </svg>
    <span className="rotation-ball" aria-hidden="true" style={{ transform:`translate(${offset[0]}px, ${offset[1]}px)` }} />
  </button>;
}

export function TabletShowcase({ lang = 'pt', media, paused = false }) {
  const controlsRef = useRef(null);
  const [status, setStatus] = useState('');
  const [resetPosition, setResetPosition] = useState(0);
  const en = lang === 'en';
  return <div className="tablet-stage tablet-home">
    <div className="tablet-stage-label"><span>CARTISE</span><span>{en ? 'YOUR CAMPAIGN, HERE' : 'A SUA CAMPANHA, AQUI'}</span></div>
    <TabletViewer lang={lang} media={media} paused={paused} controlsRef={controlsRef} resetPosition={resetPosition} onStatus={setStatus} />
    <div className="tablet-status" role="status">{status}</div>
    <div className="tablet-stage-footer"><span>{en ? 'Drag to rotate' : 'Arraste para rodar'}</span><div className="tablet-control-group"><RotationPad controlsRef={controlsRef} lang={lang} /><div className="tablet-views"><button onClick={() => setResetPosition(value => value + 1)}>{en ? 'Reset position' : 'Repor posição'}</button></div></div></div>
  </div>;
}

export default function TabletDemo({ lang = 'pt' }) {
  const en = lang === 'en';
  const controlsRef = useRef(null);
  const [media, setMedia] = useState(null);
  const cycle = useAdCycle('tablet-preview', !media);
  const [resetPosition, setResetPosition] = useState(0);
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState('');
  const [fileError, setFileError] = useState('');
  const input = useRef(null);
  useEffect(() => () => { if (media?.url) URL.revokeObjectURL(media.url); }, [media]);
  useEffect(() => {
    const id = new URLSearchParams(location.search).get('example');
    const ids = ['cafe', 'viagem', 'evento', 'comida', 'cultura', 'bemestar'];
    if (ids.includes(id)) cycle.select(ids.indexOf(id));
  }, []);
  function chooseFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'].includes(file.type)) {
      setFileError(en ? 'Choose JPG, PNG, WebP, MP4 or WebM.' : 'Escolha JPG, PNG, WebP, MP4 ou WebM.'); event.target.value = ''; return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setFileError(en ? 'The local studio accepts files up to 100 MB.' : 'O estúdio local aceita ficheiros até 100 MB.'); event.target.value = ''; return;
    }
    setFileError(''); setPaused(false);
    setMedia({ url: URL.createObjectURL(file), type: file.type.startsWith('video/') ? 'video' : 'image', name: file.name });
    track('demo_file_preview', { example: file.type.startsWith('video/') ? 'video' : 'image' });
  }
  return <div className="tablet-demo">
    <div className="tablet-layout">
      <section className="tablet-copy"><p className="eyebrow">{en ? 'Campaign studio' : 'Estúdio de campanha'}</p><h1>{en ? 'Your brand.' : 'A sua marca.'}<br /><span>{en ? 'Inside the journey.' : 'Dentro da viagem.'}</span></h1><p>{en ? 'Try an image or video on the tablet. Drag to explore the format.' : 'Experimente uma imagem ou um vídeo no tablet. Arraste para explorar o formato.'}</p>
        <AdExamples disabled={!!media} cycle={{ ...cycle, select: index => { setMedia(null); setPaused(false); cycle.select(index); if (input.current) input.current.value = ''; } }} lang={lang} />
        <button className="solid-button" onClick={() => input.current.click()}>{en ? 'Try my image or video' : 'Experimentar a minha imagem ou vídeo'} <span>↗</span></button>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={chooseFile} hidden />
        <details className="brief-details"><summary>{en ? 'Studio file specifications' : 'Ficheiros aceites no estúdio'}</summary><p className="small-copy">{en ? 'Images: JPG, PNG or WebP. Videos: MP4 or WebM, depending on browser support, played without sound. Up to 100 MB per file. The preview adapts to the file proportions. Confirm campaign delivery specifications before preparing final files.' : 'Imagens: JPG, PNG ou WebP. Vídeos: MP4 ou WebM, conforme o navegador, reproduzidos sem som. Até 100 MB por ficheiro. A pré-visualização adapta-se à proporção do ficheiro. Confirme a ficha técnica da campanha antes de preparar os materiais finais.'}</p></details><p className="tablet-note">{en ? 'Your file stays in this browser (up to 100 MB). The tablet adapts to your file’s proportions without cropping. Demo duration and formats do not define campaign terms.' : 'O ficheiro fica neste navegador (até 100 MB). O tablet adapta-se às proporções do ficheiro, sem recortar. Duração e formatos da demo não definem as condições da campanha.'}</p>
        {fileError && <p className="form-error" role="alert">{fileError}</p>}
        {media && <div className="tablet-file"><span>{media.name}</span><button onClick={() => { setMedia(null); setPaused(false); input.current.value = ''; }}>{en ? 'Restore examples' : 'Repor exemplos'}</button></div>}
        {media?.type === 'video' && <button className="tablet-play" onClick={() => setPaused(!paused)}>{paused ? (en ? 'Play' : 'Reproduzir') : (en ? 'Pause' : 'Pausar')} {en ? 'video · muted' : 'vídeo · sem som'}</button>}
        <a className="brands-demo-link" data-track="proposal_from_studio" href={`${pageLink('contact', lang)}?example=${media ? media.type : cycle.media.id}`}>{en ? 'Request a proposal for this campaign' : 'Pedir proposta para esta campanha'} ↗</a>
        <p className="small-copy">{en ? 'Only the example reference or material type is carried over. Your file is not sent.' : 'Segue apenas a referência do exemplo ou o tipo de material. O ficheiro não é enviado.'}</p>
      </section>
      <section className="tablet-stage" id="tablet-preview" aria-label={en ? 'Tablet preview' : 'Pré-visualização do tablet'}><div className="tablet-stage-label"><span>TABLET CARTISE</span><span>{en ? 'INTERACTIVE VIEW' : 'VISTA INTERATIVA'}</span></div><TabletViewer lang={lang} controlsRef={controlsRef} media={media || cycle.media} resetPosition={resetPosition} paused={media ? paused : !cycle.playing} onStatus={setStatus} onVideoState={setPaused} /><div className="tablet-status" role="status">{status}</div><div className="tablet-stage-footer"><span>{en ? 'Drag to rotate' : 'Arraste para rodar'}</span><div className="tablet-control-group"><RotationPad controlsRef={controlsRef} lang={lang} /><div className="tablet-views"><button onClick={() => setResetPosition(value => value + 1)}>{en ? 'Reset position' : 'Repor posição'}</button></div></div></div></section>
    </div>
    <div className="tablet-bottom"><a href={pageLink('formats', lang)}>{en ? 'View formats and specifications ↗' : 'Ver formatos e especificações ↗'}</a><span>{en ? 'Illustrative model · approximate dimensions' : 'Modelo ilustrativo · dimensões aproximadas'}</span></div>
  </div>;
}
