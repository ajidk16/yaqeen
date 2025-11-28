# Blueprint Produk: HabbiTrax (Habit Tracker Syariah)

## 1. Masalah yang Diselesaikan (The Problem)
- **Disconnect Spiritual & Produktivitas**: Aplikasi produktivitas mainstream sering memisahkan kehidupan duniawi dan ukhrawi.
- **Kurangnya Motivasi Religius**: Tidak ada pengingat berbasis pahala/sunnah saat membangun kebiasaan baik.
- **Kesulitan Muhasabah**: Tracking manual ibadah (qadha sholat, puasa sunnah) sering terlewat atau berantakan tanpa alat bantu yang spesifik.

## 2. Target User
- **Muslim Urban (Gen Z & Millennial)**: Tech-savvy, sibuk, ingin menyeimbangkan produktivitas kerja dengan kewajiban agama.
- **Penuntut Ilmu (Santri/Mahasiswa)**: Membutuhkan alat untuk tracking hafalan Quran/Hadits dan rutinitas belajar.
- **Komunitas Hijrah**: Membutuhkan tools pendamping untuk menjaga keistiqomahan dalam proses perbaikan diri.

## 3. Fitur Inti (Core Features)
- **Ibadah Tracker**: Tracking Sholat 5 waktu (Jamaah/Munfarid), Sholat Sunnah (Rawatib, Dhuha, Tahajud).
- **Custom Habit Builder**: Membuat habit bebas (Olahraga, Baca Buku, Minum Air) dengan label kategori (Wajib, Sunnah, Mubah).
- **Quran Journal**: Tracking target tilawah (halaman/juz) & progress hafalan.
- **Prayer Times Integration**: Jadwal sholat otomatis sesuai lokasi dengan notifikasi adzan.
- **Mood & Syukur Log**: Jurnal harian singkat untuk mencatat mood dan hal-hal yang disyukuri (Gratitude Journal).

## 4. Fitur Killer (The USP)
🚀 **"AI Muhasabah Coach" (Ustaz AI)**
Berbeda dengan tracker biasa yang hanya menampilkan grafik, fitur ini bertindak sebagai partner spiritual cerdas.
- **Personalized Feedback**: Memberikan evaluasi harian berdasarkan data tracking. Contoh: *"MasyaAllah, sholat Subuhmu terjaga 7 hari berturut-turut! Yuk, tambah sedikit dengan Dzikir Pagi hari ini."*
- **Contextual Wisdom**: Menyajikan ayat Al-Quran atau Hadits yang relevan dengan struggle atau pencapaian user saat itu.
- **Reminders with Heart**: Notifikasi yang tidak robotik, melainkan menyentuh hati (e.g., *"Lelah itu wajar, tapi jangan lupa istirahat dengan sujud."*).

## 5. Arsitektur High-Level
- **Frontend**: SvelteKit (Svelte 5 Runes) + Tailwind CSS v4 + daisyUI v5.
- **Backend**: SvelteKit Server Actions (API Routes) untuk logika bisnis.
- **Database**: PostgreSQL (via Neon Serverless) untuk data relasional yang scalable.
- **ORM**: Drizzle ORM untuk type-safe database interactions.
- **Auth**: Better-Auth (Support Google & Email Magic Link).
- **AI Engine**: OpenAI API (GPT-4o-mini) atau Anthropic Claude via Vercel AI SDK.
- **Hosting**: Vercel (Optimized for SvelteKit & Edge Functions).

## 6. Skema Database Awal (Drizzle Concept)

```typescript
// users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  preferences: jsonb('preferences'), // mazhab, calculation method, location
  createdAt: timestamp('created_at').defaultNow()
});

// habits table
export const habits = pgTable('habits', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  title: text('title').notNull(),
  type: text('type').notNull(), // 'ibadah', 'adat', 'health'
  category: text('category'), // 'wajib', 'sunnah'
  frequency: jsonb('frequency'), // daily, weekly, specific days
  targetValue: integer('target_value'), // e.g., 10 (pages), 33 (dzikir)
  createdAt: timestamp('created_at').defaultNow()
});

// logs table (daily entries)
export const logs = pgTable('logs', {
  id: text('id').primaryKey(),
  habitId: text('habit_id').references(() => habits.id),
  date: date('date').notNull(),
  status: text('status'), // 'completed', 'skipped', 'partial'
  value: integer('value'), // actual value achieved
  notes: text('notes')
});

// reflections table (muhasabah)
export const reflections = pgTable('reflections', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  date: date('date').notNull(),
  mood: text('mood'),
  content: text('content'), // user journal
  aiFeedback: text('ai_feedback'), // response from AI Coach
  createdAt: timestamp('created_at').defaultNow()
});
```

## 7. Pricing Model
- **Freemium (Basic)**:
    - Unlimited Habits tracking.
    - Akses fitur dasar Ibadah & Quran.
    - Iklan (Ad-supported, curated halal ads).
- **Premium (Infaq/Subscription - Rp 29.000/bulan)**:
    - **No Ads**: Pengalaman bebas gangguan.
    - **AI Muhasabah Coach**: Unlimited chat & daily insights.
    - **Advanced Analytics**: Tren ibadah bulanan, korelasi mood vs ibadah.
    - **Cloud Sync**: Backup & sinkronisasi antar perangkat.
    - **Social Impact**: 10% dari biaya langganan disalurkan otomatis untuk sedekah/wakaf produktif.

## 8. Risiko & Mitigasi
- **Risiko**: **Riya' (Pamer)** - User merasa mencatat ibadah bisa mengurangi keikhlasan.
    - *Mitigasi*: Edukasi di onboarding bahwa aplikasi adalah alat *muhasabah* (introspeksi) pribadi. Default setting adalah "Private". Tidak ada fitur "Share to Social Media" untuk ibadah wajib secara default.
- **Risiko**: **Data Privacy** - Kebocoran data sensitif tentang aktivitas personal.
    - *Mitigasi*: Enkripsi data sensitif. Kebijakan privasi yang transparan dan sesuai syariah (amanah).
- **Risiko**: **Akurasi Waktu Sholat** - Perbedaan metode hisab bisa membingungkan.
    - *Mitigasi*: Menggunakan library terpercaya (Adhan.js) dan memberikan opsi manual adjustment (+/- menit) serta pemilihan metode perhitungan (Kemenag, MWL, dll).

## 9. Roadmap 30 Hari (MVP)

### Minggu 1: Foundation & Auth
- Setup project SvelteKit + Tailwind + DaisyUI.
- Setup Database Neon + Drizzle ORM.
- Implementasi Authentication (Better-Auth).
- Desain Database Schema (Users, Habits).
- Basic Layout (Mobile-first navigation).

### Minggu 2: Core Tracking Features
- CRUD Habits (Create, Read, Update, Delete).
- Implementasi Logic Tracking (Checklist harian).
- Integrasi Library Waktu Sholat (Adhan.js).
- Halaman "Hari Ini" (Dashboard utama).

### Minggu 3: Dashboard & Gamification
- Visualisasi Progress (Calendar view, Streak counter).
- Implementasi Gamification ringan (Badges: "Pejuang Subuh", "Istiqomah 7 Hari").
- Fitur Jurnal/Refleksi Harian.

### Minggu 4: AI Integration & Polish
- Integrasi OpenAI/Claude untuk "AI Muhasabah Coach".
- Prompt Engineering untuk persona "Ustaz AI".
- UI Polishing (Dark mode, Animations).
- Testing & Bug Fixing.
- Deploy ke Vercel.
