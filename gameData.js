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
      category: "Planet Dalam (Terestrial / Berbatu)",
      distanceAU: "0,39 AU",
      distanceKm: "57,9 juta km",
      temp: "+430°C (Siang) / -180°C (Malam)",
      revolutionPeriod: "88 hari Bumi",
      rotationPeriod: "59 hari Bumi",
      atmosphere: "Eksosfer sangat tipis (Natrium, Kalium, Helium)",
      description: "Planet terkecil dan terdekat dari Matahari. Permukaannya penuh kawah seperti Bulan tanpa atmosfer pelindung.",
      facts: [
        "☀️ Urutan: Planet ke-1 terdekat dari Matahari",
        "🌐 Kategori: Planet Dalam (Terestrial Berbatu)",
        "🌡️ Suhu siang: hingga 430°C, malam: -180°C",
        "🔄 Rotasi lambat: 1 hari = 59 hari Bumi (Revolusi: 88 hari)",
        "📏 Diameter: 4.879 km (planet terkecil di Tata Surya)",
        "🛰️ Jarak ke Matahari: 0,39 AU (57,9 juta km)"
      ],
      interactionTitle: "Misi: Atur Pelindung Suhu!",
      interactionDesc: "Merkurius tidak punya atmosfer tebal. Siang sangat panas, malam sangat dingin. Bantu atur pelindung suhu roket!",
      interactionType: "temperature",
      gravity: 3.7,
      mpiColor: "#8B7355",
      image: "assets/planet-merkurius.jpg",
      surfaceImage: "assets/surface-merkurius.jpg",
      imageCaption: "📸 Citra NASA MESSENGER: Mosaik warna spektral Merkurius mengungkap variasi mineral dan struktur geologis unik yang kaya logam berat.",
      surfaceImageCaption: "📸 Permukaan Nyata: Cekungan Caloris Basin dan patahan Apollodorus Mons di permukaan Merkurius yang penuh jejak tumbukan purba.",
      surfaceTabTitle: "🌋 Permukaan Nyata",
      nasaCredit: "NASA / Johns Hopkins University APL / Carnegie Institution of Washington (MESSENGER Mission)",
      narrationSpeech: "Kita telah tiba di orbit Merkurius, planet terkecil dan terdekat dari Matahari. Karena tidak memiliki atmosfer penahan suhu, bagian siangnya mendidih hingga 430 derajat Celsius, sementara malamnya membeku hingga minus 180 derajat Celsius!"
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
      category: "Planet Dalam (Terestrial / Berbatu)",
      distanceAU: "0,72 AU",
      distanceKm: "108,2 juta km",
      temp: "465°C (Terpanas di Tata Surya)",
      revolutionPeriod: "225 hari Bumi",
      rotationPeriod: "243 hari Bumi (Retrograd / Terbalik)",
      atmosphere: "96% Karbon Dioksida (CO₂), 3,5% Nitrogen, Asam Sulfat",
      description: "Sering disebut 'kembaran Bumi' karena ukurannya mirip, tapi atmosfer asamnya menciptakan efek rumah kaca ekstrem!",
      facts: [
        "☀️ Urutan: Planet ke-2 dari Matahari",
        "🌐 Kategori: Planet Dalam (Terestrial Berbatu)",
        "🌡️ Suhu permukaan: 465°C (terpanas di seluruh Tata Surya!)",
        "💨 Atmosfer sangat tebal: 96% CO₂ dengan tekanan 90x lipat Bumi",
        "🔄 Rotasi retrograd: berputar dari timur ke barat (berlawanan planet lain)",
        "🛰️ Jarak ke Matahari: 0,72 AU (108,2 juta km)"
      ],
      interactionTitle: "Misi: Aktifkan Sensor Asam & Tekanan!",
      interactionDesc: "Atmosfer Venus sangat tebal dan penuh gas CO₂. Hidupkan sensor untuk menganalisis tekanan dan komposisi atmosfernya!",
      interactionType: "atmosphere",
      gravity: 8.87,
      mpiColor: "#DAA520",
      image: "assets/planet-venus.jpg",
      surfaceImage: "assets/surface-venus.jpg",
      imageCaption: "📸 Citra NASA Pioneer & Mariner: Lapisan awan tebal gas karbon dioksida dan kabut asam sulfat yang menyelimuti seluruh planet Venus.",
      surfaceImageCaption: "📸 Permukaan Nyata: Rekonstruksi radar 3D wahana NASA Magellan menembus awan tebal, mengungkap gunung berapi Sif Mons dan dataran batuan beku lava.",
      surfaceTabTitle: "🌋 Permukaan Nyata",
      nasaCredit: "NASA / Jet Propulsion Laboratory (JPL Magellan Radar & Pioneer Venus)",
      narrationSpeech: "Waspada Kadet! Kita berada di atas planet Venus, planet terpanas di seluruh Tata Surya. Atmosfernya 96 persen gas karbon dioksida dengan tekanan 90 kali lipat Bumi, menjebak panas matahari bagaikan oven raksasa!"
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
      category: "Planet Dalam (Terestrial / Berbatu)",
      distanceAU: "1,00 AU",
      distanceKm: "149,6 juta km",
      temp: "15°C (Zona Laik Huni)",
      revolutionPeriod: "365,25 hari (1 Tahun)",
      rotationPeriod: "24 jam (1 Hari)",
      atmosphere: "78% Nitrogen, 21% Oksigen, 1% Argon & Gas Lain",
      description: "Satu-satunya oasis kehidupan yang diketahui di alam semesta. Memiliki air cair, atmosfer kaya oksigen, dan medan magnet pelindung.",
      facts: [
        "☀️ Urutan: Planet ke-3 dari Matahari",
        "🌐 Kategori: Planet Dalam (Zona Laik Huni / Goldilocks)",
        "💧 70% permukaan tertutup air cair yang mendukung jutaan spesies",
        "🌡️ Suhu rata-rata: 15°C yang stabil dan seimbang",
        "🛡️ Medan magnet & lapisan ozon melindungi dari radiasi kosmik",
        "🌙 Memiliki 1 satelit alami setia: Bulan (Luna)",
        "🛰️ Jarak ke Matahari: 1,00 AU (149,6 juta km)"
      ],
      interactionTitle: "Misi: Bandingkan Zona Laik Huni!",
      interactionDesc: "Bumi berada di zona laik huni (Goldilocks zone). Analisis 3 syarat utama mengapa kehidupan bisa berkembang di Bumi!",
      interactionType: "habitable",
      gravity: 9.8,
      mpiColor: "#4169E1",
      image: "assets/planet-bumi.jpg",
      surfaceImage: "assets/surface-bumi.jpg",
      imageCaption: "📸 Citra NASA DSCOVR: Planet Biru rumah kita dari kejauhan 1,5 juta km, menampilkan perpaduan benua hijau, awan putih, dan samudra luas.",
      surfaceImageCaption: "📸 Permukaan & Atmosfer Nyata: Pemandangan nyata lengkung cakrawala Bumi, atmosfer biru tipis, dan birunya samudra dari Stasiun Luar Angkasa Internasional (ISS).",
      surfaceTabTitle: "🌍 Permukaan & Atmosfer",
      nasaCredit: "NASA / NOAA / International Space Station (ISS Expedition)",
      narrationSpeech: "Selamat kembali memandang Bumi dari orbit! Rumah kita adalah permata biru yang unik, berada di zona laik huni dengan air cair, atmosfer kaya oksigen, serta medan magnet pelindung dari radiasi kosmik."
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
      category: "Planet Dalam (Terestrial / Berbatu)",
      distanceAU: "1,52 AU",
      distanceKm: "227,9 juta km",
      temp: "-63°C (Kutub Beku)",
      revolutionPeriod: "687 hari Bumi (~1,9 tahun)",
      rotationPeriod: "24 jam 37 menit",
      atmosphere: "95% CO₂, 2,6% Nitrogen, 1,9% Argon (Tipis)",
      description: "Disebut Planet Merah karena tanahnya kaya oksida besi (karat). Memiliki gunung berapi tertinggi di Tata Surya, Olympus Mons!",
      facts: [
        "☀️ Urutan: Planet ke-4 dari Matahari (batas luar Planet Terestrial)",
        "🌐 Kategori: Planet Dalam (Terestrial Berbatu)",
        "🏔️ Olympus Mons: gunung berapi tertinggi di Tata Surya (21,9 km!)",
        "🔴 Rona merah berasal dari kandungan oksida besi (karat) di debunya",
        "🌡️ Suhu rata-rata dingin: -63°C, memiliki tudung es di kutub",
        "🌙 Memiliki 2 satelit kecil berbentuk asteroid: Phobos & Deimos",
        "🛰️ Jarak ke Matahari: 1,52 AU (227,9 juta km)"
      ],
      interactionTitle: "Misi: Jalankan Rover Virtual!",
      interactionDesc: "Kendalikan rover penjelajah untuk mengambil sampel tanah merah Mars. Analisis kandungan mineral oksida besinya!",
      interactionType: "rover",
      gravity: 3.72,
      mpiColor: "#CD5C5C",
      image: "assets/planet-mars.jpg",
      surfaceImage: "assets/surface-mars.jpg",
      imageCaption: "📸 Citra NASA Viking Orbiter: Panorama global Planet Merah memperlihatkan ngarai raksasa Valles Marineris dan tudung es kutub.",
      surfaceImageCaption: "📸 Permukaan Nyata: Foto langsung dari Rover Curiosity di Kawah Gale, memperlihatkan hamparan batuan berlapis dan tanah merah kaya oksida besi (karat).",
      surfaceTabTitle: "🌋 Permukaan Nyata",
      nasaCredit: "NASA / JPL-Caltech / USGS (Mars Global Surveyor & Curiosity Rover)",
      narrationSpeech: "Orbit Mars tercapai! Kadet, perhatikan rona merah karat pada permukaannya yang disebabkan debu besi teroksidasi. Gravitasi di sini hanya 0,38 kali gravitasi Bumi, membuat langkah rover terasa sangat ringan!"
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
      category: "Planet Luar (Raksasa Gas / Jovian)",
      distanceAU: "5,20 AU",
      distanceKm: "778,5 juta km",
      temp: "-110°C (Lapisan Awan Luar)",
      revolutionPeriod: "11,86 tahun Bumi",
      rotationPeriod: "9 jam 55 menit (Rotasi tercepat!)",
      atmosphere: "89% Hidrogen (H₂), 10% Helium (He), Amonia & Metana",
      description: "Planet raksasa gas terbesar dengan massa 2,5 kali gabungan semua planet lain. Tidak memiliki daratan padat untuk mendarat!",
      facts: [
        "☀️ Urutan: Planet ke-5 dari Matahari (melewati Sabuk Asteroid)",
        "🌐 Kategori: Planet Luar (Raksasa Gas Jovian terbesar)",
        "🌀 Bintik Merah Raksasa: badai antisiklon raksasa yang lebih luas dari Bumi!",
        "💨 Mayoritas tersusun dari fluida hidrogen & helium tanpa pijakan padat",
        "⚡ Rotasi super cepat: 1 hari Jupiter hanya berlangsung 9 jam 55 menit",
        "🌙 Memiliki 95+ satelit alami (Ganymede lebih besar dari Merkurius)",
        "🛰️ Jarak ke Matahari: 5,20 AU (778,5 juta km)"
      ],
      interactionTitle: "Misi: Terobos Badai Bintik Merah!",
      interactionDesc: "Jupiter adalah raksasa gas — tidak bisa mendarat padat! Navigasikan sensor roket menerobos badai Bintik Merah Raksasa!",
      interactionType: "storm",
      gravity: 24.79,
      mpiColor: "#D2691E",
      image: "assets/planet-jupiter.jpg",
      surfaceImage: "assets/surface-jupiter.jpg",
      imageCaption: "📸 Citra NASA Cassini: Potret warna asli raksasa gas terbesar dengan pita sabuk awan hidrogen dan helium yang berputar konstan.",
      surfaceImageCaption: "📸 Atmosfer & Badai Nyata: Pusaran siklon Bintik Merah Raksasa (Great Red Spot) dipotret dari jarak sangat dekat oleh wahana antariksa NASA Juno.",
      surfaceTabTitle: "🌪️ Atmosfer & Badai Nyata",
      nasaCredit: "NASA / JPL-Caltech / SwRI / MSSS (Cassini & Juno Mission)",
      narrationSpeech: "Selamat datang di medan gravitasi masif Jupiter! Raksasa gas terbesar di tata surya kita. Ingat, Jupiter tidak memiliki daratan padat, seluruh strukturnya tersusun dari pusaran gas hidrogen dan helium yang bergolak kencang."
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
      category: "Planet Luar (Raksasa Gas / Jovian)",
      distanceAU: "9,58 AU",
      distanceKm: "1,43 miliar km",
      temp: "-140°C (Atmosfer Gas & Cincin Es)",
      revolutionPeriod: "29,45 tahun Bumi",
      rotationPeriod: "10 jam 33 menit",
      atmosphere: "96% Hidrogen (H₂), 3% Helium (He), Metana & Amonia",
      description: "Planet tercantik dengan lembaran cincin megah dari miliaran serpihan es air murni dan debu kosmik.",
      facts: [
        "☀️ Urutan: Planet ke-6 dari Matahari",
        "🌐 Kategori: Planet Luar (Raksasa Gas dengan Sistem Cincin Termegah)",
        "💍 Cincin membentang 282.000 km, tersusun 99% partikel es air murni & debu",
        "⚖️ Densitas sangat rendah: 0,687 g/cm³ (dapat mengapung di air!)",
        "💨 Planet gas tanpa permukaan padat, didominasi hidrogen & helium",
        "🌙 Memiliki 146+ satelit alami (Titan memiliki atmosfer tebal & danau metana)",
        "🛰️ Jarak ke Matahari: 9,58 AU (1,43 miliar km)"
      ],
      interactionTitle: "Misi: Analisis Partikel Cincin!",
      interactionDesc: "Terbang mendekati cincin Saturnus dan aktifkan spektrometer untuk menganalisis partikel es dan densitasnya!",
      interactionType: "rings",
      gravity: 10.44,
      mpiColor: "#F0E68C",
      image: "assets/planet-saturnus.jpg",
      surfaceImage: "assets/surface-saturnus.jpg",
      imageCaption: "📸 Citra NASA Cassini: Keindahan planet cincin Saturnus dengan bayangan lembaran cincin membentang di atas atmosfer gas keemasan.",
      surfaceImageCaption: "📸 Cincin & Partikel Es Nyata: Struktur detail cincin Saturnus dan Celah Cassini yang tersusun dari miliaran bongkahan es air murni dan debu antariksa.",
      surfaceTabTitle: "💍 Cincin & Partikel Es",
      nasaCredit: "NASA / JPL-Caltech / Space Science Institute (Cassini-Huygens Mission)",
      narrationSpeech: "Pemandangan spektakuler! Kita memasuki orbit Saturnus. Cincin megah yang terlihat padat ini sebenarnya adalah miliaran partikel bongkahan es air jernih dan debu antariksa yang memantulkan sinar mentari."
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
      category: "Planet Luar (Raksasa Es / Jovian)",
      distanceAU: "19,2 AU",
      distanceKm: "2,87 miliar km",
      temp: "-195°C s.d. -224°C (Terdingin)",
      revolutionPeriod: "84 tahun Bumi",
      rotationPeriod: "17 jam 14 menit (Miring ~98°)",
      atmosphere: "83% Hidrogen, 15% Helium, 2% Gas Metana (CH₄)",
      description: "Raksasa es unik dengan kemiringan poros rotasi hampir 98°, berputar seolah berguling di bidang orbitnya!",
      facts: [
        "☀️ Urutan: Planet ke-7 dari Matahari",
        "🌐 Kategori: Planet Luar (Raksasa Es Beku)",
        "🔄 Kemiringan sumbu rotasi ekstrem: 97,8° (seakan berguling di orbitnya)",
        "💎 Warna biru kehijauan berasal dari penyerapan cahaya merah oleh metana",
        "🥶 Rekor atmosfer terdingin di Tata Surya: mencapai -224°C",
        "💍 Memiliki 13 cincin tipis yang berorientasi tegak/vertikal",
        "🛰️ Jarak ke Matahari: 19,2 AU (2,87 miliar km)"
      ],
      interactionTitle: "Misi: Sesuaikan Kemiringan Roket!",
      interactionDesc: "Poros rotasi Uranus hampir rebah 98°! Kalibrasi orientasi roket agar sejajar dengan medan gravitasi unik Uranus!",
      interactionType: "tilt",
      gravity: 8.87,
      mpiColor: "#7EC8E3",
      image: "assets/planet-uranus.jpg",
      surfaceImage: "assets/surface-uranus.jpg",
      imageCaption: "📸 Citra NASA Voyager 2: Raksasa es biru kehijauan dengan atmosfer metana beku dan poros rotasi unik yang rebah 98 derajat.",
      surfaceImageCaption: "📸 Cincin & Atmosfer Nyata: Citra teleskop inframerah NASA Hubble & Keck mengungkap struktur atmosfer dinamis dan sistem 13 cincin vertikal Uranus.",
      surfaceTabTitle: "💍 Cincin & Atmosfer Vertikal",
      nasaCredit: "NASA / JPL / STScI / Keck Observatory",
      narrationSpeech: "Memasuki wilayah Uranus, sang raksasa es beku. Keunikan paling dramatis planet ini adalah kemiringan sumbu rotasinya hingga 98 derajat, sehingga Uranus seakan berguling saat mengitari orbitnya!"
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
      category: "Planet Luar (Raksasa Es / Jovian)",
      distanceAU: "30,1 AU",
      distanceKm: "4,50 miliar km",
      temp: "-200°C s.d. -218°C (Badai Es Supersonik)",
      revolutionPeriod: "164,8 tahun Bumi",
      rotationPeriod: "16 jam 6 menit",
      atmosphere: "80% Hidrogen, 19% Helium, 1,5% Metana (CH₄)",
      description: "Planet terjauh di Tata Surya dengan badai supersonik tercepat hingga 2.100 km/jam!",
      facts: [
        "☀️ Urutan: Planet ke-8 (terjauh dari Matahari)",
        "🌐 Kategori: Planet Luar (Raksasa Es Terjauh)",
        "💨 Angin badai supersonik tercepat di Tata Surya: hingga 2.100 km/jam!",
        "🔵 Warna biru laut pekat spektakuler akibat molekul metana di atmosfer",
        "🌀 Great Dark Spot: sistem badai antisiklon es raksasa seukuran Bumi",
        "⏰ Orbit sangat panjang: 1 tahun Neptunus = 165 tahun di Bumi",
        "🛰️ Jarak ke Matahari: 30,1 AU (4,50 miliar km)"
      ],
      interactionTitle: "Misi: Hadapi Turbulensi Angin!",
      interactionDesc: "Neptunus memiliki angin supersonik tercepat di Tata Surya! Aktifkan pendorong stabilitas di tengah badai es!",
      interactionType: "wind",
      gravity: 11.15,
      mpiColor: "#1E90FF",
      image: "assets/planet-neptunus.jpg",
      surfaceImage: "assets/surface-neptunus.jpg",
      imageCaption: "📸 Citra NASA Voyager 2: Planet terjauh berwarna biru laut pekat dengan hembusan angin supersonik hingga 2.100 km/jam.",
      surfaceImageCaption: "📸 Badai Supersonik Nyata: Sistem badai siklon raksasa Great Dark Spot dan pita awan metana putih yang melaju kencang di batas luar tata surya.",
      surfaceTabTitle: "🌪️ Badai Supersonik Nyata",
      nasaCredit: "NASA / Jet Propulsion Laboratory (Voyager 2 Planetary Encounters)",
      narrationSpeech: "Kita telah mencapai garis batas terluar, Neptunus! Planet biru pekat berangin supersonik yang membutuhkan waktu 165 tahun bumi untuk menyelesaikan satu putaran orbit penuh mengelilingi Matahari."
    }
  ],

  // ── Kuis / Mission Checkpoints ─────────────────────────────
  quizzes: {
    venus: {
      planet: "Venus",
      image: "assets/surface-venus.jpg",
      imageCaption: "📸 Citra Radar NASA Magellan: Permukaan vulkanik batuan basal Venus dengan suhu >450°C akibat efek rumah kaca ekstrem gas CO₂.",
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
      image: "assets/surface-mars.jpg",
      imageCaption: "📸 Citra NASA Curiosity Rover: Penjelajah robotik menganalisis dataran merah dan batuan di Kawah Gale Mars.",
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
      image: "assets/surface-jupiter.jpg",
      imageCaption: "📸 Citra Wahana NASA Juno: Turbulensi awan badai Bintik Merah Raksasa di atmosfer gas Jovian.",
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
      image: "assets/surface-saturnus.jpg",
      imageCaption: "📸 Citra Wahana NASA Cassini: Tampilan dekat cincin es Saturnus yang tersusun dari miliaran serpihan es air.",
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
      image: "assets/planet-neptunus.jpg",
      imageCaption: "📸 Citra Wahana NASA Voyager 2: Planet Neptunus yang membutuhkan 165 tahun bumi untuk satu kali revolusi orbit.",
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

  // ── Konfigurasi Game & Penilaian ───────────────────────────
  config: {
    maxFuel: 100,
    fuelPerTravel: 8,
    fuelPerWrongAnswer: 5,
    fuelBonusCorrect: 3,
    startingFuel: 100,
    scoring: {
      planetPoints: 5,       // 8 planet x 5 = 40 poin
      quizPoints: 8,         // 5 kuis x 8 = 40 poin
      maxFuelPoints: 20,     // Sisa bahan bakar dikalikan 0.20 = 20 poin max
      pointsPerPlanet: 5,
      pointsPerQuiz: 8,
      fuelEfficiencyMax: 20
    }
  }
};
