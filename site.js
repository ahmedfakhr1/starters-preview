(function () {
  'use strict';
  var d = document, de = d.documentElement, $ = function (s, r) { return (r || d).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  de.classList.add('js');
  var WA = 'https://wa.me/201006077770';
  var reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* drawer */
  var mb = $('.menu-btn'), dr = $('#drawer');
  function drawer(open) {
    if (!mb || !dr) return;
    dr.classList.toggle('open', open);
    de.classList.toggle('drawer-open', open);
    mb.setAttribute('aria-expanded', open ? 'true' : 'false');
    mb.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mb.querySelector('.i-open').style.display = open ? 'none' : 'block';
    mb.querySelector('.i-close').style.display = open ? 'block' : 'none';
    if (open) dr.removeAttribute('inert'); else dr.setAttribute('inert', '');
  }
  if (mb && dr) {
    dr.setAttribute('inert', '');
    mb.addEventListener('click', function () { drawer(!dr.classList.contains('open')); });
    $$('a', dr).forEach(function (a) { a.addEventListener('click', function () { drawer(false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && dr.classList.contains('open')) { drawer(false); mb.focus(); } });
    matchMedia('(min-width: 900px)').addEventListener('change', function (m) { if (m.matches) drawer(false); });
  }

  /* Arabic pop-up */
  var dlg = $('#ar-dialog');
  $$('.ar-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      drawer(false);
      if (dlg.showModal) { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
    });
  });
  if (dlg) {
    $$('[data-close]', dlg).forEach(function (b) { b.addEventListener('click', function () { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); }); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg && dlg.close) dlg.close(); });
  }

  /* phone bottom bar: hides on scroll down, over the builder and over the footer */
  var bar = $('.bar');
  if (bar) {
    var foot = $('.foot'), build = $('#build'), hero = $('.hero');
    var lastY = window.scrollY, over = { foot: false, build: false }, shown = false, down = false;
    var setBar = function () {
      var minY = hero ? hero.offsetHeight * 0.55 : 0;
      var want = window.scrollY > minY && !over.foot && !over.build && !down;
      if (want !== shown) { shown = want; bar.classList.toggle('show', want); bar.setAttribute('aria-hidden', want ? 'false' : 'true'); }
    };
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (Math.abs(y - lastY) > 6) { down = y > lastY && y > 40; lastY = y; setBar(); }
    }, { passive: true });
    if ('IntersectionObserver' in window) {
      var bio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { over[e.target === foot ? 'foot' : 'build'] = e.isIntersecting; });
        setBar();
      }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
      if (foot) bio.observe(foot);
      if (build) bio.observe(build);
    }
    bar.setAttribute('aria-hidden', 'true');
    setBar();
  }

  /* one gentle fade per section */
  if ('IntersectionObserver' in window && !reduce) {
    var fio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); fio.unobserve(e.target); } });
    }, { threshold: 0, rootMargin: '0px 0px 8% 0px' });
    $$('.fade').forEach(function (s) { fio.observe(s); });
  } else $$('.fade').forEach(function (s) { s.classList.add('in'); });

  /* menu chips: active section */
  var chips = $$('.chipbar a.chip');
  if (chips.length) {
    var secs = chips.map(function (c) { return d.getElementById(c.getAttribute('href').slice(1)); });
    var pickSec = function () {
      var y = window.innerHeight * 0.32, cur = 0;
      secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= y + 90) cur = i; });
      chips.forEach(function (c, i) {
        c.classList.toggle('active', i === cur);
        if (i === cur) c.setAttribute('aria-current', 'true'); else c.removeAttribute('aria-current');
      });
      var a = chips[cur], row = a.parentElement;
      if (row.scrollWidth > row.clientWidth) {
        var target = a.offsetLeft - (row.clientWidth - a.offsetWidth) / 2;
        if (Math.abs(row.scrollLeft - target) > 24) row.scrollTo({ left: target, behavior: reduce ? 'auto' : 'smooth' });
      }
    };
    var tick = false;
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; pickSec(); }); } }, { passive: true });
    pickSec();
  }

  /* build your bowl */
  var bb = $('#build');
  if (bb) {
    var st = { base: '', dip: '', top: '', side: '', mode: 'Pickup', name: '', time: '', note: '' };
    var LBL = { base: 'Base', dip: 'Hummus or dip', top: 'Topping', side: 'Side' };
    var svgT = { base: $('#t-base'), dip: $('#t-dip'), top: $('#t-top') };
    var POS = { base: [109, 147], dip: [200, 305], top: [291, 147] };
    var HINT = { base: 'Base', dip: 'Dip', top: 'Topping' };
    var NS = 'http://www.w3.org/2000/svg';
    var lines = function (name) {
      if (name.length <= 9 || name.indexOf(' ') < 0) return [name];
      var w = name.split(' '), best = 1, diff = 99;
      for (var i = 1; i < w.length; i++) {
        var a = w.slice(0, i).join(' ').length, b = w.slice(i).join(' ').length;
        if (Math.abs(a - b) < diff) { diff = Math.abs(a - b); best = i; }
      }
      return [w.slice(0, best).join(' '), w.slice(best).join(' ')];
    };
    var paint = function (key) {
      var t = svgT[key]; if (!t) return;
      t.textContent = '';
      var val = st[key], ls = val ? lines(val) : [HINT[key]];
      t.setAttribute('class', val ? '' : 'hint');
      var lh = val ? 30 : 0, y0 = POS[key][1] - (ls.length - 1) * lh / 2 + (val ? 10 : 7);
      ls.forEach(function (l, i) {
        var s = d.createElementNS(NS, 'tspan');
        s.setAttribute('x', POS[key][0]); s.setAttribute('y', y0 + i * lh); s.textContent = l;
        t.appendChild(s);
      });
    };
    var t12 = function (v) {
      if (!v) return '';
      var p = v.split(':'), h = parseInt(p[0], 10), m = p[1] || '00', ap = h >= 12 ? 'PM' : 'AM';
      h = h % 12; if (h === 0) h = 12;
      return h + ':' + m + ' ' + ap;
    };
    var when = function () {
      var t = t12(st.time);
      return st.mode === 'Pickup' ? ('Pickup' + (t ? ' at ' + t : '')) : ('Delivery' + (t ? ' around ' + t : ''));
    };
    var tail = function () {
      var o = [when()];
      if (st.name) o.push('Name: ' + st.name);
      if (st.note) o.push('Note: ' + st.note);
      return o;
    };
    var msg = function () {
      var o = ["Hi Starters, I'd like to make my own bowl:"];
      ['base', 'dip', 'top', 'side'].forEach(function (k) { if (st[k]) o.push(LBL[k] + ': ' + st[k]); });
      return o.concat(tail(), ['Could you confirm the price?']).join('\n');
    };
    var sigMsg = function (n) { return ["Hi Starters, I'd like the " + n + '.'].concat(tail(), ['Thank you!']).join('\n'); };
    var link = function (m) { return WA + '?text=' + encodeURIComponent(m); };
    var sync = function () {
      ['base', 'dip', 'top'].forEach(paint);
      var sv = $('#side-val'); if (sv) sv.textContent = st.side || 'Pick a side';
      var sum = $('#bowl-sum');
      if (sum) {
        var parts = ['base', 'dip', 'top', 'side'].filter(function (k) { return st[k]; }).map(function (k) { return LBL[k] + ' ' + st[k]; });
        sum.textContent = parts.length ? 'Your bowl: ' + parts.join(', ') : 'Your bowl is empty.';
      }
      var send = $('#send'); if (send) send.href = link(msg());
      $$('[data-sig]').forEach(function (a) { a.href = link(sigMsg(a.getAttribute('data-sig'))); });
    };
    $$('.chip[data-k]', bb).forEach(function (c) {
      c.addEventListener('click', function () {
        var k = c.getAttribute('data-k'), v = c.getAttribute('data-v');
        st[k] = (k !== 'mode' && st[k] === v) ? '' : v;
        $$('.chip[data-k="' + k + '"]', bb).forEach(function (o) { o.setAttribute('aria-pressed', o.getAttribute('data-v') === st[k] ? 'true' : 'false'); });
        sync();
      });
    });
    [['#f-name', 'name'], ['#f-time', 'time'], ['#f-note', 'note']].forEach(function (p) {
      var el = $(p[0]); if (!el) return;
      el.addEventListener('input', function () { st[p[1]] = el.value.trim(); sync(); });
    });
    var rs = $('#reset');
    if (rs) rs.addEventListener('click', function () {
      st.base = st.dip = st.top = st.side = '';
      $$('.chip[data-k]', bb).forEach(function (o) { if (o.getAttribute('data-k') !== 'mode') o.setAttribute('aria-pressed', 'false'); });
      sync();
    });
    sync();
  }

  /* signature: write on hover, or once when it scrolls into view on touch */
  (function () { var a = document.querySelector('a.sig'); if (!a) return; function play() { a.classList.remove('on'); void a.getBoundingClientRect(); a.classList.add('on') } a.addEventListener('mouseenter', function () { if (!a.classList.contains('on')) play() }); if (!matchMedia('(hover: none)').matches || !('IntersectionObserver' in window)) return; var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); setTimeout(play, 400) } }, { threshold: .9 }); io.observe(a) })();
})();
