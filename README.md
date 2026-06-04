# Foodstore Mobile App

React Native mobile app for Foodstore, built with Expo SDK 54.

---

## Tech Stack

| Kategori | Library |
|---|---|
| Framework | Expo SDK 54 + TypeScript |
| Navigation | React Navigation (Native Stack) |
| HTTP Client | Axios + JWT interceptor |
| State Management | Zustand (auth), TanStack Query (server state) |
| Form | React Hook Form + Zod |
| Storage | expo-secure-store (native) / localStorage (web) |

---

## Backend

Base URL: `https://foodstore-server-nu.vercel.app`

---

## Features

### ✅ Done

- Login (email + password)
- Register (nama, email, password)
- Auto login — cek token saat buka app, redirect otomatis
- Logout

### 🚧 Coming Soon

- Google Sign-In native
- Home — product list, search, filter kategori & tag
- Product detail
- Keranjang (cart)
- Checkout — pilih alamat + ongkir
- Alamat pengiriman (data wilayah Indonesia)
- Riwayat order
- Detail order + tracking status realtime (Pusher)
- Pembayaran (Midtrans Snap)
- Profil
- Wishlist
- Review produk
