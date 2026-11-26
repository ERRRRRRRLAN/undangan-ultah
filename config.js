window.UNDANGAN = {

// data acara
  acara: {
    name: 'Erlan Nauval Aqilah',
    age: 18,
    dateText: 'Senin, 21 Juni 2027',
    startIso: '2027-06-21T07:00:00+07:00',
    timeText: '07.00 - 11.55 WIB',
    venue: 'Rumah Erlan, Perumahan Griya Serpong, Kademangan, Setu',
    bank: 'BCA 1234567890 a.n. Erlan Nauval Aqilah',
    mapQuery: 'Gedung DPR Jakarta'
  },

// database
  database: {
    mode: 'supabase',

    url: 'ISI_URL_PROYEK_SUPABASE',
    anonKey: 'ISI_ANON_KEY_DARI_SUPABASE',

    tabelTamu: 'guests',
    tabelRsvp: 'rsvp',

    kolomRsvp: {
      nama: 'nama',
      asal: 'asal',
      kategori: 'kategori',
      kehadiran: 'kehadiran',
      jumlah: 'jumlah',
      pesan: 'pesan',
      waktu: 'waktu'
    },
    kolomTamu: {
      nama: 'nama',
      gelar: 'gelar',
      asal: 'asal',
      kategori: 'kategori',
      whatsapp: 'whatsapp'
    },

    ntfyTopik: 'undangan-ultah-2026-konfirmasi-9b21c7'
  },

  // kunci halaman admin.html
  adminKunci: 'admin123'
};
