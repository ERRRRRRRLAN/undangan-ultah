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

});
