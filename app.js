/* PT. Yasa Utama Kreasi — motion engine
   GSAP + ScrollTrigger + Lenis, with a fully readable no-JS / no-CDN fallback. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.toggle('gsap-live', hasGSAP && !reduce);

  /* ---------- 1. live thing (works with or without script) ---------- */
  (function () {
    var live = document.querySelector('[data-live]');
    if (!live) return;
    var choices = Array.prototype.slice.call(live.querySelectorAll('[data-choice]'));
    var result = live.querySelector('[data-result]');
    var action = live.querySelector('[data-action]');
    if (!choices.length || !result || !action) return;
    var base = 'Mulai percakapan dengan PT. Yasa Utama Kreasi';
    var advice = {
      Strategi: 'Kami akan mulai dengan menuliskan keputusan yang sedang Anda pertimbangkan dan apa yang harus benar agar keputusan itu tepat.',
      Operasi: 'Kami akan mulai dengan memetakan satu perjalanan pelanggan dari kontak pertama hingga penyerahan, lalu mencatat waktu setiap langkah.',
      Pertumbuhan: 'Kami akan mulai dengan mendaftar cara-cara permintaan bisa menjangkau Anda berikutnya, lalu menguji yang paling kecil terlebih dahulu.',
      'Tata Kelola': 'Kami akan mulai dengan menuliskan siapa memutuskan apa, dan di mana bukti untuk setiap keputusan disimpan.'
    };
    function mailto(topic) {
      var subject = topic ? base + ' — ' + topic : base;
      var body = topic
        ? 'Halo,\n\nSaya ingin berbicara tentang ' + topic.toLowerCase() + '.\n\n'
        : 'Halo,\n\nSaya ingin memulai percakapan.\n\n';
      action.href = 'mailto:halo@yukreasi.id?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    }
    mailto(null);
    choices.forEach(function (b) {
      b.addEventListener('click', function () {
        var topic = b.dataset.choice;
        choices.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        result.textContent = topic + '. ' + (advice[topic] || 'Mari kita bahas bersama.');
        mailto(topic);
      });
    });
  })();

  /* ---------- 2. footage respects reduced motion ---------- */
  (function () {
    var v = document.querySelector('video');
    if (!v) return;
    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    function apply() {
      if (mq.matches) { v.pause(); try { v.currentTime = 0; } catch (e) {} }
      else { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    }
    apply();
    if (mq.addEventListener) mq.addEventListener('change', apply);
  })();

  /* ---------- 3. scroll progress + smooth scroll ---------- */
  var lenis = null;
  var bar = document.querySelector('.scroll-progress span');
  function progress(y) {
    if (!bar) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + '%';
  }
  if (hasGSAP && !reduce && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    lenis.on('scroll', function (e) { progress(e.scroll); ScrollTrigger.update(); });
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  } else {
    window.addEventListener('scroll', function () { progress(window.scrollY || window.pageYOffset); }, { passive: true });
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var sel = a.getAttribute('href');
      var target = sel && sel.length > 1 ? document.querySelector(sel) : null;
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -20 });
      else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------- GSAP choreography ---------- */
  if (hasGSAP && !reduce) {

    /* split hero into word wrappers, then curtain them up */
    (function () {
      var title = document.querySelector('[data-split]');
      if (!title) return;
      var frag = document.createDocumentFragment();
      Array.prototype.forEach.call(title.childNodes, function (node) {
        if (node.nodeType === 3 && node.textContent.trim()) {
          node.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part.trim()) { frag.appendChild(document.createTextNode(' ')); return; }
            var wrap = document.createElement('span');
            wrap.className = 'word-wrap';
            var inner = document.createElement('span');
            inner.className = 'word';
            inner.textContent = part;
            wrap.appendChild(inner);
            frag.appendChild(wrap);
          });
        } else {
          frag.appendChild(node.cloneNode(true));
        }
      });
      title.replaceChildren(frag);
      gsap.from(title.querySelectorAll('.word'), {
        yPercent: 118, opacity: 0, duration: 0.85, stagger: 0.035,
        ease: 'expo.out', delay: 0.08
      });
      gsap.from(['.hero__kicker', '.hero__sub', '.hero__actions', '.hero__foot'], {
        y: 26, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out', delay: 0.55
      });
      gsap.from('.nav', { y: -30, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.2 });
    })();

    /* scrub the idea sentence from dim to lit, word by word */
    (function () {
      var el = document.querySelector('[data-scrub]');
      if (!el) return;
      var text = el.textContent.trim().replace(/\s+/g, ' ').split(' ');
      var frag = document.createDocumentFragment();
      text.forEach(function (w) {
        var s = document.createElement('span');
        s.className = 'w';
        s.textContent = w + ' ';
        frag.appendChild(s);
      });
      el.replaceChildren(frag);
      gsap.to(el.querySelectorAll('.w'), {
        opacity: 1, ease: 'none', stagger: 0.12,
        scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 58%', scrub: true }
      });
    })();

    /* pinned horizontal track */
    (function () {
      var section = document.querySelector('.horizontal');
      var track = section && section.querySelector('.h-track');
      if (!section || !track) return;
      var distance = function () { return Math.max(1, track.scrollWidth - window.innerWidth); };
      gsap.to(track, {
        x: function () { return -distance(); }, ease: 'none',
        scrollTrigger: {
          trigger: section, pin: true, scrub: 1, anticipatePin: 1,
          start: 'top top', end: function () { return '+=' + distance(); },
          invalidateOnRefresh: true
        }
      });
    })();

    /* stacked contact cards */
    (function () {
      var cards = gsap.utils.toArray('.stack-card');
      if (!cards.length) return;
      var n = cards.length;
      cards.forEach(function (card, i) {
        var mid = (n - 1) / 2;
        var rest = (i - mid) * 96;                 /* fanned: each card exposes its label + value */
        var side = (i - mid) * 16;                  /* gentle horizontal fan */
        var tilt = (i - mid) * 1.6;                 /* small rotation, keeps text readable */
        gsap.set(card, { xPercent: -50, yPercent: -50, x: side * 3, y: rest + 320, rotate: tilt * 4, scale: 0.9, opacity: 0, zIndex: i });
        gsap.to(card, {
          x: side, y: rest, rotate: tilt, scale: 1, opacity: 1, ease: 'none',
          scrollTrigger: { trigger: '.stack-section', start: 'top 78%', end: 'center 50%', scrub: 1 }
        });
      });
    })();

    /* bento entrances + button feedback */
    gsap.utils.toArray('.reveal-card').forEach(function (card, i) {
      gsap.from(card, {
        y: 64, opacity: 0, scale: 0.97, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 90%' }, delay: (i % 4) * 0.07
      });
    });
    gsap.from('.stack__intro > *', {
      y: 40, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.stack-section', start: 'top 75%' }
    });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  /* ---------- 4. canvas particle network (the tech centrepiece) ---------- */
  (function () {
    var canvas = document.querySelector('.hero__canvas');
    if (!canvas || reduce) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var nodes = [], W = 0, H = 0, dpr = 1;
    var mouse = { x: -9999, y: -9999 };

    function resize() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.max(36, Math.min(88, Math.floor((W * H) / 19000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
          r: Math.random() * 1.4 + 0.5
        });
      }
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      var i, j, a, b, dx, dy, d2, max = 150;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        dx = a.x - mouse.x; dy = a.y - mouse.y;
        var md = Math.sqrt(dx * dx + dy * dy);
        if (md < 140 && md > 0) { a.x += (dx / md) * 1.2; a.y += (dy / md) * 1.2; }
      }
      for (i = 0; i < nodes.length; i++) {
        for (j = i + 1; j < nodes.length; j++) {
          a = nodes[i]; b = nodes[j];
          dx = a.x - b.x; dy = a.y - b.y; d2 = dx * dx + dy * dy;
          if (d2 < max * max) {
            var alpha = (1 - Math.sqrt(d2) / max) * 0.32;
            ctx.strokeStyle = 'rgba(150,235,205,' + alpha + ')';
            ctx.lineWidth = 0.7;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        ctx.fillStyle = 'rgba(201,255,74,.85)';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    }, { passive: true });
    resize(); frame();
  })();

  /* ---------- 5. custom cursor + magnetic controls ---------- */
  (function () {
    if (!fine || reduce) return;
    var cur = document.querySelector('.cursor');
    var dot = cur && cur.querySelector('.cursor__dot');
    var ring = cur && cur.querySelector('.cursor__ring');
    if (!cur || !dot || !ring) return;
    var mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;
    document.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY; cur.classList.add('is-on');
    }, { passive: true });
    document.addEventListener('pointerleave', function () { cur.classList.remove('is-on'); });
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      dot.style.transform = 'translate(' + (mx - 3) + 'px,' + (my - 3) + 'px)';
      ring.style.transform = 'translate(' + (rx - 19) + 'px,' + (ry - 19) + 'px)';
      requestAnimationFrame(loop);
    })();
    var hot = 'a, button, .magnetic, .card, .choice';
    document.addEventListener('pointerover', function (e) {
      if (e.target.closest(hot)) cur.classList.add('is-hot');
    });
    document.addEventListener('pointerout', function (e) {
      if (e.target.closest(hot)) cur.classList.remove('is-hot');
    });
    document.querySelectorAll('.magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22;
        var y = (e.clientY - r.top - r.height / 2) * 0.22;
        el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  })();
})();
