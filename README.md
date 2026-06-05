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
- [x] Auto-refetch status setiap 10 detik (sementara sebelum Pusher)

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

### 🚧 Coming Soon

- [ ] Google Sign-In native (`@react-native-google-signin/google-signin`)
  - Butuh endpoint baru di backend: `POST /auth/google/mobile`
- [ ] Alamat pengiriman (form tambah alamat + data wilayah Indonesia)
- [ ] Tracking status order realtime — ganti polling 10s dengan Pusher (`private-order-<id>`, event `order:status_updated`)
- [ ] Review produk — aksi tombol "Beri Rating" (form rating + komentar per item)
- [ ] Wishlist
- [ ] Notifikasi realtime (Pusher)
- [ ] Product detail screen
