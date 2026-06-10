# Foodstore Mobile App

React Native mobile app for Foodstore, built with Expo SDK 54.

## Tech Stack

| Kategori | Library |
|---|---|
| Framework | Expo SDK 54 + TypeScript |
| Navigation | React Navigation (Native Stack) |
| HTTP Client | Axios + JWT interceptor |
| Server State | TanStack Query (cache, refetch, mutation) |
| UI State | Zustand (auth, theme) |
| Form | React Hook Form + Zod |
| Storage | expo-secure-store (native) / localStorage (web) |
| Search | use-debounce |

## Backend

Base URL: `https://foodstore-server-nu.vercel.app`

## Features

### ✅ Done

**Auth**

| Login | Register |
|-------|----------|
| <img src="assets/screenshots/mobile - login.png" width="200" /> | <img src="assets/screenshots/mobile - register.png" width="200" /> |

- [x] Login (email + password)
- [x] Register
- [x] Auto login — cek token saat buka app, redirect otomatis
- [x] Logout
- [x] Guest mode — beranda bisa diakses tanpa login
- [x] Biometric auth (`expo-local-authentication`) — fingerprint / Face ID setiap buka app & kembali dari background (`AppState`); cache tetap ada, hanya auth gate yang di-reset

**Home**

| Login | Guest |
|-------|-------|
| <img src="assets/screenshots/mobile - user beranda.png" width="200" /> | <img src="assets/screenshots/mobile - home.png" width="200" /> |

- [x] Product list (grid 2 kolom)
- [x] Search produk dengan debounce (500ms)
- [x] Filter kategori
- [x] Filter tags (multi-select)
- [x] Banner carousel
- [x] Header dengan cart badge + user avatar
- [x] Badge "Sisa n" di product card saat stok ≤ 5
- [x] Disable tombol "+" di product card kalau qty di cart sudah mencapai stok

**Cart**

<img src="assets/screenshots/mobile - cart.png" width="200" />

- [x] Tambah ke cart (guest → redirect login)
- [x] Cart badge count di header (realtime)
- [x] Cart icon loading saat mutasi berjalan
- [x] Empty state "Keranjang kosong" saat cart tidak ada isi
- [x] Checkbox per item + Pilih Semua
- [x] Hapus item yang di-check via tombol "Hapus"
- [x] Ikon trash per item — hapus satu item langsung
- [x] Update qty; qty → 0 otomatis hapus item dari cart
- [x] Subtotal per item tampil di kanan setiap card
- [x] Card items disabled (opacity 0.6) saat mutasi berjalan
- [x] Ringkasan belanja (subtotal + ongkir Rp 20.000 + total) — hanya tampil jika ada item yang di-check
- [x] Tombol "Beli (n)" — hanya muncul jika ada item yang di-check, meneruskan hanya item `checked = true` ke Checkout

**Checkout**

- [x] 3-step checkout flow dengan stepper UI
- [x] Step 1: Review item pesanan — hanya item yang `checked = true` dari cart
- [x] Step 2: Pilih alamat pengiriman dari daftar saved addresses (dengan radio select)
- [x] Step 3: Konfirmasi — ringkasan alamat, item, subtotal, ongkir (Rp 20.000), dan total pembayaran
- [x] Buat order via `POST /api/orders` → langsung navigate ke InvoiceScreen

**Invoice & Pembayaran**

- [x] Invoice card — nomor invoice, status badge (Lunas), stepper 4 tahap (Pembayaran → Diproses → Dikirim → Diterima)
- [x] Status banner per kondisi: Menunggu Pembayaran, Dikonfirmasi, Diproses, Dalam Pengiriman, Diterima, Gagal
- [x] Tombol "Bayar Sekarang" saat status `waiting_payment`
- [x] Midtrans Snap popup via WebView (inject Snap.js sandbox) — dipicu dari InvoiceScreen
- [x] Callback Snap.js via `postMessage`: `success`, `pending`, `error`, `close`
- [x] Verifikasi pembayaran via `GET /api/payments/verify/:order_id` setelah sukses
- [x] Tombol "Konfirmasi Diterima" saat status `in_delivery`
- [x] Tombol "Beri Rating" per item saat status `delivered`
- [x] Info pengiriman (alamat), info pembayaran (nama + email user), item pesanan, ringkasan harga

**Realtime & Notifikasi**

- [x] FCM push notification — status order update dikirim dari backend via `firebase-admin`, diterima di foreground (`setNotificationHandler`), background, dan terminated (`getLastNotificationResponseAsync`); tap notif langsung navigate ke InvoiceScreen

**Profile**

<img src="assets/screenshots/mobile - profile.png" width="200" />

- [x] Biodata diri (nama, email, role, customer ID, login via Google)
- [x] Ganti tema warna (Green Fern, Green Jade, Merah, Biru, Orange)

**Riwayat Belanja**

- [x] Tab "Riwayat Belanja" di Profile — daftar semua order dari `GET /api/orders`
- [x] Setiap row: ikon, "Order #n", tanggal, total harga, badge status (Menunggu/Diproses/Dikirim/Lunas/Gagal)
- [x] Tap order → navigate ke InvoiceScreen
- [x] Banner "n pesanan menunggu pembayaran" — collapsible, expand tampilkan list order waiting
- [x] Tap order di banner → langsung ke InvoiceScreen order tersebut

**Tema**

<img src="assets/screenshots/mobile - tema.png" width="200" />

- [x] Multi-tema — Green Fern, Green Jade, Merah, Biru, Orange
- [x] Token warna terpusat di `src/constants/themes.ts`
- [x] Ganti tema dari Profile → tab Keamanan

**Wishlist**

- [x] Toggle wishlist dari product card (ikon hati merah/abu-abu)
- [x] Wishlist disinkron via `GET /api/wishlists` — heart langsung update saat buka HomeScreen
- [x] Tambah ke wishlist via `POST /api/wishlists { product_id }`
- [x] Hapus dari wishlist via `DELETE /api/wishlists/:product_id`
- [x] Tab "Favorit" di ProfileScreen — daftar produk favorit dengan thumbnail, nama, harga
- [x] Hapus dari favorit langsung via tombol hati di tab Favorit

**Product Detail**

- [x] Tap product card di Home → buka detail screen
- [x] Tap item di tab Favorit → buka detail screen
- [x] Gambar produk full-width, nama, harga, kategori, tags, deskripsi, stok
- [x] Tombol "Tambah ke Keranjang" dengan loading state & disable saat stok habis / penuh
- [x] Toggle wishlist (hati) di header detail screen dengan loading state
- [x] Fetch via `GET /api/products?q=name` — filter by `_id` (tidak ada endpoint detail tersendiri)

**Review Produk**

- [x] Tombol "Beri Rating" per item di InvoiceScreen saat status `delivered`
- [x] Bottom sheet modal: star rating 1–5 (tap), kolom komentar, label rating (Sangat Buruk–Sangat Bagus)
- [x] Submit via `POST /api/reviews { product_id, order_id, rating, comment }`
- [x] Error inline di modal (kotak merah) — termasuk pesan duplikat dari backend
- [x] Tombol "Beri Rating" hilang setelah berhasil submit atau terdeteksi sudah pernah diulas
- [x] List review per produk tampil di bawah setiap item (dari semua user) via `GET /api/reviews?product_id=X`
- [x] Nama reviewer + bintang + komentar ditampilkan per review

**Alamat Pengiriman**

- [x] CRUD alamat di tab "Alamat Pengiriman" ProfileScreen
- [x] List alamat tersimpan (nama, wilayah, detail) dengan tombol edit & hapus
- [x] Form tambah / edit alamat via bottom sheet modal
- [x] Cascading region picker: Provinsi → Kabupaten → Kecamatan → Kelurahan (dengan search)
- [x] Data wilayah dari `GET /api/wilayah/provinsi|kabupaten|kecamatan|desa`
- [x] Konfirmasi hapus alamat via Alert

**Profile & Media**

- [x] Image picker untuk avatar profile — `expo-image-picker`, kamera + galeri, upload ke `PUT /api/users/avatar` (Cloudinary), foto langsung update di hero section


**Product & UX**

- [x] `useInfiniteQuery` + infinite scroll — `GET /api/products` (auto-load via `onEndReached` di FlatList) + `GET /api/orders` (auto-load via `onScroll` di ScrollView); `limit:5`, `skip` per page, `getNextPageParam` dari `count`
- [x] Skeleton loading — shimmer placeholder (`Animated` + `expo-linear-gradient`) di HomeScreen (product grid 6 card), ProductDetailScreen (hero + konten), ProfileScreen Riwayat tab (4 row)
- [x] Average rating di ProductCard (⭐ 4.2 · count) dan ProductDetailScreen (5 bintang + avg + jumlah ulasan) dari field `avg_rating` + `review_count`
- [x] Search history — simpan pencarian terakhir ke `AsyncStorage` (maks 8), tampil saat search fokus + kosong; tap untuk isi ulang, hapus per item, hapus semua

**Infrastruktur**

- [x] Offline banner (`@react-native-community/netinfo`) — deteksi koneksi hilang, tampil banner, retry otomatis saat online kembali
- [x] Deep linking — buka InvoiceScreen / ProductDetailScreen langsung dari notifikasi atau external link

### 🚧 Coming Soon

**Auth**

- [ ] Google Sign-In native (`@react-native-google-signin/google-signin`) — OAuth native flow, butuh endpoint `POST /auth/google/mobile` di backend

**Tampilan**

- [ ] Dark mode — theme system sudah ada, tambah variant `dark` per token warna
