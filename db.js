// db.js - semua urusan database ada di berkas ini
(function (window) {
  'use strict';

  var PENGATURAN = (window.UNDANGAN && window.UNDANGAN.database) || {};
  var MODE = PENGATURAN.mode || 'ntfy';

  function keKonfirmasi(baris, kolom) {
    return {
      nama: baris[kolom.nama],
      asal: baris[kolom.asal] || '',
      kategori: baris[kolom.kategori] || '',
      kehadiran: baris[kolom.kehadiran] || 'Ragu',
      jumlah: parseInt(baris[kolom.jumlah], 10) || 1,
      pesan: baris[kolom.pesan] || '',
      waktu: baris[kolom.waktu] || new Date().toISOString()
    };
  }

  function keBaris(data, kolom) {
    var baris = {};
    baris[kolom.nama] = data.nama;
    baris[kolom.asal] = data.asal || '';
    baris[kolom.kategori] = data.kategori || '';
    baris[kolom.kehadiran] = data.kehadiran || 'Hadir';
    baris[kolom.jumlah] = parseInt(data.jumlah, 10) || 1;
    baris[kolom.pesan] = data.pesan || '';
    return baris;
  }

  function keBarisTamu(data, kolom) {
    var baris = {};
    baris[kolom.nama] = data.nama;
    baris[kolom.gelar] = data.gelar || '';
    baris[kolom.asal] = data.asal || '';
    baris[kolom.kategori] = data.kategori || '';
    baris[kolom.whatsapp] = data.whatsapp || '';
    return baris;
  }

  // penyedia supabase
  var supabase = {
    alamat: function (tabel, query) {
      return PENGATURAN.url.replace(/\/$/, '') + '/rest/v1/' + tabel + (query || '');
    },
    kepala: function (tambahan) {
      var kepala = {
        apikey: PENGATURAN.anonKey,
        Authorization: 'Bearer ' + PENGATURAN.anonKey
      };
      if (tambahan) {
        Object.keys(tambahan).forEach(function (k) { kepala[k] = tambahan[k]; });
      }
      return kepala;
    },

    daftarKonfirmasi: function () {
      var kolom = PENGATURAN.kolomRsvp;
      var pilih = Object.keys(kolom).map(function (k) { return kolom[k]; }).join(',');
      return fetch(this.alamat(PENGATURAN.tabelRsvp, '?select=' + pilih + '&order=' + kolom.waktu + '.desc'), {
        headers: this.kepala()
      }).then(function (r) {
        if (!r.ok) throw new Error('Database menolak permintaan (' + r.status + ')');
        return r.json();
      }).then(function (baris) {
        return baris.map(function (b) { return keKonfirmasi(b, kolom); });
      });
    },

    simpanKonfirmasi: function (data) {
      var kolom = PENGATURAN.kolomRsvp;
      return fetch(this.alamat(PENGATURAN.tabelRsvp), {
        method: 'POST',
        headers: this.kepala({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
        body: JSON.stringify(keBaris(data, kolom))
      }).then(function (r) {
        if (!r.ok) throw new Error('Gagal menyimpan (' + r.status + ')');
        return true;
      });
    },

    daftarTamu: function () {
      var kolom = PENGATURAN.kolomTamu;
      var pilih = 'id,' + Object.keys(kolom).map(function (k) { return kolom[k]; }).join(',');
      return fetch(this.alamat(PENGATURAN.tabelTamu, '?select=' + pilih + '&order=' + kolom.nama + '.asc'), {
        headers: this.kepala()
      }).then(function (r) {
        if (!r.ok) throw new Error('Database menolak permintaan (' + r.status + ')');
        return r.json();
      }).then(function (baris) {
        return baris.map(function (b) {
          return {
            id: b.id,
            nama: b[kolom.nama] || '',
            gelar: b[kolom.gelar] || '',
            asal: b[kolom.asal] || '',
            kategori: b[kolom.kategori] || '',
            whatsapp: b[kolom.whatsapp] || ''
          };
        });
      });
    },

    tambahTamu: function (data) {
      var kolom = PENGATURAN.kolomTamu;
      return fetch(this.alamat(PENGATURAN.tabelTamu), {
        method: 'POST',
        headers: this.kepala({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
        body: JSON.stringify(keBarisTamu(data, kolom))
      }).then(function (r) {
        if (!r.ok) throw new Error('Gagal menambah tamu (' + r.status + ')');
        return true;
      });
    },

    ubahTamu: function (id, data) {
      var kolom = PENGATURAN.kolomTamu;
      return fetch(this.alamat(PENGATURAN.tabelTamu, '?id=eq.' + id), {
        method: 'PATCH',
        headers: this.kepala({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
        body: JSON.stringify(keBarisTamu(data, kolom))
      }).then(function (r) {
        if (!r.ok) throw new Error('Gagal mengubah tamu (' + r.status + ')');
        return true;
      });
    },

    hapusTamu: function (id) {
      return fetch(this.alamat(PENGATURAN.tabelTamu, '?id=eq.' + id), {
        method: 'DELETE',
        headers: this.kepala({ Prefer: 'return=minimal' })
      }).then(function (r) {
        if (!r.ok) throw new Error('Gagal menghapus tamu (' + r.status + ')');
        return true;
      });
    }
  };

  // penyedia ntfy (tanpa database)
  function belumDidukung() {
    return Promise.reject(new Error('Mode ntfy tidak menyimpan daftar tamu. Pakai mode supabase.'));
  }

  var ntfy = {
    alamat: function (ekstra) {
      return 'https://ntfy.sh/' + PENGATURAN.ntfyTopik + (ekstra || '');
    },

    daftarKonfirmasi: function () {
      return fetch(this.alamat('/json?poll=1&since=all'), { cache: 'no-store' })
        .then(function (r) { return r.text(); })
        .then(function (isi) {
          return isi.split(String.fromCharCode(10)).filter(Boolean).map(function (baris) {
            try {
              var sampul = JSON.parse(baris);
              var isi2 = JSON.parse(sampul.message);
              return {
                nama: isi2.nama || '',
                asal: isi2.asal || '',
                kategori: isi2.kategori || '',
                kehadiran: isi2.kehadiran || 'Ragu',
                jumlah: parseInt(isi2.jumlah, 10) || 1,
                pesan: isi2.pesan || '',
                waktu: new Date((sampul.time || 0) * 1000).toISOString()
              };
            } catch (e) { return null; }
          }).filter(function (b) { return b && b.nama; })
            .sort(function (a, b) { return String(b.waktu).localeCompare(String(a.waktu)); });
        });
    },

    simpanKonfirmasi: function (data) {
      return fetch(this.alamat(), { method: 'POST', body: JSON.stringify(data) })
        .then(function (r) {
          if (!r.ok) throw new Error('Gagal menyimpan (' + r.status + ')');
          return true;
        });
    },

    daftarTamu: function () { return Promise.resolve([]); },
    tambahTamu: belumDidukung,
    ubahTamu: belumDidukung,
    hapusTamu: belumDidukung
  };

  var penyedia = MODE === 'supabase' ? supabase : ntfy;

  // yang dipakai halaman
  window.DB = {
    mode: MODE,
    daftarKonfirmasi: function () { return penyedia.daftarKonfirmasi(); },
    simpanKonfirmasi: function (data) { return penyedia.simpanKonfirmasi(data); },
    daftarTamu: function () { return penyedia.daftarTamu(); },
    tambahTamu: function (data) { return penyedia.tambahTamu(data); },
    ubahTamu: function (id, data) { return penyedia.ubahTamu(id, data); },
    hapusTamu: function (id) { return penyedia.hapusTamu(id); }
  };

})(window);
