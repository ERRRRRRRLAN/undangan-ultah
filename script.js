// config
var CADANGAN = {
  name: 'Erlan Nauval Aqilah',
  age: 18,
  dateText: 'Senin, 21 Juni 2027',
  startIso: '2027-06-21T07:00:00+07:00',
  timeText: '07.00 - 11.55 WIB',
  venue: 'Gedung DPR Jakarta',
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

  // kunci gulir halaman selama sampul masih tampil
  function kunciGulir(kunci) {
    document.documentElement.classList.toggle('scroll-lock', kunci);
    document.body.classList.toggle('scroll-lock', kunci);
    if (kunci) window.scrollTo(0, 0);
  }

  function cegahGulir(e) {
    if (!document.body.classList.contains('scroll-lock')) return;
    if (e.type === 'keydown') {
      if (/^(BUTTON|INPUT|SELECT|TEXTAREA|A)$/.test(e.target.tagName)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].indexOf(e.key) < 0) return;
    }
    e.preventDefault();
  }

  addEventListener('wheel', cegahGulir, { passive: false });
  addEventListener('touchmove', cegahGulir, { passive: false });
  addEventListener('keydown', cegahGulir);

  function openCover(instant) {
    if (!cover || opened) return;
    opened = true;
    kunciGulir(false);
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
    kunciGulir(true);
    openBtn.addEventListener('click', function () { openCover(false); });
    if (params.get('buka') === '1') openCover(true);
  }

// galeri foto: klik untuk zoom, geser kanan-kiri untuk pindah foto
  (function () {
    var lightbox = byId('lightbox');
    var stage = byId('lb-stage');
    var lbImg = byId('lb-img');
    var lbCaption = byId('lb-caption');
    var lbCount = byId('lb-count');
    var dotWrap = byId('lb-dots');
    var btnClose = byId('lb-close');
    if (!lightbox || !stage || !lbImg || !dotWrap) return;

    var thumbs = [].slice.call(document.querySelectorAll('#gallery .shot'));
    if (!thumbs.length) return;

    var daftar = thumbs.map(function (fig) {
      var g = fig.querySelector('img');
      var c = fig.querySelector('.caption');
      return {
        src: g ? g.getAttribute('src') : '',
        alt: g ? (g.getAttribute('alt') || '') : '',
        caption: c ? c.textContent.replace(/\s+/g, ' ').trim() : ''
      };
    });

    var ZOOM_MAKS = 4;
    var idx = 0;
    var zoom = 1;
    var panX = 0;
    var panY = 0;
    var seret = null;
    var habisSeret = false;
    var fokusAsal = null;
    var putaran = 0;

    var dotEls = daftar.map(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'lb-dot';
      b.setAttribute('aria-label', 'Foto ' + (i + 1));
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        pilih(i, i > idx ? 'kanan' : 'kiri');
      });
      dotWrap.appendChild(b);
      return b;
    });

    function batas(nilai, maks) {
      maks = Math.max(0, maks - 10);
      return nilai > maks ? maks : (nilai < -maks ? -maks : nilai);
    }

    function gambar() {
      lbImg.style.transform = 'translate3d(' + panX + 'px,' + panY + 'px,0) scale(' + zoom + ')';
    }

    function panggung(geser) {
      stage.style.transform = geser ? 'translate3d(' + geser + 'px,0,0)' : '';
    }

    function tanpaTransisi(nyala) {
      stage.classList.toggle('lb-tanpa-transisi', nyala);
      lbImg.classList.toggle('lb-tanpa-transisi', nyala);
    }

    function resetZoom() {
      zoom = 1;
      panX = 0;
      panY = 0;
      lightbox.classList.remove('is-zoom');
      gambar();
    }

    function zoomKe(nilai) {
      zoom = Math.max(1, Math.min(ZOOM_MAKS, nilai));
      if (zoom <= 1.01) {
        zoom = 1;
        panX = 0;
        panY = 0;
      }
      lightbox.classList.toggle('is-zoom', zoom > 1.01);
      gambar();
    }

    function pilih(i, arah) {
      idx = (i % daftar.length + daftar.length) % daftar.length;
      lbImg.setAttribute('src', daftar[idx].src);
      lbImg.setAttribute('alt', daftar[idx].alt);
      lbCaption.textContent = daftar[idx].caption;
      lbCount.textContent = (idx + 1) + ' / ' + daftar.length;
      dotEls.forEach(function (b, n) { b.classList.toggle('is-active', n === idx); });
      resetZoom();

      if (arah) {
        tanpaTransisi(true);
        panggung(arah === 'kanan' ? 42 : -42);
        requestAnimationFrame(function () {
          tanpaTransisi(false);
          panggung(0);
        });
      } else {
        panggung(0);
      }

      var depan = daftar[(idx + 1) % daftar.length].src;
      var belakang = daftar[(idx - 1 + daftar.length) % daftar.length].src;
      if (depan) { var a = new Image(); a.src = depan; }
      if (belakang) { var b = new Image(); b.src = belakang; }
    }

    function buka(i, asal) {
      fokusAsal = asal || null;
      resetZoom();
      panggung(0);
      pilih(i);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('lightbox-open');
      document.body.classList.add('lightbox-open');
    }

    function tutup() {
      if (!lightbox.classList.contains('is-open')) return;
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('lightbox-open');
      document.body.classList.remove('lightbox-open');
      habisSeret = false;
      resetZoom();
      panggung(0);
      if (fokusAsal && fokusAsal.focus) fokusAsal.focus();
    }

    /* --- pembuka: klik / Enter di tiap foto galeri --- */
    thumbs.forEach(function (fig, i) {
      fig.setAttribute('tabindex', '0');
      fig.setAttribute('role', 'button');
      fig.setAttribute('aria-label', 'Perbesar foto: ' + (daftar[i].caption || daftar[i].alt));
      fig.addEventListener('click', function () { buka(i, fig); });
      fig.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        buka(i, fig);
      });
    });

    if (btnClose) btnClose.addEventListener('click', function (e) { e.stopPropagation(); tutup(); });
    byId('lb-prev').addEventListener('click', function (e) { e.stopPropagation(); pilih(idx - 1, 'kiri'); });
    byId('lb-next').addEventListener('click', function (e) { e.stopPropagation(); pilih(idx + 1, 'kanan'); });

    /* --- seret / geser (mouse dan sentuh) --- */
    function mulai(e) {
      if (e.button && e.button !== 0) return;
      if (e.target.closest && e.target.closest('.lb-btn, .lb-dot')) return;
      seret = {
        id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, dy: 0,
        t: Date.now(), poros: '', zoom: zoom, x0: panX, y0: panY
      };
      habisSeret = false;
      addEventListener('pointermove', jalan);
      addEventListener('pointerup', lepas);
      addEventListener('pointercancel', lepas);
    }

    function jalan(e) {
      if (!seret || e.pointerId !== seret.id) return;
      seret.dx = e.clientX - seret.x;
      seret.dy = e.clientY - seret.y;
      if (!seret.poros) {
        if (Math.abs(seret.dx) < 8 && Math.abs(seret.dy) < 8) return;
        seret.poros = Math.abs(seret.dx) >= Math.abs(seret.dy) ? 'x' : 'y';
        habisSeret = true;
        tanpaTransisi(true);
        lightbox.classList.add('is-drag');
      }
      if (seret.zoom > 1.01) {
        panX = batas(seret.x0 + seret.dx, lbImg.offsetWidth * (seret.zoom - 1) / 2);
        panY = batas(seret.y0 + seret.dy, lbImg.offsetHeight * (seret.zoom - 1) / 2);
        gambar();
      } else if (seret.poros === 'x') {
        panggung(seret.dx);
      }
    }

    function lepas(e) {
      if (!seret || e.pointerId !== seret.id) return;
      var g = seret;
      seret = null;
      removeEventListener('pointermove', jalan);
      removeEventListener('pointerup', lepas);
      removeEventListener('pointercancel', lepas);
      lightbox.classList.remove('is-drag');
      tanpaTransisi(false);

      if (g.zoom > 1.01) { gambar(); return; }

      var cepat = (Date.now() - g.t) < 350 && Math.abs(g.dx) > 24;
      if (g.poros === 'x' && (Math.abs(g.dx) > 64 || cepat)) {
        pilih(idx + (g.dx < 0 ? 1 : -1), g.dx < 0 ? 'kanan' : 'kiri');
        return;
      }
      panggung(0);
    }

    lightbox.addEventListener('pointerdown', mulai);

    /* --- klik gambar: zoom masuk / keluar --- */
    lbImg.addEventListener('click', function () {
      if (habisSeret) { habisSeret = false; return; }
      if (zoom > 1.01) resetZoom();
      else zoomKe(2.6);
    });

    /* --- klik area gelap: tutup --- */
    lightbox.addEventListener('click', function (e) {
      if (e.target !== lightbox) return;
      if (habisSeret) { habisSeret = false; return; }
      tutup();
    });

    /* --- roda mouse: geser foto, atau zoom kalau sedang diperbesar --- */
    lightbox.addEventListener('wheel', function (e) {
      e.preventDefault();
      if (zoom > 1.01) {
        zoomKe(zoom - e.deltaY * 0.0022);
        return;
      }
      putaran += e.deltaY;
      if (Math.abs(putaran) < 42) return;
      var arah = putaran > 0 ? 1 : -1;
      putaran = 0;
      pilih(idx + arah, arah > 0 ? 'kanan' : 'kiri');
    }, { passive: false });

    /* --- papan tombol --- */
    addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') { tutup(); return; }
      if (e.key === 'ArrowRight') { pilih(idx + 1, 'kanan'); return; }
      if (e.key === 'ArrowLeft') { pilih(idx - 1, 'kiri'); return; }
      if (e.key === '+' || e.key === '=') { zoomKe(zoom + 0.5); return; }
      if (e.key === '-') { zoomKe(zoom - 0.5); return; }
      if (e.key === '0') { resetZoom(); }
    });
  })();
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
    if (el.closest('.hero, .cover')) return;
    var index = el.parentElement ? [].indexOf.call(el.parentElement.children, el) : 0;
    el.style.setProperty('--delay', Math.min(600, index * 85) + 'ms');
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
    if (progressBar) progressBar.style.width = (maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0) + '%';

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

// animasi gulir: elemen "berubah" mengikuti posisi scroll (set var --p)
  (function () {
    var kurangGerak = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (kurangGerak) return;

    var elems = [].slice.call(document.querySelectorAll('.reveal'));
    if (!elems.length) return;

    document.documentElement.classList.add('scroll-anim');

    var data = [];
    var vh = window.innerHeight;

    function posAtas(el) {
      var y = 0;
      while (el) { y += el.offsetTop || 0; el = el.offsetParent; }
      return y;
    }

    function ukur() {
      vh = window.innerHeight;
      data = elems.map(function (el) {
        return {
          el: el,
          top: posAtas(el),
          n: el.parentElement ? [].indexOf.call(el.parentElement.children, el) : 0,
          p: -1
        };
      });
    }

    function jalan() {
      var sc = window.scrollY;
      var maxSc = Math.max(0, document.documentElement.scrollHeight - vh);
      for (var i = 0; i < data.length; i++) {
        var d = data[i];
        var geser = Math.min(d.n, 6) * (vh * 0.015);
        var awal = d.top - vh * 1.12 + geser;
        /* 'akhir' dibatasi maxSc supaya elemen paling bawah (footer)
           tetap bisa mencapai p = 1 walau halaman tak bisa scroll lagi.
           selesai di 0.72 layar (bawah), jadi sudah kebaca sebelum tengah */
        var akhir = Math.min(d.top - vh * 0.72 + geser, maxSc);
        var p = akhir > awal ? (sc - awal) / (akhir - awal) : (sc >= akhir ? 1 : 0);
        if (p < 0) p = 0; else if (p > 1) p = 1;
        if (d.p !== p) { d.p = p; d.el.style.setProperty('--p', p.toFixed(3)); }
      }
    }

    var tunggu = false;
    function minta() {
      if (tunggu) return;
      tunggu = true;
      requestAnimationFrame(function () { tunggu = false; jalan(); });
    }

    window.addEventListener('scroll', minta, { passive: true });
    window.addEventListener('resize', function () { ukur(); minta(); });
    window.addEventListener('load', function () { ukur(); minta(); });
    ukur();
    jalan();
  })();

});
