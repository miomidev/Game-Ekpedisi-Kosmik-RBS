// ============================================================
// gameData.js — Ekspedisi Kosmik: Misi Penjelajah Tata Surya
// Data planet, kuis, narasi, dan konfigurasi game
// ============================================================

const GAME_DATA = {

  // ── Narasi Kokpit ──────────────────────────────────────────
  narration: {
    intro: [
      "Halo, Kadet! Selamat datang di Pusat Kendali Antariksa Bimbel RBS!",
      "Mesin fusi menyala, koordinat Tata Surya terkunci.",
      "Misi utama kita: kumpulkan data atmosfer, struktur fisik, dan orbit dari 8 planet!",
      "Waspada anomali gravitasi dan rintangan asteroid.",
      "Peluncuran dalam 3... 2... 1... Wush! 🚀"
    ],
    asteroidBelt: [
      "⚠️ Peringatan! Radar mendeteksi pecahan batuan padat!",
      "Kita memasuki Sabuk Asteroid di antara orbit Mars dan Jupiter.",
      "Jawab pertanyaan navigasi dengan benar untuk membuka jalur aman!"
    ],
    outro: [
      "🎉 Selamat, Kadet!",
      "Seluruh Logbook Navigasi Antariksa terisi penuh!",
      "Modul roket berhasil memetakan seluruh Tata Surya kita.",
      "Data kamu siap dikirim kembali ke Pusat Kendali Bumi!",
      "Kamu resmi mendapat lencana: Ahli Astronomi Tata Surya! 🏅"
    ]
  },

  // ── Data Planet ────────────────────────────────────────────
  planets: [
    {
      id: "merkurius",
      name: "Merkurius",
      order: 1,
      color: "#b0a090",
      size: 18,
      orbitRadius: 80,
      orbitSpeed: 0.04,
      icon: "☿",
      iconSvg: `<svg width="60" height="60" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="45" fill="#9e948a" />
  <ellipse cx="65" cy="40" rx="15" ry="12" fill="#7a7065" />
  <ellipse cx="63" cy="39" rx="10" ry="8" fill="#5c534a" />
  <ellipse cx="30" cy="65" rx="10" ry="8" fill="#7a7065" />
  <ellipse cx="29" cy="64" rx="7" ry="5" fill="#5c534a" />
  <ellipse cx="35" cy="25" rx="6" ry="4" fill="#7a7065" />
  <ellipse cx="75" cy="70" rx="8" ry="12" fill="#7a7065" transform="rotate(-30 75 70)"/>
  <path d="M 50 95 A 45 45 0 0 0 95 50 A 45 45 0 0 1 50 95 Z" fill="#000000" opacity="0.35"/>
  <path d="M 5 50 A 45 45 0 0 1 50 5 A 45 45 0 0 0 5 50 Z" fill="#ffffff" opacity="0.25"/>
</svg>`,
      tagline: "Planet Tercepat & Terpanas-Terdingin",
      description: "Planet terkecil dan terdekat dari Matahari. Permukaannya penuh kawah seperti Bulan.",
      facts: [
        "🌡️ Suhu siang: hingga 430°C, malam: -180°C",
        "🔄 Rotasi sangat lambat: 1 hari = 59 hari Bumi",
        "🌍 Tidak punya atmosfer tebal untuk menahan panas",
        "📏 Diameter: 4.879 km (terkecil)",
        "☀️ Jarak ke Matahari: 57,9 juta km"
      ],
      interactionTitle: "Misi: Atur Pelindung Suhu!",
      interactionDesc: "Merkurius tidak punya atmosfer tebal. Siang sangat panas, malam sangat dingin. Bantu atur pelindung suhu roket!",
      interactionType: "temperature",
      gravity: 3.7,
      mpiColor: "#8B7355"
    },
    {
      id: "venus",
      name: "Venus",
      order: 2,
      color: "#e8c060",
      size: 24,
      orbitRadius: 115,
      orbitSpeed: 0.015,
      icon: "♀",
      iconSvg: `<svg width="60" height="60" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="venus-clip">
      <circle cx="50" cy="50" r="45" />
    </clipPath>
  </defs>
  <circle cx="50" cy="50" r="45" fill="#f4a261" />
  <g clip-path="url(#venus-clip)">
    <path d="M -10 20 Q 25 40 60 10 T 110 30" fill="none" stroke="#e76f51" stroke-width="12" opacity="0.7"/>
    <path d="M -10 45 Q 30 65 70 35 T 110 50" fill="none" stroke="#e9c46a" stroke-width="18" opacity="0.8"/>
    <path d="M -10 75 Q 40 95 80 65 T 110 85" fill="none" stroke="#d56c42" stroke-width="10" opacity="0.7"/>
  </g>
  <path d="M 50 95 A 45 45 0 0 0 95 50 A 45 45 0 0 1 50 95 Z" fill="#000000" opacity="0.35"/>
  <path d="M 5 50 A 45 45 0 0 1 50 5 A 45 45 0 0 0 5 50 Z" fill="#ffffff" opacity="0.25"/>
</svg>`,
      tagline: "Planet Terpanas dengan Selimut Gas Tebal",
      description: "Sering disebut 'kembaran Bumi' karena ukurannya mirip, tapi permukaannya sangat panas!",
      facts: [
        "🌡️ Suhu permukaan: 465°C (terpanas di Tata Surya!)",
        "💨 Atmosfer sangat tebal: 96% karbon dioksida (CO₂)",
        "🔄 Rotasi retrograd: berputar berlawanan arah planet lain",
        "🌫️ Tekanan atmosfer 90x lipat tekanan di Bumi",
        "☀️ Jarak ke Matahari: 108,2 juta km"
      ],
      interactionTitle: "Misi: Aktifkan Sensor Asam & Tekanan!",
      interactionDesc: "Atmosfer Venus sangat tebal dan penuh gas CO₂. Hidupkan sensor untuk menganalisis tekanan dan komposisi atmosfernya!",
      interactionType: "atmosphere",
      gravity: 8.87,
      mpiColor: "#DAA520",
      image: "assets/Ilustrasi Permukaan Venus.webp",
      imageCaption: "📸 Citra Radar Permukaan Venus: Suhu >450°C di bawah selimut gas CO₂ pekat"
    },
    {
      id: "bumi",
      name: "Bumi",
      order: 3,
      color: "#4488cc",
      size: 26,
      orbitRadius: 150,
      orbitSpeed: 0.01,
      icon: "🌍",
      tagline: "Planet Biru — Rumah Kita",
      description: "Satu-satunya planet yang diketahui memiliki kehidupan. Punya air cair, atmosfer oksigen, dan medan magnet pelindung.",
      facts: [
        "💧 70% permukaan tertutup air cair",
        "🌡️ Suhu rata-rata: 15°C (zona laik huni)",
        "🛡️ Medan magnet melindungi dari radiasi Matahari",
        "🌙 Punya 1 satelit alami: Bulan",
        "☀️ Jarak ke Matahari: 149,6 juta km"
      ],
      interactionTitle: "Misi: Bandingkan Zona Laik Huni!",
      interactionDesc: "Bumi berada di zona laik huni (habitable zone). Bandingkan kondisi Bumi dengan planet lain untuk memahami mengapa kehidupan bisa ada di sini!",
      interactionType: "habitable",
      gravity: 9.8,
      mpiColor: "#4169E1"
    },
    {
      id: "mars",
      name: "Mars",
      order: 4,
      color: "#cc4422",
      size: 22,
      orbitRadius: 190,
      orbitSpeed: 0.008,
      icon: "♂",
      iconSvg: `<svg width="60" height="60" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="mars-clip">
      <circle cx="50" cy="50" r="45" />
    </clipPath>
  </defs>
  <circle cx="50" cy="50" r="45" fill="#c1440e" />
  <g clip-path="url(#mars-clip)">
    <path d="M 20 15 Q 50 25 80 15 Q 70 5 50 5 Q 30 5 20 15 Z" fill="#f4f1de" opacity="0.8"/>
    <path d="M 25 45 Q 40 30 65 40 T 75 60 Q 60 70 40 65 T 25 45 Z" fill="#932b00" opacity="0.6" />
    <ellipse cx="70" cy="75" rx="15" ry="8" fill="#691a00" opacity="0.5" transform="rotate(-15 70 75)" />
    <ellipse cx="20" cy="70" rx="10" ry="12" fill="#932b00" opacity="0.4" transform="rotate(20 20 70)" />
    <path d="M 30 50 Q 45 60 60 45" fill="none" stroke="#691a00" stroke-width="3" stroke-linecap="round" opacity="0.4" />
    <path d="M 15 35 Q 25 40 30 35" fill="none" stroke="#691a00" stroke-width="2" stroke-linecap="round" opacity="0.3" />
  </g>
  <path d="M 50 95 A 45 45 0 0 0 95 50 A 45 45 0 0 1 50 95 Z" fill="#000000" opacity="0.35"/>
  <path d="M 5 50 A 45 45 0 0 1 50 5 A 45 45 0 0 0 5 50 Z" fill="#ffffff" opacity="0.25"/>
</svg>`,
      tagline: "Planet Merah — Target Eksplorasi Manusia",
      description: "Disebut Planet Merah karena tanahnya mengandung oksida besi (karat). Punya gunung tertinggi di Tata Surya!",
      facts: [
        "🏔️ Olympus Mons: gunung tertinggi (21,9 km!)",
        "🔴 Warna merah dari oksida besi (Fe₂O₃)",
        "🌡️ Suhu rata-rata: -63°C",
        "🌙 Punya 2 bulan kecil: Phobos & Deimos",
        "☀️ Jarak ke Matahari: 227,9 juta km"
      ],
      interactionTitle: "Misi: Jalankan Rover Virtual!",
      interactionDesc: "Kendalikan rover untuk mengambil sampel tanah merah Mars. Analisis kandungan mineralnya!",
      interactionType: "rover",
      gravity: 3.72,
      mpiColor: "#CD5C5C"
    },
    {
      id: "jupiter",
      name: "Jupiter",
      order: 5,
      color: "#cc9966",
      size: 45,
      orbitRadius: 260,
      orbitSpeed: 0.004,
      icon: "♃",
      tagline: "Raksasa Gas Terbesar",
      description: "Planet terbesar di Tata Surya. Tidak punya permukaan padat — seluruhnya gas!",
      facts: [
        "🌀 Bintik Merah Raksasa: badai yang lebih besar dari Bumi!",
        "💨 Tersusun dari hidrogen (H₂) dan helium (He)",
        "🚫 Tidak punya permukaan padat untuk mendarat",
        "🌙 Punya 95+ satelit alami (termasuk Ganymede, terbesar)",
        "☀️ Jarak ke Matahari: 778,5 juta km"
      ],
      interactionTitle: "Misi: Terobos Badai Bintik Merah!",
      interactionDesc: "Jupiter adalah raksasa gas — tidak bisa mendarat! Navigasikan roket melewati Badai Bintik Merah Raksasa sambil mengumpulkan data!",
      interactionType: "storm",
      gravity: 24.79,
      mpiColor: "#D2691E"
    },
    {
      id: "saturnus",
      name: "Saturnus",
      order: 6,
      color: "#ddc488",
      size: 40,
      orbitRadius: 320,
      orbitSpeed: 0.003,
      icon: "♄",
      tagline: "Si Cantik Bercincin",
      description: "Terkenal dengan cincin megahnya yang terbuat dari miliaran partikel es dan batu angkasa.",
      facts: [
        "💍 Cincin terdiri dari es air, debu, dan batu",
        "⚖️ Densitas sangat rendah — bisa mengapung di air!",
        "💨 Juga raksasa gas seperti Jupiter",
        "🌙 Punya 146+ satelit (termasuk Titan yang punya atmosfer)",
        "☀️ Jarak ke Matahari: 1,43 miliar km"
      ],
      interactionTitle: "Misi: Analisis Partikel Cincin!",
      interactionDesc: "Terbang melewati cincin Saturnus dan analisis komposisi partikelnya. Apa saja yang menyusun cincin megah ini?",
      interactionType: "rings",
      gravity: 10.44,
      mpiColor: "#F0E68C"
    },
    {
      id: "uranus",
      name: "Uranus",
      order: 7,
      color: "#88cccc",
      size: 34,
      orbitRadius: 375,
      orbitSpeed: 0.002,
      icon: "⛢",
      tagline: "Planet yang Tidur Miring",
      description: "Unik karena berotasi dengan poros yang hampir rebah (~98°), seolah-olah berguling di orbitnya!",
      facts: [
        "🔄 Kemiringan poros rotasi: ~98° (hampir rebah!)",
        "💎 Warna biru-hijau dari gas metana (CH₄)",
        "🥶 Suhu terdingin: -224°C",
        "💍 Punya cincin tipis vertikal",
        "☀️ Jarak ke Matahari: 2,87 miliar km"
      ],
      interactionTitle: "Misi: Sesuaikan Kemiringan Roket!",
      interactionDesc: "Poros rotasi Uranus hampir rebah 98°! Sesuaikan orientasi roket agar bisa mengorbit dengan benar!",
      interactionType: "tilt",
      gravity: 8.87,
      mpiColor: "#7EC8E3"
    },
    {
      id: "neptunus",
      name: "Neptunus",
      order: 8,
      color: "#3366aa",
      size: 32,
      orbitRadius: 425,
      orbitSpeed: 0.001,
      icon: "♆",
      tagline: "Planet Terjauh yang Penuh Badai",
      description: "Planet terjauh dari Matahari dengan angin tercepat di Tata Surya — hingga 2.100 km/jam!",
      facts: [
        "💨 Angin tercepat di Tata Surya: 2.100 km/jam!",
        "🔵 Warna biru pekat dari metana (CH₄)",
        "🌀 Punya badai es raksasa (Great Dark Spot)",
        "⏰ 1 tahun Neptunus = 165 tahun Bumi",
        "☀️ Jarak ke Matahari: 4,5 miliar km"
      ],
      interactionTitle: "Misi: Hadapi Turbulensi Angin!",
      interactionDesc: "Neptunus punya angin tercepat di Tata Surya! Stabilkan roket di tengah turbulensi dahsyat!",
      interactionType: "wind",
      gravity: 11.15,
      mpiColor: "#1E90FF"
    }
  ],

  // ── Kuis / Mission Checkpoints ─────────────────────────────
  quizzes: {
    venus: {
      planet: "Venus",
      image: "assets/Ilustrasi Permukaan Venus.webp",
      imageCaption: "📸 Citra Radar Permukaan Venus: Suhu >450°C di bawah selimut awan tebal CO₂",
      prompt: "Sensor luar mendeteksi suhu permukaan lebih dari 450°C, bahkan lebih panas dari Merkurius padahal letaknya lebih jauh dari Matahari. Mengapa fenomena ini terjadi?",
      options: [
        { text: "Inti planet Venus terdiri atas magma cair yang bocor ke seluruh permukaan.", correct: false },
        { text: "Atmosfernya sangat tebal dan didominasi karbon dioksida (CO₂), memerangkap panas secara ekstrem.", correct: true },
        { text: "Venus memiliki cincin api radioaktif yang mengelilingi seluruh orbitnya.", correct: false }
      ],
      feedback: "✅ Benar! Suhu ekstrem Venus disebabkan oleh efek rumah kaca alami yang parah akibat selimut tebal gas karbon dioksida."
    },
    mars: {
      planet: "Mars",
      prompt: "Rover kita mendarat di dataran merah Mars. Bobot rover di Bumi adalah 600 N. Bagaimana bobot rover saat berada di permukaan Mars?",
      options: [
        { text: "Menjadi lebih kecil karena percepatan gravitasi Mars lebih rendah daripada Bumi.", correct: true },
        { text: "Tetap 600 N karena massa benda tidak pernah berubah di mana pun.", correct: false },
        { text: "Menjadi nol karena Mars tidak memiliki gravitasi sama sekali.", correct: false }
      ],
      feedback: "✅ Benar! Massa benda tetap, namun bobot (W = m × g) berkurang drastis karena percepatan gravitasi Mars hanya sekitar 0,38 kali gravitasi Bumi."
    },
    jupiter: {
      planet: "Jupiter",
      prompt: "Kadet mencoba mencari koordinat daratan berbatu untuk mendaratkan kaki roket di Jupiter. Mengapa modul roket menolak perintah pendaratan padat?",
      options: [
        { text: "Jupiter tertutup lapisan es abadi setebal ribuan kilometer.", correct: false },
        { text: "Jupiter adalah raksasa gas tanpa permukaan padat yang jelas, didominasi hidrogen dan helium.", correct: true },
        { text: "Medan magnet Jupiter menghancurkan semua jenis logam sebelum menyentuh tanah.", correct: false }
      ],
      feedback: "✅ Benar! Planet Jovian (luar) seperti Jupiter tersusun dari gas tanpa permukaan daratan layaknya planet terestrial."
    },
    saturnus: {
      planet: "Saturnus",
      prompt: "Sensor spektrum menganalisis materi penyusun cincin megah Saturnus. Terbuat dari apakah lembaran cincin tipis tersebut?",
      options: [
        { text: "Gas beracun metana yang memadat karena suhu dingin.", correct: false },
        { text: "Batuan beku vulkanik yang memancarkan cahaya sendiri.", correct: false },
        { text: "Miliaran partikel bongkahan es air, debu, dan serpihan batu angkasa.", correct: true }
      ],
      feedback: "✅ Benar! Cincin Saturnus tampak berkilau karena sebagian besar partikelnya adalah es air dan debu yang memantulkan cahaya Matahari."
    },
    neptunus: {
      planet: "Neptunus",
      prompt: "Sistem navigasi mencatat 1 tahun (kala revolusi) di Neptunus jauh lebih panjang daripada di Merkurius (sekitar 165 tahun Bumi). Apa penyebab utamanya?",
      options: [
        { text: "Neptunus memiliki lintasan orbit yang jauh lebih panjang dan kecepatan orbit yang lebih lambat.", correct: true },
        { text: "Neptunus berputar pada porosnya (rotasi) jauh lebih lambat dari planet lain.", correct: false },
        { text: "Gravitasi Matahari di Neptunus lebih kuat sehingga menarik planet lebih kencang.", correct: false }
      ],
      feedback: "✅ Benar! Semakin jauh jarak planet dari Matahari, semakin panjang lintasan orbitnya dan semakin kecil kecepatan revolusinya (Hukum III Kepler)."
    }
  },

  // ── Kuis Sabuk Asteroid ────────────────────────────────────
  asteroidQuiz: [
    {
      question: "Sabuk Asteroid terletak di antara orbit planet apa?",
      options: ["Bumi dan Mars", "Mars dan Jupiter", "Jupiter dan Saturnus"],
      correctIndex: 1,
      explanation: "Sabuk Asteroid berada di antara orbit Mars dan Jupiter."
    },
    {
      question: "Apa perbedaan utama antara planet dalam (terestrial) dan planet luar (Jovian)?",
      options: [
        "Planet dalam lebih besar dari planet luar",
        "Planet dalam berbatu padat, planet luar tersusun dari gas",
        "Planet luar lebih dekat ke Matahari"
      ],
      correctIndex: 1,
      explanation: "Planet dalam (Merkurius-Mars) berbatu padat, sedangkan planet luar (Jupiter-Neptunus) tersusun dari gas."
    },
    {
      question: "Berapa jumlah planet di Tata Surya kita?",
      options: ["7 planet", "8 planet", "9 planet"],
      correctIndex: 1,
      explanation: "Tata Surya kita memiliki 8 planet. Pluto direklasifikasi sebagai planet katai sejak 2006."
    }
  ],

  // ── Konfigurasi Game ───────────────────────────────────────
  config: {
    maxFuel: 100,
    fuelPerTravel: 8,
    fuelPerWrongAnswer: 5,
    fuelBonusCorrect: 3,
    startingFuel: 100
  }
};
