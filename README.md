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

**Cart**

<img src="assets/screenshots/mobile - cart.png" width="200" />

- [x] Tambah ke cart (guest → redirect login)
- [x] Cart badge count di header (realtime)
- [x] Loading spinner di cart icon saat PUT/GET
- [x] CartScreen — checkbox per item, Pilih Semua, Hapus
- [x] Update qty, hapus item
- [x] Ringkasan belanja (subtotal hanya item yang checked + ongkir)
- [x] Disable tombol "+" kalau qty sudah mencapai stok
- [x] Cart icon loading saat mutasi berjalan

**Profile**

<img src="assets/screenshots/mobile - profile.png" width="200" />

- [x] Biodata diri (nama, email, role, customer ID, login via Google)
- [x] Ganti tema warna (Green Fern, Green Jade, Merah, Biru, Orange)

**Tema**

<img src="assets/screenshots/mobile - tema.png" width="200" />

- [x] Multi-tema — Green Fern, Green Jade, Merah, Biru, Orange
- [x] Token warna terpusat di `src/constants/themes.ts`
- [x] Ganti tema dari Profile → tab Keamanan

### 🚧 Coming Soon

- [ ] Google Sign-In native (`@react-native-google-signin/google-signin`)
  - Butuh endpoint baru di backend: `POST /auth/google/mobile`
- [ ] Checkout — pilih alamat pengiriman, konfirmasi order
- [ ] Alamat pengiriman (form + data wilayah Indonesia)
- [ ] Order history + detail order
- [ ] Tracking status order realtime (Pusher)
- [ ] Pembayaran — Midtrans Snap
- [ ] Wishlist
- [ ] Review produk
- [ ] Notifikasi realtime (Pusher)
- [ ] Product detail screen
