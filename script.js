// config
var CADANGAN = {
  name: 'Erlan Nauval Aqilah',
  age: 18,
  dateText: 'Senin, 21 Juni 2027',
  startIso: '2027-06-21T07:00:00+07:00',
  timeText: '07.00 - 11.55 WIB',
  venue: 'Rumah Erlan, Perumahan Griya Serpong, Kademangan, Setu',
  bank: 'BCA 1234567890 a.n. Erlan Nauval Aqilah',
  mapQuery: 'Gedung DPR Jakarta'
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
    putarMusik();

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
    drawer.classList.toggle('drawer-open', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.textContent = open ? 'Tutup' : 'Menu';
    document.body.classList.toggle('menu-open', open);
  }

  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', function () { showMenu(!drawer.classList.contains('drawer-open')); });
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

  var maxScroll = 0;
  var heroTinggi = 1;

  function ukurUlang() {
    maxScroll = document.documentElement.scrollHeight - innerHeight;
    heroTinggi = hero.offsetHeight || 1;
  }

  function updateOnScroll() {
    progressBar.style.width = (maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0) + '%';

    if (scrollY < heroTinggi) {
      heroInner.style.setProperty('--hero-shift', scrollY * 0.22 + 'px');
      heroInner.style.opacity = Math.max(0, 1 - scrollY / (heroTinggi * 0.9));
    }
  }

  addEventListener('scroll', function () { requestAnimationFrame(updateOnScroll); }, { passive: true });
  addEventListener('resize', ukurUlang);
  ukurUlang();
  updateOnScroll();

// rsvp
  var form = byId('rsvp-form');

  function renderList(entries) {
    var counts = { present: 0, absent: 0, maybe: 0, people: 0 };

    entries.forEach(function (item) {
      if (item.kehadiran === 'Hadir') {
        counts.present++;
        counts.people += parseInt(item.jumlah, 10) || 1;
      } else if (item.kehadiran === 'Tidak Hadir') {
        counts.absent++;
      } else {
        counts.maybe++;
      }
    });

    setText('stat-present', counts.present);
    setText('stat-absent', counts.absent);
    setText('stat-maybe', counts.maybe);
    setText('stat-people', counts.people);
    setText('confirm-count', '(' + entries.length + ' konfirmasi)');

    if (!entries.length) {
      byId('confirm-list').innerHTML = '<p class="note">Belum ada konfirmasi. Jadilah yang pertama.</p>';
      return;
    }

    byId('confirm-list').innerHTML = entries.map(function (item) {
      var badge = item.kehadiran === 'Hadir' ? 'badge-present'
                : (item.kehadiran === 'Tidak Hadir' ? 'badge-absent' : 'badge-maybe');
      var when = new Date(item.waktu || Date.now()).toLocaleString('id-ID', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      return '<div class="wish is-visible">' +
        '<div class="wish-top">' +
          '<span class="wish-name">' + escapeHtml(item.nama) + '</span>' +
          '<span class="badge ' + badge + '">' + escapeHtml(item.kehadiran) +
            (item.jumlah > 1 ? ' ' + escapeHtml(item.jumlah) + ' orang' : '') + '</span>' +
        '</div>' +
        (item.pesan ? '<p class="wish-text">' + escapeHtml(item.pesan) + '</p>' : '') +
        (item.asal ? '<p class="note">' + escapeHtml(item.asal) + '</p>' : '') +
        '<span class="wish-time">' + when + '</span>' +
      '</div>';
    }).join('');
  }

  function loadConfirmations() {
    if (!window.DB) {
      renderList([]);
      setText('status-line', 'Database belum disiapkan (berkas db.js tidak dimuat).');
      return Promise.resolve();
    }

    return DB.daftarKonfirmasi()
      .then(function (entries) {
        renderList(entries);
        setText('status-line', entries.length
          ? 'Terhubung ke database (' + entries.length + ' konfirmasi).'
          : 'Terhubung ke database - belum ada konfirmasi.');
      })
      .catch(function (err) {
        renderList([]);
        setText('status-line', 'Gagal memuat dari database: ' + err.message);
      });
  }

  if (form) {
    if (fullName) byId('field-name').value = fullName;
    if (guest.from) byId('field-from').value = guest.from;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var payload = {
        nama: byId('field-name').value.trim(),
        asal: byId('field-from').value.trim(),
        kategori: byId('field-group').value,
        kehadiran: byId('field-attend').value,
        jumlah: parseInt(byId('field-people').value, 10) || 1,
        pesan: byId('field-message').value.trim()
      };

      if (!payload.nama) {
        byId('field-name').focus();
        return;
      }

      setText('thanks-name', payload.nama);
      byId('thanks-box').classList.add('shown');

      if (window.DB) {
        DB.simpanKonfirmasi(payload)
          .then(function () { return loadConfirmations(); })
          .then(function () { setText('status-line', 'Tersimpan ke database.'); })
          .catch(function (err) { setText('status-line', 'Gagal menyimpan: ' + err.message); });
      } else {
        setText('status-line', 'Database belum disiapkan, konfirmasi belum tersimpan.');
      }

      form.reset();
    });

    loadConfirmations();
    setInterval(loadConfirmations, 15000);
  }

// bagikan
  if (byId('copy-bank')) {
    byId('copy-bank').addEventListener('click', function () {
      var button = this;
      navigator.clipboard.writeText(CONFIG.bank);
      button.textContent = 'Tersalin';
      setTimeout(function () { button.textContent = 'Salin'; }, 1400);
    });
  }

  if (byId('share-wa')) {
    byId('share-wa').addEventListener('click', function (e) {
      e.preventDefault();
      var message = 'Undangan ulang tahun ' + CONFIG.name + ' ke-' + CONFIG.age + '\n' +
        CONFIG.dateText + ', ' + CONFIG.timeText + '\n' +
        CONFIG.venue + '\n\n' + location.href;
      open('https://wa.me/?text=' + encodeURIComponent(message), '_blank');
    });
  }

// simpan ke kalender
  function stempelKalender(date) {
    var dua = function (n) { return String(n).padStart(2, '0'); };
    return date.getUTCFullYear() + dua(date.getUTCMonth() + 1) + dua(date.getUTCDate()) +
      'T' + dua(date.getUTCHours()) + dua(date.getUTCMinutes()) + '00Z';
  }

  var mulaiAcara = new Date(CONFIG.startIso);
  if (!isNaN(mulaiAcara.getTime())) {
    var selesaiAcara = new Date(mulaiAcara.getTime() + 3 * 3600000);
    var tautanKalender = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent('Ulang Tahun ' + CONFIG.name + ' ke-' + CONFIG.age) +
      '&dates=' + stempelKalender(mulaiAcara) + '/' + stempelKalender(selesaiAcara) +
      '&location=' + encodeURIComponent(CONFIG.venue) +
      '&details=' + encodeURIComponent(CONFIG.dateText + ', ' + CONFIG.timeText + ' - ' + CONFIG.venue);
    setAttr('add-calendar', 'href', tautanKalender);
  }

// lokasi & peta
  var queryPeta = CONFIG.mapQuery || CONFIG.venue;
  if (byId('map-frame')) {
    byId('map-frame').src = 'https://www.google.com/maps?q=' + encodeURIComponent(queryPeta) + '&output=embed';
    setAttr('map-link', 'href', 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(queryPeta));
    setText('venue-text-maps', queryPeta);
  }

// musik latar
  var musik = byId('bg-music');
  var musikBtn = byId('music-toggle');

  function setMusikAktif(aktif) {
    if (!musikBtn) return;
    musikBtn.classList.toggle('is-playing', !!aktif);
    musikBtn.setAttribute('aria-pressed', aktif ? 'true' : 'false');
    musikBtn.setAttribute('aria-label', aktif ? 'Jeda musik' : 'Putar musik');
  }

  function putarMusik() {
    if (!musik) return;
    var janji = musik.play();
    if (janji && janji.then) {
      janji.then(function () { setMusikAktif(true); })
           .catch(function () { setMusikAktif(false); });
    } else {
      setMusikAktif(true);
    }
  }

  function alihkanMusik() {
    if (!musik) return;
    if (musik.paused) putarMusik();
    else { musik.pause(); setMusikAktif(false); }
  }

  if (musikBtn) musikBtn.addEventListener('click', alihkanMusik);

// scroll halus (lerp) - untuk perangkat ber-mouse saja
  (function () {
    var kurangGerak = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hanyaSentuh = window.matchMedia && window.matchMedia('(hover: none)').matches;
    if (kurangGerak || hanyaSentuh) return;

    var posisi = window.scrollY;
    var tujuan = window.scrollY;
    var diatur = Math.round(window.scrollY);
    var daya = 0.16;
    var offsetNav = 76;

    function batas() { return document.documentElement.scrollHeight - window.innerHeight; }
    function kunci(v) { return Math.max(0, Math.min(batas(), v)); }
    function terkunci() {
      return document.body.classList.contains('scroll-lock') || document.body.classList.contains('menu-open');
    }

    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey || terkunci()) return;
      var el = e.target;
      while (el && el.nodeType === 1 && el !== document.documentElement) {
        var gaya = getComputedStyle(el);
        if ((gaya.overflowY === 'auto' || gaya.overflowY === 'scroll' || gaya.overflowY === 'overlay') &&
            el.scrollHeight > el.clientHeight + 1) return;
        el = el.parentElement;
      }
      e.preventDefault();
      tujuan = kunci(tujuan + e.deltaY);
    }, { passive: false });

    // klik link dalam halaman -> gulir mulus, bukan lompat
    document.addEventListener('click', function (e) {
      var tautan = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!tautan || terkunci()) return;
      var hash = tautan.getAttribute('href');
      if (!hash || hash.length < 2) return;
      var elemen = document.querySelector(hash);
      if (!elemen) return;
      e.preventDefault();
      tujuan = kunci(elemen.getBoundingClientRect().top + window.scrollY - offsetNav);
    });

    window.addEventListener('scroll', function () {
      if (diatur === null) return;
      if (Math.abs(window.scrollY - diatur) > 1) { posisi = tujuan = window.scrollY; }
    }, { passive: true });

    window.addEventListener('resize', function () { tujuan = kunci(tujuan); });

    (function langkah() {
      if (terkunci()) {
        posisi = tujuan = diatur = window.scrollY;
      } else {
        posisi += (tujuan - posisi) * daya;
        if (Math.abs(tujuan - posisi) < 0.4) posisi = tujuan;
        var y = Math.round(posisi);
        if (y !== diatur) { diatur = y; window.scrollTo(0, y); }
      }
      requestAnimationFrame(langkah);
    })();
  })();

});
