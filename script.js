// config
var CADANGAN = {
  name: 'Erlan Nauval Aqilah',
  age: 18,
  dateText: 'Senin, 21 Juni 2027',
  startIso: '2027-06-21T07:00:00+07:00',
  timeText: '07.00 - 11.55 WIB',
  venue: 'Rumah Erlan, Perumahan Griya Serpong, Kademangan, Setu',
  bank: 'BCA 1234567890 a.n. Erlan Nauval Aqilah',
  mapQuery: 'Perumahan Griya Serpong, Kademangan, Setu'
};

var CONFIG = (window.UNDANGAN && window.UNDANGAN.acara)
  ? window.UNDANGAN.acara
  : CADANGAN;

document.addEventListener('DOMContentLoaded', function () {

  var byId = function (id) { return document.getElementById(id); };
  var setText = function (id, value) { var el = byId(id); if (el && value != null) el.textContent = value; };
  var setAttr = function (id, name, value) { var el = byId(id); if (el && value != null) el.setAttribute(name, value); };
  var escapeHtml = function (value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };
  var params = new URLSearchParams(location.search);

// personalisasi
  var guest = { name: '', degree: '', from: '', group: '' };
  var guestParam = params.get('name') || params.get('nama') || '';

  if (guestParam) {
    var parts = decodeURIComponent(guestParam).split(',');
    guest.name = (parts[0] || '').trim();
    if (parts.length >= 4) {
      guest.group = (parts[parts.length - 1] || '').trim();
      guest.from = (parts[parts.length - 2] || '').trim();
      guest.degree = parts.slice(1, parts.length - 2).join(',').trim();
    } else if (parts.length === 3) {
      guest.degree = parts[1].trim();
      guest.from = parts[2].trim();
    } else if (parts.length === 2) {
      guest.degree = parts[1].trim();
    }
  }

  var fullName = guest.degree ? guest.name + ', ' + guest.degree : guest.name;
  var groupBadge = {
    'keluarga': 'badge-family',
    'sahabat': 'badge-friend',
    'teman sekolah': 'badge-school',
    'tetangga': 'badge-neighbor',
    'guru': 'badge-teacher'
  };

  setText('party-name', CONFIG.name);
  setText('party-name-cover', CONFIG.name);
  setText('age-cover', CONFIG.age);
  setText('age-badge', CONFIG.age);
  setText('age-nav', CONFIG.age);
  setText('age-footer', CONFIG.age);
  setText('date-text', CONFIG.dateText);
  setText('time-text', CONFIG.timeText);
  setText('venue-text', CONFIG.venue);
  setText('bank-text', CONFIG.bank);
  setText('year', new Date().getFullYear());

  setText('guest-name', fullName || 'Tamu Undangan');
  setText('guest-from', guest.from || 'Keluarga / Sahabat');
  if (guest.group) {
    setText('guest-group', guest.group);
    byId('guest-group').className = 'badge ' + (groupBadge[guest.group.toLowerCase()] || 'badge-plain');
  }

  document.title = fullName
    ? 'Undangan untuk ' + fullName + ' - Ulang Tahun ke-' + CONFIG.age
    : 'Undangan Ulang Tahun ' + CONFIG.name + ' ke-' + CONFIG.age;

// sampul
  var cover = byId('cover');
  var openBtn = byId('open-cover');
  var opened = false;

  function openCover(instant) {
    if (!cover || opened) return;
    opened = true;
    document.body.classList.remove('scroll-lock');
    document.body.classList.add('cover-opened');

    if (instant) {
      cover.style.display = 'none';
      return;
    }
    cover.classList.add('cover-closing');
    setTimeout(function () { cover.style.display = 'none'; }, 1200);
  }

  if (cover && openBtn) {
    document.body.classList.add('scroll-lock');
    openBtn.addEventListener('click', function () { openCover(false); });
    if (params.get('buka') === '1') openCover(true);
  }

// menu hp
  var menuBtn = byId('menu-btn');
  var drawer = byId('drawer');

  function showMenu(open) {
    drawer.hidden = !open;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.textContent = open ? 'Tutup' : 'Menu';
    document.body.classList.toggle('menu-open', open);
  }

  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', function () { showMenu(drawer.hidden); });
    byId('close-menu').addEventListener('click', function () { showMenu(false); });
    drawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { showMenu(false); });
    });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') showMenu(false); });
    addEventListener('resize', function () { if (innerWidth > 780) showMenu(false); });
  }

// hitung mundur
  var numberEls = document.querySelectorAll('#countdown .num');
  var targetTime = new Date(CONFIG.startIso).getTime();
  var timer;

  function tickCountdown() {
    var left = targetTime - Date.now();

    if (left <= 0) {
      byId('countdown').innerHTML = '<div class="box" style="grid-column:1/-1">' +
        '<span class="num">Acara</span><span class="unit">sudah berlangsung</span></div>';
      clearInterval(timer);
      return;
    }

    var step = [86400000, 3600000, 60000, 1000];
    var limit = [1000, 24, 60, 60];
    numberEls.forEach(function (el, i) {
      el.textContent = String(Math.floor(left / step[i]) % limit[i]).padStart(2, '0');
    });
  }

  timer = setInterval(tickCountdown, 1000);
  tickCountdown();

// bar atas
  var topbar = byId('topbar');
  var navLinks = document.querySelectorAll('.nav-links a');

  addEventListener('scroll', function () {
    topbar.classList.toggle('topbar-solid', scrollY > 28);
  }, { passive: true });

  var menuWatcher = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      navLinks.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  ['event', 'lokasi', 'agenda', 'gallery', 'dress-code', 'gift', 'rsvp'].forEach(function (id) {
    var section = byId(id);
    if (section) menuWatcher.observe(section);
  });

// animasi gulir
  var revealEls = document.querySelectorAll('.section-head, .row > *, .checklist li, .timeline li, ' +
    '.shot, .swatches li, .stats > div, #rsvp-form .mb-3, .submit, .map-wrap, .site-footer .container > *');

  revealEls.forEach(function (el) {
    var index = el.parentElement ? [].indexOf.call(el.parentElement.children, el) : 0;
    el.style.setProperty('--delay', Math.min(480, index * 70) + 'ms');
    el.classList.add('reveal');
    if (el.matches('.col-lg-7, .col-lg-5')) el.classList.add(index === 0 ? 'from-left' : 'from-right');
  });

  var revealWatcher = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealWatcher.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  revealEls.forEach(function (el) { revealWatcher.observe(el); });

// garis kemajuan
  var progressBar = byId('progress-bar');
  var heroInner = byId('hero-inner');
  var hero = document.querySelector('.hero');

  function updateOnScroll() {
    var maxScroll = document.documentElement.scrollHeight - innerHeight;
    progressBar.style.width = (maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0) + '%';

    if (scrollY < hero.offsetHeight) {
      heroInner.style.setProperty('--hero-shift', scrollY * 0.22 + 'px');
      heroInner.style.opacity = Math.max(0, 1 - scrollY / (hero.offsetHeight * 0.9));
    }
  }

  addEventListener('scroll', function () { requestAnimationFrame(updateOnScroll); }, { passive: true });
  updateOnScroll();

});
