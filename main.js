// Kisma · page de présentation. Aucune dépendance : tout tient dans ce fichier.
(() => {
  'use strict';
  window.KISMA_PRET = true;

  const REGLAGES = window.KISMA || {};
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointeurFin = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));
  const borne = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  // Espace insécable ordinaire : Plus Jakarta Sans n'a pas l'espace fine que donne fr-FR.
  const fcfa = (n) => Math.round(n).toLocaleString('fr-FR').replace(/\u202f/g, '\u00a0');
  const vibrer = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (_) { /* rien */ } };
  const sortie = (t) => 1 - Math.pow(1 - t, 4);

  /* ── Liens d'essai et stores (reglages.js) ───────────── */
  // Un réglage encore en %%…%% (aperçu local, avant publication) compte comme vide.
  const reglage = (v) => (v && !String(v).startsWith('%%') ? v : '');
  const lienWhatsApp = reglage(REGLAGES.whatsapp)
    ? `https://wa.me/${reglage(REGLAGES.whatsapp)}?text=${encodeURIComponent(REGLAGES.message || '')}`
    : '';
  $$('[data-essai]').forEach((a) => {
    if (lienWhatsApp) { a.href = lienWhatsApp; a.target = '_blank'; a.rel = 'noopener'; }
  });
  $$('[data-store]').forEach((a) => {
    const url = reglage((REGLAGES.stores || {})[a.dataset.store]);
    if (url) {
      a.href = url; a.target = '_blank'; a.rel = 'noopener';
      $('[data-store-etat]', a).textContent = 'Disponible sur';
    } else {
      a.classList.add('bientot');
      a.setAttribute('aria-disabled', 'true');
      a.addEventListener('click', (e) => { e.preventDefault(); toast('Bientôt sur les stores. En attendant, un agent vous l\'installe.'); });
    }
  });

  // Version de test : remplie à la publication, cachée en aperçu local.
  const version = $('[data-version]');
  if (version && version.textContent.includes('%%')) version.hidden = true;

  /* ── Petit message en bas de l'écran ────────────────── */
  let toastEl, toastMinuteur;
  function toast(texte) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.setAttribute('role', 'status');
      Object.assign(toastEl.style, {
        position: 'fixed', left: '50%', bottom: '24px', zIndex: 90, maxWidth: 'calc(100% - 32px)',
        padding: '14px 20px', borderRadius: '16px', background: '#13163A', color: '#fff',
        font: '600 14px/1.4 var(--police)', boxShadow: '0 20px 40px -12px rgba(0,0,0,.6), inset 0 0 0 1px rgba(141,152,255,.25)',
        transform: 'translate(-50%, 140%)', transition: 'transform 500ms cubic-bezier(.34,1.56,.64,1)',
      });
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = texte;
    requestAnimationFrame(() => { toastEl.style.transform = 'translate(-50%, 0)'; });
    clearTimeout(toastMinuteur);
    toastMinuteur = setTimeout(() => { toastEl.style.transform = 'translate(-50%, 140%)'; }, 3200);
  }

  /* ── Étiquettes de famille : même empreinte FNV-1a que l'app ── */
  const TEINTES = ['#E03E3E', '#1F9D57', '#3366E0', '#EA7A1C', '#8A4FDB', '#0F9AA8', '#D63F8C', '#B08A12'];
  const rvb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const melange = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  function teinte(famille, sombre) {
    let h = 0x811c9dc5;
    for (const c of famille) { h ^= c.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
    const base = rvb(TEINTES[h % TEINTES.length]);
    return sombre
      ? { encre: `rgb(${melange(base, [255, 255, 255], 0.38)})`, fond: `rgba(${base},.22)` }
      : { encre: `rgb(${melange(base, [0, 0, 0], 0.22)})`, fond: `rgba(${base},.13)` };
  }
  function peindre(el) {
    const sombre = !!el.closest('.fonctions, .tarifs, .questions');
    const t = teinte(el.dataset.famille, sombre);
    el.style.setProperty('--tag-encre', t.encre);
    el.style.setProperty('--tag-fond', t.fond);
  }
  $$('[data-famille]').forEach(peindre);

  /* ── Titres découpés en mots ────────────────────────── */
  $$('[data-split]').forEach((titre) => {
    let i = 0;
    const decouper = (noeud) => {
      [...noeud.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const morceaux = n.textContent.split(/([ \t\n\r]+)/);
          const frag = document.createDocumentFragment();
          morceaux.forEach((m) => {
            if (!m) return;
            if (/^[ \t\n\r]+$/.test(m)) { frag.appendChild(document.createTextNode(' ')); return; }
            const mot = document.createElement('span');
            mot.className = 'mot';
            const dedans = document.createElement('span');
            dedans.className = 'mot__in';
            dedans.style.setProperty('--i', i++);
            dedans.textContent = m;
            mot.appendChild(dedans);
            frag.appendChild(mot);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName.toLowerCase() !== 'svg') {
          decouper(n);
        }
      });
    };
    decouper(titre);
  });

  /* ── Apparitions au défilement ──────────────────────── */
  $$('[data-reveal]').forEach((el) => {
    const freres = [...el.parentElement.children].filter((c) => c.hasAttribute('data-reveal'));
    el.style.setProperty('--i', freres.indexOf(el));
  });
  $$('[data-hero-in]').forEach((el, i) => el.style.setProperty('--i', i));

  const surEntree = new Map();
  const observateur = new IntersectionObserver((entrees) => {
    entrees.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('vue');
      observateur.unobserve(e.target);
      const rappel = surEntree.get(e.target);
      if (rappel) rappel(e.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  const quandVisible = (el, rappel) => { if (!el) return; if (rappel) surEntree.set(el, rappel); observateur.observe(el); };
  $$('[data-reveal], [data-split], [data-anim], .carte').forEach((el) => {
    if (el.closest('.hero')) return;
    quandVisible(el);
  });

  /* Compteurs qui roulent */
  function rouler(el, de, a, duree = 1400, format = fcfa) {
    if (reduit) { el.textContent = format(a); return; }
    const debut = performance.now();
    const pas = (t) => {
      const p = borne((t - debut) / duree);
      el.textContent = format(de + (a - de) * sortie(p));
      if (p < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  }
  $$('[data-compte]').forEach((el) => {
    const cible = Number(el.dataset.compte);
    el.textContent = fcfa(0);
    const hote = el.closest('[data-reveal], [data-anim], .carte') || el;
    const lancer = () => rouler(el, 0, cible, cible > 1000 ? 1800 : 1200);
    if (hote.classList.contains('vue')) lancer();
    else {
      const ancien = surEntree.get(hote);
      surEntree.set(hote, (h) => { if (ancien) ancien(h); lancer(); });
      observateur.observe(hote);
    }
  });

  /* Éléments qui ne tournent que quand on les voit */
  const visibles = new WeakMap();
  const veille = new IntersectionObserver((entrees) => {
    entrees.forEach((e) => {
      visibles.set(e.target, e.isIntersecting);
      const rappel = e.target.__surVisibilite;
      if (rappel) rappel(e.isIntersecting);
    });
  }, { threshold: 0.05 });
  const suivreVisibilite = (el, rappel) => { if (!el) return; el.__surVisibilite = rappel; veille.observe(el); };
  const estVisible = (el) => visibles.get(el) === true;

  /* ── Intro : l'écrou se visse dans la pince ─────────── */
  const hero = $('[data-hero]');
  let heroLance = false;
  function lancerHero() {
    if (heroLance) return;
    heroLance = true;
    hero.classList.add('vue');
    $('.hero__titre', hero).classList.add('vue');
    demarrerAutoVente();
  }

  function intro() {
    // Pas d'intro si on arrive sur une section (lien partagé), avec ?sans-intro, ou déjà vue dans la session.
    if (reduit || location.hash.length > 1 || /sans-intro/.test(location.search) || sessionStorageLire('kisma-intro')) { lancerHero(); return; }
    sessionStorageEcrire('kisma-intro', '1');
    const voile = document.createElement('div');
    voile.className = 'intro';
    voile.innerHTML = `
      <div class="intro__marque" aria-hidden="true">
        <svg class="intro__k" viewBox="0 0 100 100">
          <rect class="i-fut" x="16" y="12" width="19" height="76" fill="#fff"/>
          <polygon class="i-bras" points="35,37 60,12 83,12 46,50 83,88 60,88 35,63" fill="#fff"/>
          <circle class="i-onde" cx="69" cy="50" r="14" fill="none" stroke="#FFC21F" stroke-width="2" opacity="0"/>
          <path class="i-ecrou" fill="#FFC21F" fill-rule="evenodd" d="M83 50 L76 62.12 L62 62.12 L55 50 L62 37.88 L76 37.88 Z M74 50 A5 5 0 1 0 64 50 A5 5 0 1 0 74 50 Z"/>
        </svg>
        <span class="intro__nom">${[...'kisma'].map((l) => `<span>${l}</span>`).join('')}</span>
      </div>
      <button class="intro__passer" type="button">Passer</button>`;
    document.body.appendChild(voile);
    document.documentElement.style.overflow = 'hidden';

    const fut = $('.i-fut', voile), bras = $('.i-bras', voile), ecrou = $('.i-ecrou', voile), onde = $('.i-onde', voile);
    [fut, bras, ecrou, onde].forEach((el) => { el.style.transformBox = 'fill-box'; });
    fut.style.transformOrigin = '50% 100%';
    bras.style.transformOrigin = '0% 50%';
    ecrou.style.transformOrigin = '50% 50%';
    onde.style.transformOrigin = '50% 50%';

    const ressort = 'cubic-bezier(.34,1.56,.64,1)';
    const douce = 'cubic-bezier(.16,1,.3,1)';
    const anims = [
      fut.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 450, easing: douce, fill: 'both' }),
      bras.animate([{ transform: 'scaleX(0)', opacity: 0 }, { transform: 'scaleX(1)', opacity: 1 }], { duration: 450, delay: 160, easing: douce, fill: 'both' }),
      ecrou.animate([
        { transform: 'translate(70%, -260%) rotate(-540deg) scale(.4)', opacity: 0 },
        { opacity: 1, offset: 0.25 },
        { transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: 1 },
      ], { duration: 900, delay: 320, easing: 'cubic-bezier(.2,.9,.25,1.15)', fill: 'both' }),
      bras.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(.92)' }, { transform: 'scaleX(1)' }], { duration: 260, delay: 1150, easing: 'ease-in-out' }),
      onde.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(2.6)', opacity: 0 }], { duration: 650, delay: 1200, easing: douce }),
      ...$$('.intro__nom span', voile).map((l, i) =>
        l.animate([{ opacity: 0, transform: 'translateY(40%)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: 650 + i * 55, easing: ressort, fill: 'both' })),
    ];

    let fini = false;
    const fermer = async (vite) => {
      if (fini) return;
      fini = true;
      const r = ecrou.getBoundingClientRect();
      voile.style.setProperty('--cx', `${r.left + r.width / 2}px`);
      voile.style.setProperty('--cy', `${r.top + r.height / 2}px`);
      if (vite) anims.forEach((a) => a.finish());
      setTimeout(lancerHero, vite ? 0 : 200);
      const fin = voile.animate(
        [{ clipPath: `circle(150% at ${r.left + r.width / 2}px ${r.top + r.height / 2}px)` },
         { clipPath: `circle(0% at ${r.left + r.width / 2}px ${r.top + r.height / 2}px)` }],
        { duration: vite ? 350 : 750, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' });
      await fin.finished.catch(() => {});
      voile.remove();
      document.documentElement.style.overflow = '';
    };
    $('.intro__passer', voile).addEventListener('click', () => fermer(true));
    voile.addEventListener('wheel', () => fermer(true), { passive: true, once: true });
    setTimeout(() => fermer(false), 1650);
    setTimeout(() => fermer(true), 4000);
  }
  function sessionStorageLire(c) { try { return sessionStorage.getItem(c); } catch (_) { return null; } }
  function sessionStorageEcrire(c, v) { try { sessionStorage.setItem(c, v); } catch (_) { /* rien */ } }

  /* ── Vente automatique dans le téléphone ────────────── */
  function demarrerAutoVente() {
    const app = $('[data-auto-vente]');
    if (!app) return;
    const items = $$('[data-article]', app);
    const barre = $('[data-barre]', app), nb = $('[data-nb]', app), pluriel = $('[data-pluriel]', app), total = $('[data-total]', app);
    const encaisser = $('[data-encaisser]', app), encaisse = $('[data-encaisse]', app), final = $('[data-total-final]', app);
    const doigt = $('[data-doigt]', app);
    const prix = [4600, 3500, 6500];
    const stocks = [[40, 'sac'], [120, 'barre'], [25, 'feuille']];

    const afficher = (n, montant) => {
      nb.textContent = n; pluriel.textContent = n > 1 ? 's' : '';
      total.textContent = fcfa(montant);
    };
    if (reduit) {
      afficher(3, 14600); barre.classList.add('visible');
      return;
    }
    // Positions prises dans le plan de l'écran, sans l'inclinaison 3D du téléphone.
    const vers = (el) => {
      let x = 0, y = 0;
      for (let n = el; n && n !== app; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; }
      doigt.style.setProperty('--dx', `${x + el.offsetWidth * 0.62}px`);
      doigt.style.setProperty('--dy', `${y + el.offsetHeight * 0.55}px`);
    };
    const taper = async (el) => {
      doigt.classList.remove('tape'); void doigt.offsetWidth; doigt.classList.add('tape');
      el.classList.add('presse');
      await pause(220);
      el.classList.remove('presse');
    };
    let visible = true;
    suivreVisibilite(hero, (v) => { visible = v; });
    const attendre = async (ms) => { await pause(ms); while (!visible || document.hidden) await pause(400); };

    (async function boucle() {
      for (;;) {
        stocks.forEach(([q, u], i) => { $('[data-stock]', items[i]).textContent = `${q} ${u}`; });
        afficher(0, 0);
        await attendre(1200);
        doigt.classList.add('visible');
        let montant = 0;
        for (let i = 0; i < 3; i++) {
          vers(items[i]);
          await attendre(750);
          await taper(items[i]);
          const avant = montant;
          montant += prix[i];
          barre.classList.add('visible');
          nb.textContent = i + 1; pluriel.textContent = i ? 's' : '';
          nb.classList.remove('rebond'); void nb.offsetWidth; nb.classList.add('rebond');
          rouler(total, avant, montant, 500);
          await attendre(650);
        }
        vers(encaisser);
        await attendre(800);
        await taper(encaisser);
        final.textContent = fcfa(montant);
        encaisse.classList.add('visible');
        doigt.classList.remove('visible');
        stocks.forEach(([q, u], i) => { $('[data-stock]', items[i]).textContent = `${q - 1} ${u}`; });
        await attendre(2600);
        encaisse.classList.remove('visible');
        barre.classList.remove('visible');
        await attendre(900);
      }
    })();
  }

  /* ── Navigation ─────────────────────────────────────── */
  const nav = $('[data-nav]');
  const burger = $('[data-burger]'), menu = $('[data-menu]');
  $$('a', menu).forEach((a, i) => a.style.setProperty('--i', i));
  const basculerMenu = (ouvrir) => {
    menu.hidden = !ouvrir;
    burger.setAttribute('aria-expanded', String(ouvrir));
    burger.setAttribute('aria-label', ouvrir ? 'Fermer le menu' : 'Ouvrir le menu');
    $('use', burger).setAttribute('href', ouvrir ? '#i-x' : '#i-menu');
    document.documentElement.style.overflow = ouvrir ? 'hidden' : '';
  };
  burger.addEventListener('click', () => basculerMenu(menu.hidden));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => basculerMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) basculerMenu(false); });

  const liensNav = $$('.nav__liens a');
  const sections = liensNav.map((a) => $(a.getAttribute('href')));
  const surSection = new IntersectionObserver((entrees) => {
    entrees.forEach((e) => {
      if (!e.isIntersecting) return;
      liensNav.forEach((a) => a.classList.toggle('actif', a.getAttribute('href') === `#${e.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => s && surSection.observe(s));

  /* ── Pointeur : lueur, parallaxe, inclinaisons, aimants ─ */
  if (pointeurFin && !reduit) {
    const spot = $('[data-spot]');
    const telephone = $('[data-tilt]');
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      spot.style.setProperty('--sx', `${e.clientX - r.left}px`);
      spot.style.setProperty('--sy', `${e.clientY - r.top}px`);
      hero.style.setProperty('--mx', (x - 0.5) * 2);
      hero.style.setProperty('--my', (y - 0.5) * 2);
      telephone.style.setProperty('--ry', (x - 0.5) * 16);
      telephone.style.setProperty('--rx', (0.5 - y) * 10);
    });
    hero.addEventListener('pointerleave', () => {
      telephone.style.setProperty('--ry', 0); telephone.style.setProperty('--rx', 0);
    });

    $$('[data-tilt-carte]').forEach((carte) => {
      carte.addEventListener('pointermove', (e) => {
        const r = carte.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        carte.style.setProperty('--mx', `${x * 100}%`);
        carte.style.setProperty('--my', `${y * 100}%`);
        carte.style.setProperty('--ry', `${(x - 0.5) * 7}deg`);
        carte.style.setProperty('--rx', `${(0.5 - y) * 6}deg`);
      });
      carte.addEventListener('pointerleave', () => {
        carte.style.setProperty('--ry', '0deg'); carte.style.setProperty('--rx', '0deg');
      });
    });

    $$('[data-magnet]').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.22}px ${(e.clientY - r.top - r.height / 2) * 0.3}px`;
      });
      b.addEventListener('pointerleave', () => { b.style.translate = ''; });
    });
  }

  /* ── Défilement : une seule boucle pour tout ─────────── */
  const progression = $('.progression span');
  const parallaxes = $$('[data-parallax]');
  const cahier = $('[data-cahier]');
  const page = $('[data-page]');
  const notes = $$('[data-note]');
  const solutions = $$('[data-solution]');
  const chemin = $('[data-chemin]');
  const ecrouRoule = $('[data-ecrou-roule]');
  const etapes = $('[data-etapes]');
  const geant = $('.pied__geant');
  const pistes = $$('[data-marquee]');

  const cahierCollant = () => !reduit && innerWidth > 860;
  if (cahierCollant()) cahier.classList.add('collant');
  else quandVisible(cahier, () => {
    notes.forEach((n, i) => setTimeout(() => { n.classList.add('raye'); solutions[i].classList.add('vue'); }, 500 + i * 500));
  });

  pistes.forEach((piste) => {
    const contenu = piste.innerHTML;
    piste.innerHTML = contenu + contenu + contenu;
    piste.__x = 0;
    piste.__dir = Number(piste.dataset.marquee);
  });
  let bandesVisibles = true;
  suivreVisibilite($('.bandes'), (v) => { bandesVisibles = v; });

  let dernierY = scrollY, vitesse = 0, dernierT = performance.now();
  let navCachee = false;
  const longueur = chemin ? chemin.getTotalLength() : 0;

  function image(t) {
    const dt = Math.min(64, t - dernierT); dernierT = t;
    const y = scrollY, vh = innerHeight;
    const dy = y - dernierY; dernierY = y;
    vitesse += (dy - vitesse) * 0.12;

    const max = document.documentElement.scrollHeight - vh;
    progression.style.setProperty('--p', max > 0 ? y / max : 0);

    nav.classList.toggle('compacte', y > 30);
    if (menu.hidden) {
      if (dy > 4 && y > 700 && !navCachee) { nav.classList.add('cachee'); navCachee = true; }
      else if ((dy < -4 || y < 700) && navCachee) { nav.classList.remove('cachee'); navCachee = false; }
    }

    if (!reduit) {
      parallaxes.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const centre = r.top + r.height / 2 - vh / 2;
        const decalage = -centre * Number(el.dataset.parallax);
        // Les ornements composent --py dans leur transform ; les autres flottent déjà avec « translate ».
        if (el.classList.contains('orn')) el.style.setProperty('--py', `${decalage}px`);
        else el.style.transform = `translate3d(0, ${decalage}px, 0)`;
      });

      if (bandesVisibles) {
        pistes.forEach((piste) => {
          const tiers = piste.scrollWidth / 3;
          piste.__x -= piste.__dir * (0.05 * dt + Math.abs(vitesse) * 0.35);
          if (piste.__x <= -tiers) piste.__x += tiers;
          if (piste.__x > 0) piste.__x -= tiers;
          piste.style.transform = `translate3d(${piste.__x}px,0,0)`;
        });
      }
    }

    if (cahier.classList.contains('collant')) {
      const r = cahier.getBoundingClientRect();
      const p = borne(-r.top / (r.height - vh));
      page.style.setProperty('--pr', p);
      [0.16, 0.4, 0.64].forEach((seuil, i) => {
        notes[i].classList.toggle('raye', p > seuil);
        solutions[i].classList.toggle('vue', p > seuil + 0.04);
      });
    }

    if (chemin && innerWidth > 860) {
      const r = etapes.getBoundingClientRect();
      const p = reduit ? 1 : borne((vh * 0.85 - r.top) / (r.height * 0.75));
      chemin.parentNode.style.setProperty('--trace', p);
      const pt = chemin.getPointAtLength(p * longueur);
      const svg = chemin.ownerSVGElement;
      const sx = svg.clientWidth / 1000, sy = svg.clientHeight / 120;
      ecrouRoule.style.setProperty('--ex', `${pt.x * sx}px`);
      ecrouRoule.style.setProperty('--ey', `${pt.y * sy}px`);
      ecrouRoule.style.setProperty('--er', `${p * longueur * sx * 3.4}deg`);
    }

    if (geant) {
      const r = geant.getBoundingClientRect();
      geant.style.setProperty('--pg', borne((vh - r.top) / r.height));
    }
    requestAnimationFrame(image);
  }
  requestAnimationFrame(image);

  /* ── Cartes animées des fonctions ───────────────────── */
  function cycle(el, intervalle, pas) {
    let i = 0, minuteur = null;
    suivreVisibilite(el, (v) => {
      clearInterval(minuteur);
      if (v && !reduit) minuteur = setInterval(() => pas(++i), intervalle);
    });
  }
  const docs = $$('.documents span');
  cycle($('.carte--ventes'), 1300, (i) => docs.forEach((d, j) => d.classList.toggle('on', j === i % docs.length)));

  const modes = $$('.modes span'), recu = $('.recu');
  cycle($('.carte--paiements'), 1800, (i) => {
    const k = i % modes.length;
    modes.forEach((m, j) => m.classList.toggle('on', j === k));
    recu.classList.toggle('pop', k !== 0);
    recu.querySelector('b').textContent = ['+15 000 FCFA', '+15 000 FCFA', '+8 500 FCFA'][k];
  });
  if (reduit) recu.classList.add('pop');
  else quandVisible($('.carte--paiements'), () => setTimeout(() => recu.classList.add('pop'), 900));

  const roles = $('[data-roles]');
  const boutonsRole = $$('[data-role]', roles);
  let roleTouche = false;
  const choisirRole = (role) => {
    roles.classList.toggle('vendeur', role === 'vendeur');
    boutonsRole.forEach((b) => { const on = b.dataset.role === role; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  };
  boutonsRole.forEach((b) => b.addEventListener('click', () => { roleTouche = true; choisirRole(b.dataset.role); }));
  cycle($('.carte--roles'), 2600, (i) => { if (!roleTouche) choisirRole(i % 2 ? 'vendeur' : 'patron'); });

  /* ── Démo jouable ───────────────────────────────────── */
  const ARTICLES = [
    { ref: 'MAC-00001', nom: 'Ciment CEM II 42,5', detail: 'sac 50 kg', prix: 4600, unite: 'sac', stock: 40 },
    { ref: 'FER-00001', nom: 'Fer à béton HA10', detail: 'barre 12 m', prix: 3500, unite: 'barre', stock: 120 },
    { ref: 'TOI-00001', nom: 'Tôle ondulée 0,30 mm', detail: 'la feuille', prix: 6500, unite: 'feuille', stock: 25 },
    { ref: 'PEI-00001', nom: 'Peinture à eau blanche', detail: 'seau 20 L', prix: 25000, unite: 'seau', stock: 6 },
    { ref: 'PLB-00002', nom: 'Tuyau PVC pression Ø 32', detail: 'barre de 6 m', prix: 2750, unite: 'barre', stock: 30 },
    { ref: 'QUI-00001', nom: 'Pointes 70 mm', detail: 'au kilo', prix: 1200, unite: 'kg', stock: 4 },
  ];
  const demo = $('[data-demo]');
  const tuiles = $('[data-tuiles]');
  const lignes = $('[data-panier-lignes]');
  const vide = $('[data-panier-vide]');
  const nbLignes = $('[data-panier-nb]');
  const totalDemo = $('[data-panier-total]');
  const boutonEncaisser = $('[data-encaisser-demo]');
  const texteEncaisser = $('[data-encaisser-texte]');
  const ticket = $('[data-ticket]');
  const panier = new Map();
  let modePaiement = 'Espèces', totalAffiche = 0, numeroTicket = 12;

  const pastilleStock = (a) => {
    const reste = a.stock - (panier.get(a.ref) || 0);
    const classe = reste <= 0 ? 'pastille--rupture' : reste <= 5 ? 'pastille--attente' : 'pastille--ok';
    return `<span class="pastille ${classe}">${reste} ${a.unite}</span>`;
  };
  ARTICLES.forEach((a) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tuile';
    b.dataset.ref = a.ref;
    b.setAttribute('aria-label', `Ajouter ${a.nom}, ${fcfa(a.prix)} FCFA le ${a.unite}`);
    b.innerHTML = `
      <span class="tag" data-famille="${a.ref.split('-')[0]}">${a.ref.split('-')[0]}</span>
      <span class="tuile__plus"><svg class="ico" viewBox="0 0 24 24"><use href="#i-plus"/></svg></span>
      <span class="tuile__nom">${a.nom}<small>${a.detail}</small></span>
      <span class="tuile__bas"><span class="tuile__prix">${fcfa(a.prix)} <small>/ ${a.unite}</small></span><span data-pastille>${pastilleStock(a)}</span></span>`;
    peindre($('[data-famille]', b));
    b.addEventListener('click', () => ajouter(a, b));
    tuiles.appendChild(b);
  });

  function voler(depuis, vers, texte) {
    if (reduit) return Promise.resolve();
    const a = depuis.getBoundingClientRect(), z = vers.getBoundingClientRect();
    const v = document.createElement('div');
    v.className = 'volant';
    v.textContent = texte;
    document.body.appendChild(v);
    const x0 = a.left + a.width / 2 - 30, y0 = a.top + a.height / 2 - 16;
    const x1 = z.left + z.width / 2 - 30, y1 = z.top + Math.min(z.height, 80) / 2;
    const anim = v.animate([
      { transform: `translate(${x0}px, ${y0}px) scale(.6)`, opacity: 0 },
      { transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) - 90}px) scale(1.1)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${x1}px, ${y1}px) scale(.5)`, opacity: 0.2 },
    ], { duration: 620, easing: 'cubic-bezier(.5,0,.3,1)' });
    return anim.finished.then(() => v.remove(), () => v.remove());
  }

  async function ajouter(a, tuile) {
    if (ticket.classList.contains('visible')) return;
    const deja = panier.get(a.ref) || 0;
    if (deja >= a.stock) {
      tuile.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(0)' }], { duration: 360 });
      toast(`Plus de ${a.nom.toLowerCase()} en stock : Kisma vous prévient avant la rupture.`);
      return;
    }
    vibrer(8);
    tuile.classList.remove('flash'); void tuile.offsetWidth; tuile.classList.add('flash');
    panier.set(a.ref, deja + 1);
    $('[data-pastille]', tuile).innerHTML = pastilleStock(a);
    const cible = lignes.children.length ? lignes : vide;
    await voler(tuile, cible, `+1 ${a.unite}`);
    dessinerPanier(a.ref);
  }

  function dessinerPanier(refModifiee) {
    vide.hidden = panier.size > 0;
    let total = 0;
    ARTICLES.forEach((a) => {
      const q = panier.get(a.ref);
      let li = $(`.ligne[data-ref="${a.ref}"]`, lignes);
      if (!q) { if (li) li.remove(); return; }
      total += q * a.prix;
      if (!li) {
        li = document.createElement('li');
        li.className = 'ligne';
        li.dataset.ref = a.ref;
        li.innerHTML = `<span class="ligne__nom">${a.nom}<small></small></span><b class="ligne__montant"></b>
          <button type="button" class="ligne__retirer" aria-label="Retirer ${a.nom}"><svg class="ico" viewBox="0 0 24 24"><use href="#i-x"/></svg></button>`;
        $('button', li).addEventListener('click', () => retirer(a.ref));
        lignes.appendChild(li);
        lignes.scrollTo({ top: lignes.scrollHeight, behavior: reduit ? 'auto' : 'smooth' });
      } else if (a.ref === refModifiee) {
        li.classList.remove('maj'); void li.offsetWidth; li.classList.add('maj');
      }
      $('small', li).textContent = `${q} ${a.unite} × ${fcfa(a.prix)} FCFA`;
      $('.ligne__montant', li).textContent = fcfa(q * a.prix);
    });
    const n = panier.size;
    nbLignes.textContent = `${n} ligne${n > 1 ? 's' : ''}`;
    nbLignes.classList.remove('rebond'); void nbLignes.offsetWidth; nbLignes.classList.add('rebond');
    rouler(totalDemo, totalAffiche, total, 450);
    totalAffiche = total;
    boutonEncaisser.disabled = n === 0;
    texteEncaisser.textContent = n ? `Encaisser ${fcfa(total)} FCFA` : 'Encaisser';
  }

  function retirer(ref) {
    const li = $(`.ligne[data-ref="${ref}"]`, lignes);
    panier.delete(ref);
    const a = ARTICLES.find((x) => x.ref === ref);
    $('[data-pastille]', $(`.tuile[data-ref="${ref}"]`)).innerHTML = pastilleStock(a);
    if (li && !reduit) { li.classList.add('sort'); setTimeout(() => dessinerPanier(), 280); }
    else dessinerPanier();
  }

  $$('[data-modes] button').forEach((b) => b.addEventListener('click', () => {
    modePaiement = b.dataset.mode;
    $$('[data-modes] button').forEach((x) => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-checked', String(on)); });
  }));

  boutonEncaisser.addEventListener('click', () => {
    if (!panier.size) return;
    vibrer([12, 40, 18]);
    const ul = $('[data-ticket-lignes]');
    ul.innerHTML = '';
    let total = 0;
    ARTICLES.forEach((a) => {
      const q = panier.get(a.ref);
      if (!q) return;
      total += q * a.prix;
      const li = document.createElement('li');
      li.innerHTML = `<span>${q} ${a.unite} ${a.nom}</span><b>${fcfa(q * a.prix)}</b>`;
      ul.appendChild(li);
    });
    $('[data-ticket-num]').textContent = `TIC-2026-A-${String(numeroTicket++).padStart(5, '0')}`;
    $('[data-ticket-total]').textContent = `${fcfa(total)} FCFA`;
    $('[data-ticket-mode]').textContent = `Payé en ${modePaiement === 'Espèces' ? 'espèces' : modePaiement}`;
    ticket.classList.add('visible');
    confettis(boutonEncaisser);
    ARTICLES.forEach((a) => { a.stock -= panier.get(a.ref) || 0; });
    panier.clear();
    $('[data-nouvelle-vente]').focus({ preventScroll: true });
  });
  $('[data-nouvelle-vente]').addEventListener('click', () => {
    ticket.classList.remove('visible');
    ARTICLES.forEach((a) => { $('[data-pastille]', $(`.tuile[data-ref="${a.ref}"]`)).innerHTML = pastilleStock(a); });
    lignes.innerHTML = '';
    totalAffiche = 0;
    dessinerPanier();
    boutonEncaisser.focus({ preventScroll: true });
  });
  dessinerPanier();
  nbLignes.classList.remove('rebond');

  function confettis(depuis) {
    if (reduit) return;
    const zone = $('[data-confettis]');
    const z = zone.getBoundingClientRect(), b = depuis.getBoundingClientRect();
    const x0 = b.left - z.left + b.width / 2, y0 = b.top - z.top + b.height / 2;
    const formes = ['ecrou', 'etoile', 'losange'];
    const couleurs = ['#1B2060', '#3442D9', '#E03E3E', '#1F9D57', '#FFFFFF', '#D63F8C', '#0F9AA8'];
    for (let i = 0; i < 46; i++) {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      el.setAttribute('viewBox', '0 0 100 100');
      el.classList.add('confetti');
      const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttribute('href', `#${formes[i % formes.length]}`);
      el.appendChild(use);
      el.style.fill = couleurs[i % couleurs.length];
      el.style.setProperty('--creux', 'transparent');
      const taille = 10 + Math.random() * 16;
      el.style.width = el.style.height = `${taille}px`;
      zone.appendChild(el);
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
      const force = 260 + Math.random() * 360;
      const dx = Math.cos(angle) * force, dy = Math.sin(angle) * force;
      const tour = (Math.random() - 0.5) * 1080;
      el.animate([
        { transform: `translate(${x0}px, ${y0}px) rotate(0deg) scale(.3)`, opacity: 1 },
        { transform: `translate(${x0 + dx * 0.7}px, ${y0 + dy * 0.8}px) rotate(${tour / 2}deg) scale(1)`, opacity: 1, offset: 0.4 },
        { transform: `translate(${x0 + dx}px, ${y0 + dy * 0.4 + 420}px) rotate(${tour}deg) scale(.8)`, opacity: 0 },
      ], { duration: 1400 + Math.random() * 700, easing: 'cubic-bezier(.2,.6,.4,1)' }).finished.then(() => el.remove(), () => el.remove());
    }
  }

  /* ── Hors ligne ─────────────────────────────────────── */
  const sectionHL = $('[data-horsligne]');
  const reseau = $('[data-reseau]');
  const reseauTexte = $('[data-reseau-texte]');
  const nuage = $('[data-nuage]');
  const nuageIco = $('[data-nuage-ico]');
  const listeHL = $('[data-synchro-liste]');
  const compteurHL = $('[data-synchro-compteur]');
  const etatHL = $('[data-synchro-etat]');
  const VENTES = [
    ['Ciment CEM II · 5 sac', 23000], ['Fer HA10 · 12 barre', 42000], ['Tôle ondulée · 4 feuille', 26000],
    ['Pointes 70 mm · 2 kg', 2400], ['Peinture à eau · 1 seau', 25000], ['Tuyau PVC · 6 barre', 16500], ['Câble 2,5 mm² · 25 m', 8325],
  ];
  let enLigne = true, numeroHL = 31, indexVente = 0;

  function ajouterVente(attente) {
    const [libelle, montant] = VENTES[indexVente++ % VENTES.length];
    const li = document.createElement('li');
    li.className = `vente${attente ? ' attente' : ''}`;
    li.innerHTML = `<span class="vente__ico"><svg class="ico" viewBox="0 0 24 24"><use href="${attente ? '#i-clock' : '#i-check'}"/></svg></span>
      <span class="vente__texte"><b>${fcfa(montant)} FCFA</b><small>TIC-2026-A-${String(numeroHL++).padStart(5, '0')} · ${libelle}</small></span>
      <span class="vente__etat">${attente ? 'En attente' : 'Envoyée'}</span>`;
    listeHL.prepend(li);
    while (listeHL.children.length > 6) {
      const envoyees = $$('.vente:not(.attente)', listeHL);
      (envoyees.length ? envoyees[envoyees.length - 1] : listeHL.lastElementChild).remove();
    }
    if (!attente) { nuage.classList.remove('recoit'); void nuage.offsetWidth; nuage.classList.add('recoit'); }
    majCompteur();
  }
  function majCompteur() {
    const n = $$('.vente.attente', listeHL).length;
    compteurHL.textContent = `${n} en attente`;
    compteurHL.classList.toggle('attente', n > 0);
    etatHL.textContent = !enLigne ? 'Hors ligne : les ventes restent sur l\'appareil' : n ? 'Envoi en cours…' : 'Tout est à jour';
  }
  async function envoyerAttente() {
    const enAttente = $$('.vente.attente', listeHL).reverse();
    for (const li of enAttente) {
      if (!enLigne) return;
      await pause(reduit ? 0 : 380);
      li.classList.remove('attente');
      li.classList.add('envoi');
      $('use', li).setAttribute('href', '#i-check');
      $('.vente__etat', li).textContent = 'Envoyée';
      nuage.classList.remove('recoit'); void nuage.offsetWidth; nuage.classList.add('recoit');
      majCompteur();
    }
  }
  reseau.addEventListener('click', () => {
    enLigne = !enLigne;
    reseau.setAttribute('aria-checked', String(enLigne));
    sectionHL.classList.toggle('coupe', !enLigne);
    reseauTexte.textContent = enLigne ? 'Internet allumé' : 'Internet coupé';
    nuageIco.setAttribute('href', enLigne ? '#i-cloud' : '#i-cloud-off');
    vibrer(10);
    majCompteur();
    if (enLigne) envoyerAttente();
    else setTimeout(() => { if (!enLigne) ajouterVente(true); }, 500);
  });
  for (let i = 0; i < 3; i++) ajouterVente(false);
  nuage.classList.remove('recoit');
  let minuteurHL = null;
  suivreVisibilite(sectionHL, (v) => {
    clearInterval(minuteurHL);
    if (!v || reduit) return;
    minuteurHL = setInterval(() => {
      if (document.hidden) return;
      if (enLigne) ajouterVente(false);
      else if ($$('.vente.attente', listeHL).length < 6) ajouterVente(true);
    }, enLigne ? 2600 : 1700);
  });
  reseau.addEventListener('click', () => { if (estVisible(sectionHL)) sectionHL.__surVisibilite(true); });

  /* ── Tarifs ─────────────────────────────────────────── */
  const duree = $('[data-duree]');
  const curseur = $('.duree__curseur');
  const placerCurseur = () => {
    const on = $('button.on', duree);
    curseur.style.setProperty('--cg', `${on.offsetLeft}px`);
    curseur.style.setProperty('--cl', `${on.offsetWidth}px`);
  };
  placerCurseur();
  addEventListener('resize', placerCurseur);
  if (document.fonts) document.fonts.ready.then(placerCurseur);
  const afficherPrix = (periode, animer) => {
    $$('[data-prix]').forEach((b) => {
      const mensuel = Number(b.dataset.prix);
      const avant = Number(b.dataset.affiche || mensuel);
      const apres = periode === 'an' ? mensuel * 10 : mensuel;
      b.dataset.affiche = apres;
      if (animer) rouler(b, avant, apres, 600); else b.textContent = fcfa(apres);
    });
    $$('[data-par]').forEach((s) => { s.textContent = periode === 'an' ? '/ an' : '/ mois'; });
    $$('[data-jour]').forEach((p) => {
      const mensuel = Number(p.dataset.jour);
      const parJour = periode === 'an' ? (mensuel * 10) / 365 : mensuel / 30;
      p.textContent = `soit environ ${fcfa(parJour)} FCFA par jour`;
    });
  };
  afficherPrix('mois', false);
  $$('[data-periode]', duree).forEach((b) => b.addEventListener('click', () => {
    $$('[data-periode]', duree).forEach((x) => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-checked', String(on)); });
    placerCurseur();
    afficherPrix(b.dataset.periode, true);
  }));

  /* ── Questions : ouverture en douceur, une à la fois ── */
  $$('[data-faq] details').forEach((d) => {
    const s = $('summary', d), corps = $('.faq__reponse', d);
    s.addEventListener('click', (e) => {
      e.preventDefault();
      if (reduit) { d.open = !d.open; return; }
      if (d.open) {
        const h = corps.offsetHeight;
        corps.animate([{ height: `${h}px`, opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)' })
          .finished.then(() => { d.open = false; }, () => { d.open = false; });
      } else {
        $$('[data-faq] details[open]').forEach((autre) => { if (autre !== d) $('summary', autre).click(); });
        d.open = true;
        const h = corps.offsetHeight;
        corps.animate([{ height: '0px', opacity: 0 }, { height: `${h}px`, opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
    });
  });

  /* ── C'est parti ────────────────────────────────────── */
  if (!lienWhatsApp) console.info('Kisma : numéro WhatsApp à renseigner dans site/reglages.js');
  intro();
})();
