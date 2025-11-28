# UI Design System: HabbiTrax

## 1. Design Philosophy & Vibe
*   **Keywords**: Fresh, Energetic, Clean, "Syariah-Modern".
*   **Concept**: "Spiritual Clarity". Menggabungkan ketenangan spiritual dengan energi produktivitas modern.
*   **Visual Language**: Rounded corners, soft shadows, ample whitespace, playful but readable typography.

## 2. Design Tokens (Tailwind Config)

### Color Palette (Youthful & Fresh)
Kita menggunakan base `slate` untuk netral, dan warna-warna "sherbet" untuk aksen kategori.

```javascript
// tailwind.config.js extension
colors: {
  // Brand Colors
  primary: {
    DEFAULT: '#8B5CF6', // Violet-500 (Spiritual & Creative)
    soft: '#DDD6FE',    // Violet-200
    content: '#FFFFFF'
  },
  secondary: {
    DEFAULT: '#10B981', // Emerald-500 (Islamic/Nature association, fresh)
    soft: '#D1FAE5',    // Emerald-100
  },
  
  // Functional/Category Colors
  ibadah: {
    DEFAULT: '#14B8A6', // Teal-500 (Calm)
    bg: '#F0FDFA',      // Teal-50
  },
  health: {
    DEFAULT: '#F43F5E', // Rose-500 (Energetic)
    bg: '#FFF1F2',      // Rose-50
  },
  learning: {
    DEFAULT: '#F59E0B', // Amber-500 (Bright)
    bg: '#FFFBEB',      // Amber-50
  },
  
  // Neutrals (Text & Backgrounds)
  surface: {
    100: '#FFFFFF',
    200: '#F8FAFC', // Slate-50
    300: '#F1F5F9', // Slate-100
  },
  content: {
    primary: '#1E293B',   // Slate-800
    secondary: '#64748B', // Slate-500
    tertiary: '#94A3B8',  // Slate-400
  }
}
```

### Typography
*   **Headings**: `font-display` (e.g., 'Outfit' or 'Plus Jakarta Sans') - Bold, tight tracking.
*   **Body**: `font-body` (e.g., 'Inter' or 'DM Sans') - High legibility.

### Border Radius
*   `rounded-2xl` untuk Cards utama.
*   `rounded-xl` untuk Buttons dan Input fields.
*   `rounded-full` untuk Badges dan Status indicators.

---

## 3. Layout Structure (Mobile-First)

### App Shell (`src/routes/+layout.svelte`)
Menggunakan Bottom Navigation Bar untuk mobile, yang berubah menjadi Sidebar minimalis di desktop.

```html
<div class="min-h-screen bg-surface-200 text-content-primary font-body pb-20 md:pb-0 md:pl-20">
  <!-- Main Content Area -->
  <main class="max-w-md mx-auto md:max-w-4xl px-4 py-6">
    <slot />
  </main>

  <!-- Mobile Bottom Nav -->
  <nav class="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 px-6 py-3 flex justify-between items-center md:hidden z-50">
    <NavItem icon="home" label="Home" active />
    <NavItem icon="calendar" label="Journal" />
    <!-- Floating Action Button (FAB) for Add Habit -->
    <button class="bg-primary text-white p-4 rounded-full shadow-lg shadow-primary/30 -mt-8 hover:scale-105 transition-transform">
      <IconPlus size={24} />
    </button>
    <NavItem icon="bar-chart-2" label="Stats" />
    <NavItem icon="user" label="Profile" />
  </nav>
</div>
```

---

## 4. High-Level Component Designs

### A. Dashboard Header (Greeting & Summary)
Menyapa user dengan konteks waktu dan motivasi singkat.

```html
<header class="mb-8">
  <div class="flex justify-between items-start">
    <div>
      <h1 class="text-2xl font-bold text-slate-800">
        Assalamualaikum, <span class="text-primary">Fatih!</span> 👋
      </h1>
      <p class="text-slate-500 text-sm mt-1">
        "Mulai harimu dengan Bismillah."
      </p>
    </div>
    <div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
      <span class="text-orange-500">🔥</span>
      <span class="font-bold text-slate-700">12</span>
      <span class="text-xs text-slate-400">Day Streak</span>
    </div>
  </div>

  <!-- Date Scroller (Simplified) -->
  <div class="flex justify-between mt-6 overflow-x-auto pb-2 gap-2 no-scrollbar">
    <!-- Active Day -->
    <div class="flex flex-col items-center bg-primary text-white p-3 rounded-2xl min-w-[60px] shadow-lg shadow-primary/20">
      <span class="text-xs font-medium opacity-80">SEN</span>
      <span class="text-xl font-bold">28</span>
    </div>
    <!-- Inactive Day -->
    <div class="flex flex-col items-center bg-white text-slate-400 p-3 rounded-2xl min-w-[60px] border border-slate-100">
      <span class="text-xs font-medium">SEL</span>
      <span class="text-xl font-bold">29</span>
    </div>
    <!-- ... more days -->
  </div>
</header>
```

### B. Habit Card (The Core)
Desain card yang *satisfying* untuk di-interaksi. Menggunakan checkbox besar atau swipe action.

**Variant 1: Ibadah (Wajib/Sunnah)**
```html
<div class="group relative bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all mb-3 flex items-center justify-between overflow-hidden">
  <!-- Left: Icon & Info -->
  <div class="flex items-center gap-4 z-10">
    <div class="w-12 h-12 rounded-xl bg-ibadah-bg text-ibadah flex items-center justify-center">
      <!-- Icon: Prayer Rug / Moon -->
      <IconMoon size={24} />
    </div>
    <div>
      <h3 class="font-bold text-slate-800 group-hover:text-ibadah transition-colors">Sholat Subuh</h3>
      <div class="flex items-center gap-2 text-xs text-slate-500">
        <span class="bg-slate-100 px-2 py-0.5 rounded-md">Wajib</span>
        <span>04:15 WIB</span>
      </div>
    </div>
  </div>

  <!-- Right: Action (Checkbox) -->
  <button class="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center text-transparent hover:border-ibadah hover:text-ibadah transition-all focus:outline-none focus:ring-2 focus:ring-ibadah/20 active:scale-95">
    <IconCheck size={18} strokeWidth={3} />
  </button>
  
  <!-- Progress Fill Animation (Optional: background fills up) -->
  <div class="absolute left-0 top-0 bottom-0 bg-ibadah-bg w-0 group-hover:w-full transition-all duration-500 opacity-30 -z-0"></div>
</div>
```

**Variant 2: Custom Habit (with Counter)**
```html
<div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-3">
  <div class="flex justify-between items-center mb-3">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center">
        <IconBook size={20} />
      </div>
      <h3 class="font-bold text-slate-800">Baca Quran</h3>
    </div>
    <span class="text-xs font-bold text-sky-500 bg-sky-50 px-2 py-1 rounded-lg">1/5 Hal</span>
  </div>
  
  <!-- Progress Bar & Controls -->
  <div class="flex items-center gap-3">
    <button class="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center">
      <IconMinus size={16} />
    </button>
    <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
      <div class="h-full bg-sky-500 w-[20%] rounded-full"></div>
    </div>
    <button class="w-8 h-8 rounded-lg bg-sky-500 text-white shadow-md shadow-sky-500/20 hover:bg-sky-600 flex items-center justify-center">
      <IconPlus size={16} />
    </button>
  </div>
</div>
```

### C. AI Muhasabah Coach (Widget)
Card khusus yang muncul di dashboard untuk memberikan insight.

```html
<div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden">
  <!-- Decorative Shapes -->
  <div class="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
  
  <div class="relative z-10">
    <div class="flex items-center gap-2 mb-3 opacity-90">
      <IconSparkles size={16} />
      <span class="text-xs font-bold uppercase tracking-wider">Ustaz AI Insight</span>
    </div>
    <p class="text-lg font-medium leading-relaxed mb-4">
      "MasyaAllah, sholat Subuhmu terjaga 7 hari! Yuk, sempurnakan dengan Dzikir Pagi hari ini."
    </p>
    <button class="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
      Lihat Detail Muhasabah
    </button>
  </div>
</div>
```

### D. Add Habit Modal
Simple, clean overlay.

```html
<div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
  <div class="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-slate-800">Tambah Kebiasaan Baru</h2>
      <button class="text-slate-400 hover:text-slate-600"><IconX /></button>
    </div>

    <!-- Category Selection -->
    <div class="grid grid-cols-3 gap-3 mb-6">
      <button class="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-ibadah bg-ibadah-bg text-ibadah">
        <IconMoon />
        <span class="text-xs font-bold">Ibadah</span>
      </button>
      <button class="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50">
        <IconActivity />
        <span class="text-xs font-medium">Health</span>
      </button>
      <button class="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50">
        <IconBook />
        <span class="text-xs font-medium">Ilmu</span>
      </button>
    </div>

    <!-- Form Fields -->
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Nama Kebiasaan</label>
        <input type="text" placeholder="Contoh: Baca Al-Kahfi" class="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/50" />
      </div>
      <!-- ... Frequency, Target, etc. -->
    </div>

    <button class="w-full bg-primary text-white font-bold py-4 rounded-xl mt-8 shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all">
      Simpan Kebiasaan
    </button>
  </div>
</div>
```

---

## 5. UX Optimization Tips (Habit Tracker Specific)

1.  **The "Don't Break the Chain" Effect**:
    *   Tampilkan *Streak Flame* di tempat yang sangat terlihat (Header).
    *   Berikan animasi "celebration" (confetti ringan) saat user menyelesaikan semua habit hari itu.

2.  **Frictionless Logging**:
    *   Mark as done harus **1-tap**. Jangan paksa user masuk ke detail page cuma buat centang habit.
    *   Gunakan *Swipe Gestures* di mobile: Swipe kanan untuk "Done", swipe kiri untuk "Skip/Reason".

3.  **Forgiving System (Syariah Compliant)**:
    *   Jika user lupa logging, izinkan "Late Log" tapi tandai beda warna.
    *   Untuk wanita yang sedang haid (period mode), otomatis pause streak sholat/puasa tanpa memutusnya (Fitur "Udzur Syar'i").

4.  **Contextual Empty States**:
    *   Jangan biarkan dashboard kosong saat user baru daftar. Berikan "Starter Pack" habits (e.g., Sholat 5 Waktu, Minum Air).

5.  **Micro-Copy with Empathy**:
    *   Gunakan bahasa yang menyemangati, bukan menghakimi.
    *   *Bad*: "Kamu gagal sholat subuh."
    *   *Good*: "Subuh terlewat? Yuk qadha segera dan niatkan lebih baik besok!"
