# Foodstore Mobile App

A full-featured food e-commerce mobile application built with React Native (Expo SDK 54) and TypeScript. Users can browse food products, search with history, add to cart, checkout with saved delivery address, pay via Midtrans Snap, track order status, confirm delivery, review purchased items, and save favourites to wishlist. Authentication supports email/password and Google OAuth, with biometric lock (Face ID / fingerprint) on every app open. Receives real-time order status updates via FCM push notifications. Built on top of a REST API backend (Node.js + Express + MongoDB).

## Project Structure

```
├── App.tsx                        # Entry point, BiometricGate, NavigationContainer
├── app.json                       # Expo config (plugins, permissions)
└── src/
    ├── components/
    │   ├── ui/
    │   │   ├── Header.tsx         # Navbar (avatar, cart badge)
    │   │   └── Banner.tsx         # Promo banner carousel
    │   ├── product/
    │   │   └── ProductCard.tsx    # Grid card with wishlist toggle & rating
    │   ├── order/
    │   │   └── ReviewModal.tsx    # Bottom sheet for rating & comment
    │   ├── address/
    │   │   ├── AddressFormModal.tsx
    │   │   └── RegionPicker.tsx   # Cascading region picker
    │   ├── skeleton/
    │   │   ├── Skeleton.tsx       # Shimmer base (Animated + LinearGradient)
    │   │   ├── ProductCardSkeleton.tsx
    │   │   ├── ProductDetailSkeleton.tsx
    │   │   └── OrderRowSkeleton.tsx
    │   └── OfflineBanner.tsx
    ├── screens/
    │   ├── auth/
    │   │   ├── LoginScreen.tsx
    │   │   ├── RegisterScreen.tsx
    │   │   ├── GoogleAuthScreen.tsx
    │   │   └── LockScreen.tsx     # Biometric gate UI
    │   └── main/
    │       ├── HomeScreen.tsx     # Product grid, search, filter, infinite scroll
    │       ├── ProductDetailScreen.tsx
    │       ├── CartScreen.tsx
    │       ├── CheckoutScreen.tsx # 3-step stepper
    │       ├── InvoiceScreen.tsx  # Order status, Midtrans WebView, rating
    │       └── ProfileScreen.tsx  # Profile, order history, wishlist, address, theme
    ├── hooks/
    │   ├── useProducts.ts         # useInfiniteProducts
    │   ├── useOrders.ts           # useInfiniteOrders
    │   ├── useCart.ts
    │   ├── useWishlist.ts
    │   ├── useReviews.ts
    │   ├── useDeliveryAddresses.ts
    │   ├── useWilayah.ts
    │   ├── useUpdateAvatar.ts
    │   ├── usePushNotification.ts # FCM + notification listener
    │   ├── useBiometricAuth.ts    # AppState + LocalAuthentication
    │   ├── useSearchHistory.ts    # AsyncStorage persist
    │   ├── useTheme.ts
    │   ├── useGoogleAuth.ts
    │   └── useOfflineBanner.ts
    ├── store/
    │   ├── authStore.ts           # Zustand: user, token, loadAuth
    │   └── themeStore.ts          # Zustand: active theme
    ├── lib/
    │   ├── axios.ts               # Axios instance + JWT interceptor
    │   ├── secureStorage.ts       # expo-secure-store wrapper
    │   ├── snapHtml.ts            # Midtrans Snap HTML injector
    │   └── utils.ts
    ├── constants/
    │   ├── themes.ts              # Multi-theme color tokens
    │   └── colors.ts
    └── types/
        ├── navigation.ts
        ├── product.ts
        ├── cart.ts
        ├── order.ts
        ├── address.ts
        ├── review.ts
        └── wishlist.ts
```

## Tech Stack

| Category | Library |
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

### 🚧 Coming Soon

**Auth**

- [ ] OTP verification screen — when login returns "email not verified" error, show a 6-digit PIN input screen sent to email; endpoints: `POST /auth/mobile/send-otp` + `POST /auth/mobile/verify-otp` (separate from web flow which uses a link click)
- [ ] Native Google Sign-In (`@react-native-google-signin/google-signin`) — native OAuth flow, requires new backend endpoint `POST /auth/google/mobile`

**UI**

- [ ] Dark mode — theme system already in place, add `dark` variant per color token

## Features

### ✅ Done

**Auth**

| Login | Register |
|-------|----------|
| <img src="assets/screenshots/mobile - login.png" width="200" /> | <img src="assets/screenshots/mobile - register.png" width="200" /> |

- [x] Login (email + password)
- [x] Register
- [x] Auto login — check token on app start, redirect automatically
- [x] Logout
- [x] Guest mode — home screen accessible without login
- [x] Biometric auth (`expo-local-authentication`) — fingerprint / Face ID on every app open and return from background (`AppState`); cache stays intact, only auth gate resets

**Login Flow**

```
User enters email + password
          |
          ▼
    POST /auth/login
          |
          ├─→ Email not found             → error "Email or password incorrect"
          |
          ├─→ Wrong password              → error "Email or password incorrect"
          |
          ├─→ Account not yet verified    → verification email and OTP (coming soon)
          |
          └─→ Valid & verified
                    |
                    ▼
              Generate JWT token
              Save token to DB (tokens[] array)
              Return { user, token }
                    |
                    ▼
              Save token to SecureStore
              Set user in Zustand store
              Redirect to Home
```

**Register Flow**

```
User fills name + email + password
          |
          ▼
   POST /auth/register
          |
          ├─→ Email already taken         → error "Email already exists"
          |
          └─→ Success
                    |
                    ▼
              Create new user in DB
              Send verification email (Nodemailer)
              Return { message: "registered" }
                    |
                    ▼
              Alert "Account created. Check your email to verify."
                    |
                    ▼ (tap OK)
              Navigate to Login
```

**Home**

| Logged In | Guest |
|-------|-------|
| <img src="assets/screenshots/mobile - user beranda.png" width="200" /> | <img src="assets/screenshots/mobile - home.png" width="200" /> |

- [x] Product list (2-column grid)
- [x] Product search with debounce (500ms)
- [x] Category filter
- [x] Tag filter (multi-select)
- [x] Banner carousel
- [x] Header with cart badge + user avatar
- [x] "Stock: n left" badge on product card when stock ≤ 5
- [x] Disable "+" button on product card when cart qty reaches stock limit

```
Open HomeScreen
          |
          ▼
  GET /api/products (limit: 5, skip: 0)   ← useInfiniteProducts
  GET /api/categories                      ← useCategories
  GET /api/tags                            ← useTags
  GET /api/wishlists                       ← useWishlist (skip if guest)
          |
          ▼
  isLoading → show skeleton (3 rows × 2 cards)
          |
          ▼
  Show 2-column product grid + banner carousel
          |
          ├─→ Search (debounce 500ms)
          │         |
          │         ├─→ focused + empty + has history → show Search History panel
          │         │         |
          │         │         └─→ tap item → fill search + dismiss keyboard
          │         |
          │         └─→ type → GET /api/products?q=... (auto refetch)
          |
          ├─→ Category filter (tap chip)
          │         └─→ GET /api/products?category=...
          |
          ├─→ Tag filter (multi-select chip)
          │         └─→ GET /api/products?tags=...
          |
          ├─→ Scroll to bottom (onEndReached threshold 0.3)
          │         └─→ hasNextPage → GET /api/products?skip=5 (infinite scroll)
          |
          ├─→ Tap product card → navigate ProductDetail
          |
          ├─→ Tap heart (wishlist)
          │         ├─→ Guest → (no action, heart not shown)
          │         ├─→ Already wishlisted → DELETE /api/wishlists/:product_id
          │         └─→ Not wishlisted → POST /api/wishlists { product_id }
          |
          ├─→ Tap cart icon
          │         ├─→ Logged in → navigate Cart
          │         └─→ Guest → navigate Login
          |
          └─→ Tap avatar / profile icon → navigate Profile
```

**Cart**

<img src="assets/screenshots/mobile - cart.png" width="200" />

- [x] Add to cart (guest → redirect to login)
- [x] Cart badge count in header (realtime)
- [x] Cart icon loading while mutation is in progress
- [x] Empty state when cart has no items
- [x] Checkbox per item + Select All
- [x] Delete checked items via "Delete" button
- [x] Trash icon per item — remove single item directly
- [x] Update qty; qty → 0 automatically removes item from cart
- [x] Subtotal per item shown on the right of each card
- [x] Card items disabled (opacity 0.6) while mutation is in progress
- [x] Order summary (subtotal + shipping Rp 20,000 + total) — only shown if any item is checked
- [x] "Buy (n)" button — only shown if items are checked, passes only `checked = true` items to Checkout

```
Open CartScreen
          |
          ▼
  GET /api/cart                            ← useCart
          |
          ▼
  isLoading → show spinner
          |
          ├─→ Cart empty → show empty state (cart icon + message)
          |
          └─→ Show item list
                    |
                    ├─→ Tap checkbox (per item)
                    │         └─→ PUT /api/cart (toggle checked)
                    |
                    ├─→ Tap "Select All"
                    │         └─→ PUT /api/cart (set all checked = true/false)
                    |
                    ├─→ Tap "Delete" (bulk)
                    │         └─→ PUT /api/cart (remove all checked items)
                    |
                    ├─→ Tap trash icon (per item)
                    │         └─→ PUT /api/cart (remove that item)
                    |
                    ├─→ Tap "−" qty
                    │         ├─→ qty > 1 → PUT /api/cart (qty - 1)
                    │         └─→ qty = 1 → PUT /api/cart (remove item)
                    |
                    ├─→ Tap "+" qty
                    │         └─→ PUT /api/cart (qty + 1)
                    |
                    └─→ Any checked items exist → show Order Summary
                                  subtotal + shipping (Rp 20,000) + total
                                        |
                                        ▼
                              Tap "Buy (n)" → navigate Checkout
                              (passes only checked = true items)
```

**Checkout**

- [x] 3-step checkout flow with stepper UI
- [x] Step 1: Review order items — only `checked = true` items from cart
- [x] Step 2: Select delivery address from saved addresses (with radio select)
- [x] Step 3: Confirmation — address summary, items, subtotal, shipping (Rp 20,000), and total payment
- [x] Create order via `POST /api/orders` → navigate directly to InvoiceScreen

```
Navigate to CheckoutScreen
(receives only checked = true items from cart)
          |
          ▼
  ┌─────────────────────────────────────────┐
  │  Stepper:  [1] ──── [2] ──── [3]       │
  └─────────────────────────────────────────┘
          |
          ▼
  STEP 1 — Review Order Items
  Show list of checked items (image, name, qty, subtotal)
          |
          ▼ (tap Next →)
  STEP 2 — Select Delivery Address
  GET /api/delivery-addresses               ← useDeliveryAddresses
          |
          ├─→ Loading → show spinner
          ├─→ Tap address card → select (radio button highlight)
          └─→ No address selected → "Next" button disabled
          |
          ▼ (tap Next → , address selected)
  STEP 3 — Confirmation
  Show: delivery address + order items + price breakdown
        subtotal + shipping (Rp 20,000) + total payment
          |
          ▼ (tap "Create Order")
  POST /api/orders { delivery_fee, delivery_address }
          |
          ├─→ Error → Alert "Failed to create order, try again"
          |
          └─→ Success
                    |
                    ▼
              Backend: decode JWT → get user email from DB
              Backend: send order confirmation email (Nodemailer)
                       → to: user email
                       → content: order summary, items, total, delivery address
                    |
                    ▼
              navigation.replace('Invoice', { orderId, fromCheckout: true })
```

**Invoice & Payment**

- [x] Invoice card — invoice number, status badge (Paid), 4-step stepper (Payment → Processing → Shipped → Received)
- [x] Status banner per condition: Waiting Payment, Confirmed, Processing, In Delivery, Received, Failed
- [x] "Pay Now" button when status is `waiting_payment`
- [x] Midtrans Snap popup via WebView (inject Snap.js sandbox) — triggered from InvoiceScreen
- [x] Snap.js callback via `postMessage`: `success`, `pending`, `error`, `close`
- [x] Payment verification via `GET /api/payments/verify/:order_id` after success
- [x] "Confirm Received" button when status is `in_delivery`
- [x] "Give Review" button per item when status is `delivered`
- [x] Delivery info (address), payment info (user name + email), order items, price summary

```
Open InvoiceScreen (orderId)
          |
          ▼
  GET /api/orders/:orderId              ← useOrder
  GET /api/reviews?order_id=...         ← useReviews (to check reviewed items)
          |
          ▼
  Show Invoice Card
  - Invoice number, "Paid" badge (if not waiting/failed)
  - 4-step progress stepper: Payment → Processing → Shipped → Received
  - Status banner with icon + message
          |
          ├─→ status: waiting_payment
          │         |
          │         ▼
          │   Tap "Pay Now"
          │         |
          │         ▼
          │   POST /api/payments/token/:orderId   → get snap_token
          │         |
          │         ▼
          │   Open Midtrans Modal (WebView + Snap.js)
          │         |
          │         ├─→ success / pending → close modal
          │         │         └─→ GET /api/payments/verify/:orderId
          │         │                   → update order status in DB
          │         │                   → refetch order (TanStack Query invalidate)
          │         ├─→ error  → close modal + Alert "Payment failed"
          │         └─→ close  → close modal (no action)
          |
          ├─→ status: payment_confirmed → banner "Payment Confirmed"
          ├─→ status: processing        → banner "Order Being Processed"
          |
          ├─→ status: in_delivery
          │         |
          │         ▼
          │   Show "Confirm Received" button
          │   Tap → Alert confirmation dialog
          │         └─→ confirm → PUT /api/orders/:orderId/confirm-delivery
          │                         → status changes to "delivered"
          |
          └─→ status: delivered
                    |
                    ▼
              Show "Give Review" button per item (if not yet reviewed)
              Tap → open ReviewModal (star rating + comment)
                    |
                    └─→ POST /api/reviews { product_id, order_id, rating, comment }
                              → button disappears for that item
                              → review list shown below item
```

**Realtime & Notifications**

- [x] FCM push notification — order status updates sent from backend via `firebase-admin`, received in foreground (`setNotificationHandler`), background, and terminated (`getLastNotificationResponseAsync`); tap notification navigates directly to InvoiceScreen

```
App launches (user logged in)
          |
          ▼
  Device.isDevice check
          |
          ├─→ simulator / not a device → skip FCM registration
          |
          └─→ real device
                    |
                    ▼
              getPermissionsAsync()
                    |
                    ├─→ already granted → proceed
                    |
                    └─→ not granted → requestPermissionsAsync()
                                  |
                                  ├─→ denied → skip registration
                                  |
                                  └─→ granted
                                            |
                                            ▼
                                    getExpoPushTokenAsync({ projectId })
                                            |
                                            ▼
                                    PUT /api/users/mobile/fcm-token
                                    { fcm_token: "<expo-push-token>" }

─────────────────────────────────────────────────────────

Backend sends order status update
          |
          ▼
  firebase-admin → FCM → device

          ┌─────────────────────────────┐
          │  App state when received    │
          └─────────────────────────────┘
                    |
          ┌─────────┼──────────────────┐
          ▼         ▼                  ▼
      Foreground  Background        Terminated
          |           |                 |
          ▼           ▼                 ▼
  setNotification  system tray     system tray
  Handler shows    notification    notification
  in-app alert
          |           |                 |
          ▼           └────────┬────────┘
  invalidateQueries            |
  ['orders', orderId]          ▼
  ['orders']           user taps notification
                               |
                               ▼
                    addNotificationResponse
                    ReceivedListener fires
                    (or useLastNotification
                     Response on cold start)
                               |
                               ▼
                    navigate('Invoice', { orderId })
                    (retries every 100ms until
                     navigationRef.isReady())
```

**Profile**

<img src="assets/screenshots/mobile - profile.png" width="200" />

- [x] Personal info (name, email, role, customer ID, Google login indicator)
- [x] Change color theme (Green Fern, Green Jade, Red, Blue, Orange)

```
Open ProfileScreen
          |
          ▼
  Show hero: avatar, name, email, Customer #n
  Horizontal tab bar: Biodata | Alamat | Riwayat | Favorit | Keamanan | Logout
          |
          ├─── Tab: Biodata Diri ────────────────────────────────────────────
          │         |
          │         ▼
          │   Show: Full Name, Email (+ verified/unverified badge),
          │         Role, Customer ID, Google login indicator
          │
          ├─── Tab: Alamat Pengiriman ───────────────────────────────────────
          │         |
          │         ▼
          │   GET /api/delivery-addresses   ← useDeliveryAddresses
          │         |
          │         ├─→ isLoading → ActivityIndicator
          │         ├─→ empty → "Belum ada alamat tersimpan"
          │         └─→ address list (nama, region, detail)
          │                   ├─→ tap pencil → AddressFormModal (edit)
          │                   │         PUT /api/delivery-addresses/:id
          │                   ├─→ tap trash → Alert confirm
          │                   │         DELETE /api/delivery-addresses/:id
          │                   └─→ tap "Tambah" → AddressFormModal (create)
          │                             POST /api/delivery-addresses
          │
          ├─── Tab: Riwayat Belanja ─────────────────────────────────────────
          │         |
          │         ▼
          │   GET /api/orders (infinite scroll)   ← useInfiniteOrders
          │         |
          │         ├─→ isLoading → OrderRowSkeleton × 4
          │         ├─→ waiting_payment orders > 0
          │         │         → yellow banner "n pesanan menunggu pembayaran"
          │         │         → tap banner → expand/collapse order list
          │         │         → tap order → navigate('Invoice', { orderId })
          │         └─→ order list (number, date, total, status badge)
          │                   → scroll near bottom → fetchNextPage
          │                   → tap row → navigate('Invoice', { orderId })
          │
          ├─── Tab: Favorit ────────────────────────────────────────────────
          │         |
          │         ▼
          │   GET /api/wishlists   ← useWishlist
          │         |
          │         ├─→ isLoading → ActivityIndicator
          │         ├─→ empty → "Belum ada produk favorit"
          │         └─→ list (thumbnail, name, price)
          │                   ├─→ tap item → navigate('ProductDetail', { productId })
          │                   └─→ tap heart → DELETE /api/wishlists/:product_id
          │
          ├─── Tab: Keamanan ───────────────────────────────────────────────
          │         |
          │         ▼
          │   Color theme picker (5 swatches)
          │   tap swatch → setTheme(name) → Zustand themeStore
          │                              → entire app re-renders with new colors
          │
          ├─── Avatar (tap) ────────────────────────────────────────────────
          │         |
          │         ├─→ has image → full-screen preview modal
          │         │         └─→ "Ganti Foto" → open picker alert
          │         └─→ no image → open picker alert
          │                   ├─→ Kamera → requestCameraPermissionsAsync
          │                   │         → launchCameraAsync (1:1, quality 0.8)
          │                   │         → PATCH /api/users/avatar (multipart)
          │                   │         → updateUser({ image_url }) in Zustand
          │                   └─→ Galeri → requestMediaLibraryPermissionsAsync
          │                             → launchImageLibraryAsync (1:1, quality 0.8)
          │                             → PATCH /api/users/avatar (multipart)
          │                             → updateUser({ image_url }) in Zustand
          │
          └─── Logout (tab bar) ───────────────────────────────────────────
                    |
                    ▼
              Alert "Yakin ingin keluar?"
                    ├─→ Batal → dismiss
                    └─→ Logout → clear Zustand + SecureStore
                              → navigation.reset → Home
```

**Order History**

- [x] "Order History" tab in Profile — list of all orders from `GET /api/orders`
- [x] Each row: icon, "Order #n", date, total price, status badge (Waiting/Processing/Shipped/Paid/Failed)
- [x] Tap order → navigate to InvoiceScreen
- [x] "n orders waiting for payment" banner — collapsible, expand shows waiting order list
- [x] Tap order in banner → navigate directly to that order's InvoiceScreen

```
Open "Riwayat Belanja" tab (Profile)
          |
          ▼
  GET /api/orders (page 1)   ← useInfiniteOrders
          |
          ├─→ isLoading → OrderRowSkeleton × 4
          |
          ├─→ waiting_payment orders > 0
          │         |
          │         ▼
          │   Yellow banner "n pesanan menunggu pembayaran"
          │         |
          │         ├─→ tap banner → expand / collapse list
          │         |
          │         └─→ expanded: order rows (Order #n, date)
          │                   → tap row → navigate('Invoice', { orderId })
          |
          └─→ Full order list
                    |
                    ▼
              Each row: Order #n | date | total | status badge
              Status badge colors:
                waiting_payment   → amber  "Menunggu"
                payment_confirmed → blue   "Diproses"
                processing        → blue   "Diproses"
                in_delivery       → purple "Dikirim"
                delivered         → green  "Lunas"
                failed / expired  → red    "Gagal"
                    |
                    ├─→ tap row → navigate('Invoice', { orderId })
                    |
                    └─→ scroll near bottom (300px threshold)
                                → fetchNextPage (next page of orders)
                                → append rows + show spinner
                                → repeat until hasNextPage = false
```

**Theme**

<img src="assets/screenshots/mobile - tema.png" width="200" />

- [x] Multi-theme — Green Fern, Green Jade, Red, Blue, Orange
- [x] Centralized color tokens in `src/constants/themes.ts`
- [x] Change theme from Profile → Security tab

```
Profile → Keamanan tab
          |
          ▼
  Show 5 color swatches
    Green Fern  #388E3C
    Green Jade  #00796B  ← default
    Red         #c0392b
    Blue        #3b82f6
    Orange      #f97316
          |
          ▼
  tap swatch
          |
          ▼
  setTheme(name) → Zustand themeStore
    { themeName: name, theme: themes[name] }
          |
          ▼
  All components calling useTheme() re-render
  with new color tokens:
    primary, primaryDark, primaryLight, primaryFaint
    background, surface, text, textMuted, border
    danger, success, warning
          |
          ▼
  Active swatch shows checkmark + white border ring
  (no persistence — resets to greenJade on cold start)
```

**Wishlist**

- [x] Toggle wishlist from product card (red/grey heart icon)
- [x] Wishlist synced via `GET /api/wishlists` — heart updates immediately on HomeScreen open
- [x] Add to wishlist via `POST /api/wishlists { product_id }`
- [x] Remove from wishlist via `DELETE /api/wishlists/:product_id`
- [x] "Favourites" tab in ProfileScreen — list of favourite products with thumbnail, name, price
- [x] Remove from favourites directly via heart button in Favourites tab

```
HomeScreen loads
          |
          ▼
  GET /api/wishlists   ← useWishlist (skip if guest)
  returns [{ product_id, ... }]
          |
          ▼
  ProductCard renders heart icon
    filled red  → product is in wishlist
    grey outline → product is not in wishlist
          |
          ├─── Tap heart (not in wishlist) ──────────────────────────────
          │         |
          │         ▼
          │   POST /api/wishlists { product_id }   ← addWishlist.mutate
          │         |
          │         └─→ success → invalidate ['wishlists']
          │                     → heart turns red instantly (optimistic-like)
          │
          ├─── Tap heart (already in wishlist) ──────────────────────────
          │         |
          │         ▼
          │   DELETE /api/wishlists/:product_id   ← removeWishlist.mutate
          │         |
          │         └─→ success → invalidate ['wishlists']
          │                     → heart turns grey
          │
          └─── Profile → Favorit tab ─────────────────────────────────────
                    |
                    ▼
              GET /api/wishlists   ← useWishlist
                    |
                    ├─→ empty → "Belum ada produk favorit"
                    |
                    └─→ list (thumbnail, name, price)
                              ├─→ tap item → navigate('ProductDetail', { productId })
                              └─→ tap heart → DELETE /api/wishlists/:product_id
                                          → item removed from list
```

**Product Detail**

- [x] Tap product card in Home → open detail screen
- [x] Tap item in Favourites tab → open detail screen
- [x] Full-width product image, name, price, category, tags, description, stock
- [x] "Add to Cart" button with loading state & disabled when out of stock / cart full
- [x] Wishlist toggle (heart) in detail screen header with loading state
- [x] Fetch via `GET /api/products?q=name` — filter by `_id` (no dedicated detail endpoint)

```
Entry points:
  tap ProductCard (Home)          → navigate('ProductDetail', { productId, name })
  tap item in Favorit tab         → navigate('ProductDetail', { productId, name })
          |
          ▼
  GET /api/products?q=name   ← useProduct(productId, name)
  filter result by _id
          |
          ├─→ isLoading → ProductDetailSkeleton
          ├─→ not found → "Produk tidak ditemukan"
          └─→ product loaded
                    |
                    ▼
              Full-width image (280px height)
              Name + stock badge:
                stock 1–5  → "Sisa n" badge (primary color)
                stock 0    → "Habis" badge (red)
              Price
              Star rating (avg_rating) + review count
              Category chip + tag chips
              Description (if any)
              Stock count + "n di keranjang" (if cartQty > 0)
                    |
                    ├─── Header heart (wishlist toggle) ──────────────────
                    │         |
                    │         ├─→ not wishlisted → POST /api/wishlists { product_id }
                    │         └─→ wishlisted     → DELETE /api/wishlists/:product_id
                    │             (spinner while pending)
                    │
                    ├─── Reviews section ─────────────────────────────────
                    │         |
                    │         ▼
                    │   GET /api/reviews?product_id=...   ← useReviews
                    │         |
                    │         ├─→ loading → ActivityIndicator
                    │         ├─→ empty   → "Belum ada ulasan"
                    │         └─→ list: stars, reviewer name, date, comment
                    │
                    └─── "Tambah ke Keranjang" button (sticky footer) ────
                              |
                              ├─→ stock = 0          → disabled "Stok Habis"
                              ├─→ cartQty ≥ stock    → disabled "Stok Penuh"
                              └─→ available
                                        |
                                        ▼
                                  POST /api/carts { product_id, qty: 1 }
                                        |
                                        └─→ success → invalidate ['cart']
                                                    → cart badge in Header +1
```

**Product Reviews**

- [x] "Give Review" button per item in InvoiceScreen when status is `delivered`
- [x] Bottom sheet modal: star rating 1–5 (tap), comment field, rating label (Very Bad–Very Good)
- [x] Submit via `POST /api/reviews { product_id, order_id, rating, comment }`
- [x] Inline error in modal (red box) — including duplicate review message from backend
- [x] "Give Review" button disappears after successful submit or if already reviewed
- [x] Review list per product shown below each item (from all users) via `GET /api/reviews?product_id=X`
- [x] Reviewer name + stars + comment displayed per review

```
InvoiceScreen — order status: delivered
          |
          ▼
  GET /api/reviews?order_id=...   ← useReviews({ order_id })
  returns reviews already submitted for this order
          |
          ▼
  Per order item:
    already reviewed → show existing review (stars + comment)
                     → "Give Review" button hidden
    not yet reviewed → show "Give Review" button
          |
          ▼ (tap "Give Review")
  Open ReviewModal (bottom sheet)
          |
          ▼
  Star rating row (1–5, tap to select)
    1 → Very Bad
    2 → Bad
    3 → Average
    4 → Good
    5 → Very Good
  Comment TextInput (multiline)
          |
          ├─→ tap Cancel / close → dismiss modal, no change
          |
          └─→ tap Submit
                    |
                    ▼
              POST /api/reviews
              { product_id, order_id, rating, comment }
                    |
                    ├─→ error (duplicate / validation)
                    │         → inline red error box in modal
                    │
                    └─→ success
                              → invalidate ['reviews', order_id]
                              → modal closes
                              → "Give Review" button disappears
                              → review (stars + comment) shown inline
```

**Delivery Address**

- [x] CRUD address in "Delivery Address" tab of ProfileScreen
- [x] List of saved addresses (name, region, detail) with edit & delete buttons
- [x] Add / edit address form via bottom sheet modal
- [x] Cascading region picker: Province → City → District → Village (with search)
- [x] Region data from `GET /api/wilayah/provinsi|kabupaten|kecamatan|desa`
- [x] Delete address confirmation via Alert

```
Profile → Alamat Pengiriman tab
          |
          ▼
  GET /api/delivery-addresses   ← useDeliveryAddresses
          |
          ├─→ isLoading → ActivityIndicator
          ├─→ empty → "Belum ada alamat tersimpan"
          └─→ address list (label, region, detail)
                    |
                    ├─── tap pencil → AddressFormModal (edit mode)
                    │         pre-fills: nama, provinsi, kabupaten,
                    │                   kecamatan, kelurahan, detail
                    │
                    ├─── tap trash → Alert "Hapus alamat?"
                    │         ├─→ Batal → dismiss
                    │         └─→ Hapus → DELETE /api/delivery-addresses/:id
                    │                   → invalidate ['addresses']
                    │
                    └─── tap "Tambah" → AddressFormModal (create mode)
                              empty form

─────────────────────────────────────────────────────────

AddressFormModal (bottom sheet)
          |
          ▼
  Label Alamat  (TextInput — e.g. "Rumah", "Kantor")
          |
          ▼
  Cascading RegionPicker:
    1. Provinsi
         GET /api/wilayah/provinsi   (loaded once)
         → pick → clears Kabupaten, Kecamatan, Kelurahan
    2. Kabupaten / Kota
         GET /api/wilayah/kabupaten?kode=<provinsi_kode>
         disabled until Provinsi selected
         → pick → clears Kecamatan, Kelurahan
    3. Kecamatan
         GET /api/wilayah/kecamatan?kode=<kabupaten_kode>
         disabled until Kabupaten selected
         → pick → clears Kelurahan
    4. Kelurahan / Desa
         GET /api/wilayah/desa?kode=<kecamatan_kode>
         disabled until Kecamatan selected
          |
          ▼
  Detail Alamat (multiline — jalan, nomor, RT/RW, patokan)
          |
          ▼
  Submit button
    disabled (grey) if any field empty
    enabled  (primary) when all fields filled
          |
          ├─→ create mode → POST /api/delivery-addresses { nama, provinsi,
          │                   kabupaten, kecamatan, kelurahan, detail }
          │                   → success → close modal, invalidate ['addresses']
          │
          └─→ edit mode   → PUT /api/delivery-addresses/:id { ...payload }
                            → success → close modal, invalidate ['addresses']
                            (error → Alert "Gagal menyimpan alamat")
```

**Profile & Media**

- [x] Avatar image picker — `expo-image-picker`, camera + gallery, upload to `PUT /api/users/avatar` (Cloudinary), photo updates immediately in hero section

```
Profile hero — tap avatar
          |
          ├─→ user has image_url
          │         |
          │         ▼
          │   Full-screen preview modal (dark overlay)
          │         |
          │         ├─→ tap X / back → close modal
          │         └─→ tap "Ganti Foto" → close modal
          │                   → 300ms delay → open picker alert
          │
          └─→ no image (initials avatar)
                    |
                    ▼
              open picker alert directly

─────────────────────────────────────────────────────────

Picker Alert "Pilih sumber foto"
          |
          ├─── Kamera ──────────────────────────────────────────────────
          │         |
          │         ▼
          │   requestCameraPermissionsAsync()
          │         |
          │         ├─→ denied → Alert "Izin kamera dibutuhkan"
          │         └─→ granted
          │                   ▼
          │             launchCameraAsync
          │             { mediaTypes: images, allowsEditing: true,
          │               aspect: [1,1], quality: 0.8 }
          │                   |
          │                   ├─→ canceled → no-op
          │                   └─→ photo captured (uri)
          │                             → uploadAvatar(uri)
          │
          ├─── Galeri ──────────────────────────────────────────────────
          │         |
          │         ▼
          │   requestMediaLibraryPermissionsAsync()
          │         |
          │         ├─→ denied → Alert "Izin galeri dibutuhkan"
          │         └─→ granted
          │                   ▼
          │             launchImageLibraryAsync
          │             { mediaTypes: images, allowsEditing: true,
          │               aspect: [1,1], quality: 0.8 }
          │                   |
          │                   ├─→ canceled → no-op
          │                   └─→ image selected (uri)
          │                             → uploadAvatar(uri)
          │
          └─── Batal → dismiss

─────────────────────────────────────────────────────────

uploadAvatar(uri)
          |
          ▼
  Build FormData { image: { uri, name, type } }
          |
          ▼
  PUT /api/users/avatar  (multipart/form-data)
  → Cloudinary upload on backend
  → returns { image_url }
          |
          ├─→ error → Alert "Gagal upload foto"
          └─→ success
                    → updateUser({ image_url }) in Zustand
                    → hero avatar re-renders immediately
                    → camera badge spinner → camera icon
```

**Product & UX**

- [x] `useInfiniteQuery` + infinite scroll — `GET /api/products` (auto-load via `onEndReached` in FlatList) + `GET /api/orders` (auto-load via `onScroll` in ScrollView); `limit:5`, `skip` per page, `getNextPageParam` from `count`
- [x] Skeleton loading — shimmer placeholder (`Animated` + `expo-linear-gradient`) in HomeScreen (product grid 6 cards), ProductDetailScreen (hero + content), ProfileScreen Order History tab (4 rows)
- [x] Average rating in ProductCard (⭐ 4.2 · count) and ProductDetailScreen (5 stars + avg + review count) from `avg_rating` + `review_count` fields
- [x] Search history — save last searches to `AsyncStorage` (max 8), shown when search is focused + empty; tap to refill, delete per item, clear all

```
── Infinite Scroll ────────────────────────────────────────────────────────

  HomeScreen (FlatList)
    initial load: GET /api/products?limit=5&skip=0
    user scrolls near end (onEndReached)
      → fetchNextPage → skip=5, skip=10, ...
      → append cards to grid
      → stop when hasNextPage = false (skip ≥ count)

  Profile Order History (ScrollView)
    initial load: GET /api/orders (page 1)
    user scrolls near bottom (300px threshold via onScroll)
      → fetchNextPage → next page
      → append rows + show spinner
      → stop when hasNextPage = false

── Skeleton Loading ────────────────────────────────────────────────────────

  HomeScreen
    isLoading → 6 ProductCardSkeleton (shimmer cards, 2-column grid)
    data ready → replace with real cards

  ProductDetailScreen
    isLoading → ProductDetailSkeleton
               (full-width image block + content lines)
    data ready → replace with real detail

  Profile → Riwayat Belanja tab
    isLoading → 4 × OrderRowSkeleton (shimmer rows)
    data ready → replace with real order rows

  Skeleton animation:
    Animated.loop → translateX -width → +width
    LinearGradient overlay → shimmer effect

── Average Rating ──────────────────────────────────────────────────────────

  ProductCard (Home grid)
    avg_rating > 0  → ⭐ 4.2 · 12 ulasan
    avg_rating = 0  → no rating shown

  ProductDetailScreen
    avg_rating > 0  → 5-star row (filled/outline) + "4.2" + "· 12 ulasan"
    avg_rating = 0  → "Belum ada ulasan"

  Fields come from backend: product.avg_rating, product.review_count
  (computed server-side, not fetched separately)

── Search History ──────────────────────────────────────────────────────────

  App starts → AsyncStorage.getItem('search_history')
             → hydrate history[] (max 8 strings)

  User focuses search input (query empty)
    history.length > 0 → show Search History panel
      each item: term + X button
      "Hapus Semua" button

  User types (debounce 500ms) → hide history panel, run search

  User submits / clears search
    addSearch(term)
      → prepend to history, deduplicate, slice to 8
      → AsyncStorage.setItem (persist)

  Tap history item
    → fill search input with term
    → dismiss keyboard
    → run search immediately

  Tap X on item → removeSearch(term) → AsyncStorage update
  Tap "Hapus Semua" → AsyncStorage.removeItem → history = []
```

**Infrastructure**

- [x] Offline banner (`@react-native-community/netinfo`) — detect lost connection, show banner, auto retry when back online
- [x] Deep linking — open InvoiceScreen / ProductDetailScreen directly from notification or external link

```
── App Bootstrap ───────────────────────────────────────────────────────────

  App launches
          |
          ▼
  QueryClientProvider wraps everything
          |
          ▼
  BiometricGate
    supported && !authenticated → show LockScreen
    otherwise → render children
          |
          ▼
  NavigationContainer (ref passed to usePushNotification)
          |
          ▼
  RootNavigator mounts → loadAuth()
    SecureStore.getItem('token')
          |
          ├─→ no token  → { user: null, isLoading: false } → Home (guest)
          └─→ token found
                    ▼
              GET /auth/me (with token)
                    |
                    ├─→ 401 / error → deleteItem('token')
                    │               → isLoading: false → Home (guest)
                    └─→ success → set { user, token, isLoading: false }
                                → Home (logged in)

── Axios Interceptor ───────────────────────────────────────────────────────

  Every API request
          |
          ▼
  Request interceptor
    SecureStore.getItem('token')
    → attach Authorization: Bearer <token> if present
    → strip undefined params
    → log [API →] METHOD /path params
          |
          ▼
  Response interceptor
    → log [API ←] status /path data
    → if response.data.error === 1 → reject as app error
    → on HTTP error → log [API ✗] status /path + reject

── Offline Banner ──────────────────────────────────────────────────────────

  useNetInfo() polls network state continuously
          |
          ├─→ isConnected = false
          │         wasOffline.current = true
          │         → OfflineBanner visible (red banner overlay)
          │
          └─→ isConnected = true (and wasOffline was true)
                    wasOffline.current = false
                    → queryClient.invalidateQueries() (refetch all stale data)
                    → OfflineBanner hidden

── JWT Auth Flow (per request) ─────────────────────────────────────────────

  setAuth(user, token)          logout()
    SecureStore.setItem           SecureStore.deleteItem
    Zustand: { user, token }      Zustand: { user: null, token: null }
          |                               |
          ▼                               ▼
  All authenticated requests      All requests go without token
  carry Bearer header             → 401 responses expected
```


