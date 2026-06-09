import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp } from '@react-navigation/native'

import { MainStackParamList } from '../../types/navigation'
import { useProduct } from '../../hooks/useProduct'
import { useAddToCart, useCartQty } from '../../hooks/useCart'
import { useWishlist, useAddWishlist, useRemoveWishlist } from '../../hooks/useWishlist'
import { useReviews } from '../../hooks/useReviews'
import { useTheme } from '../../hooks/useTheme'
import { getImageUrl } from '../../lib/utils'
import ProductDetailSkeleton from '../../components/skeleton/ProductDetailSkeleton'

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'ProductDetail'>
  route: RouteProp<MainStackParamList, 'ProductDetail'>
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default function ProductDetailScreen({ navigation, route }: Props) {
  const { productId, name } = route.params
  const t = useTheme()

  const { data: product, isLoading } = useProduct(productId, name)
  const { addToCart, isPending: cartPending } = useAddToCart()
  const cartQty = useCartQty(productId)

  const { data: wishlistItems } = useWishlist()
  const addWishlist = useAddWishlist()
  const removeWishlist = useRemoveWishlist()

  const { data: reviews, isLoading: loadingReviews } = useReviews({ product_id: productId })

  const isWishlisted = (wishlistItems ?? []).some(w => w.product._id === productId)

  const categoryName = product
    ? typeof product.category === 'string' ? product.category : (product.category as any)?.name
    : undefined

  const tagNames: string[] = product?.tags
    ? product.tags.map(t => typeof t === 'string' ? t : (t as any)?.name ?? '')
    : []
  const wishlistPending = addWishlist.isPending || removeWishlist.isPending
  const isMaxStock = product ? cartQty >= product.stock : false

  const handleToggleWishlist = () => {
    if (isWishlisted) {
      removeWishlist.mutate(productId)
    } else {
      addWishlist.mutate(productId)
    }
  }

  if (isLoading) return <ProductDetailSkeleton />

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]} edges={['top']}>
        <Text style={{ color: '#aaa' }}>Produk tidak ditemukan</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{product.name}</Text>
        <TouchableOpacity onPress={handleToggleWishlist} style={styles.headerBtn} disabled={wishlistPending}>
          {wishlistPending
            ? <ActivityIndicator size={18} color="#ef4444" />
            : <Ionicons name={isWishlisted ? 'heart' : 'heart-outline'} size={22} color={isWishlisted ? '#ef4444' : '#888'} />
          }
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {/* Image */}
        <Image
          source={{ uri: getImageUrl(product.image_url) }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Info card */}
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{product.name}</Text>
            {product.stock > 0 && product.stock <= 5 && (
              <View style={[styles.stockBadge, { backgroundColor: t.primary }]}>
                <Text style={styles.stockBadgeText}>Sisa {product.stock}</Text>
              </View>
            )}
            {product.stock === 0 && (
              <View style={[styles.stockBadge, { backgroundColor: '#fee2e2' }]}>
                <Text style={[styles.stockBadgeText, { color: '#ef4444' }]}>Habis</Text>
              </View>
            )}
          </View>

          <Text style={[styles.price, { color: t.primary }]}>{formatPrice(product.price)}</Text>

          {/* Category & tags */}
          <View style={styles.chipsRow}>
            {categoryName && (
              <View style={[styles.chip, { backgroundColor: t.primaryFaint, borderColor: t.primary }]}>
                <Text style={[styles.chipText, { color: t.primary }]}>{categoryName}</Text>
              </View>
            )}
            {tagNames.map(tag => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagChipText}>{tag}</Text>
              </View>
            ))}
          </View>

          {product.description ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.descLabel}>Deskripsi</Text>
              <Text style={styles.desc}>{product.description}</Text>
            </>
          ) : null}

          <View style={styles.divider} />
          <View style={styles.stockRow}>
            <Ionicons name="cube-outline" size={16} color="#888" />
            <Text style={styles.stockText}>Stok: {product.stock} tersedia</Text>
          </View>
          {cartQty > 0 && (
            <View style={styles.stockRow}>
              <Ionicons name="cart-outline" size={16} color={t.primary} />
              <Text style={[styles.stockText, { color: t.primary }]}>{cartQty} di keranjang</Text>
            </View>
          )}
        </View>

        {/* Reviews */}
        <View style={styles.card}>
          <View style={styles.reviewHeader}>
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Text style={styles.reviewTitle}>Ulasan Pembeli</Text>
            {!!reviews?.length && (
              <Text style={[styles.reviewCount, { color: t.textMuted }]}>{reviews.length} ulasan</Text>
            )}
          </View>

          {loadingReviews && <ActivityIndicator color={t.primary} style={{ marginTop: 12 }} />}

          {!loadingReviews && !reviews?.length && (
            <Text style={styles.noReview}>Belum ada ulasan untuk produk ini.</Text>
          )}

          {reviews?.map(r => (
            <View key={r._id} style={styles.reviewRow}>
              <View style={styles.reviewMeta}>
                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <Ionicons key={s} name={s <= r.rating ? 'star' : 'star-outline'} size={12} color="#f59e0b" />
                  ))}
                </View>
                <Text style={styles.reviewUser}>
                  {typeof r.user === 'string' ? 'User' : r.user.full_name}
                </Text>
                <Text style={[styles.reviewDate, { color: t.textMuted }]}>
                  {new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              </View>
              <Text style={styles.reviewComment}>{r.comment}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add to cart */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cartBtn, { backgroundColor: isMaxStock || product.stock === 0 ? '#ccc' : t.primary, opacity: cartPending ? 0.6 : 1 }]}
          onPress={() => addToCart(product)}
          disabled={cartPending || isMaxStock || product.stock === 0}
        >
          {cartPending
            ? <ActivityIndicator size={18} color="#fff" />
            : <Ionicons name="cart-outline" size={20} color="#fff" />
          }
          <Text style={styles.cartBtnText}>
            {product.stock === 0 ? 'Stok Habis' : isMaxStock ? 'Stok Penuh' : 'Tambah ke Keranjang'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    gap: 8,
  },
  headerBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  image: { width: '100%', height: 280, backgroundColor: '#f0f0f0' },
  body: { paddingBottom: 24 },
  card: {
    backgroundColor: '#fff', margin: 16, borderRadius: 14, padding: 16,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3,
  },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 6 },
  name: { flex: 1, fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  stockBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  stockBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  price: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { fontSize: 12, fontWeight: '600' },
  tagChip: { backgroundColor: '#f3f4f6', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  tagChipText: { fontSize: 12, color: '#555' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12 },
  descLabel: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  desc: { fontSize: 14, color: '#555', lineHeight: 22 },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  stockText: { fontSize: 13, color: '#888' },
  footer: {
    padding: 16, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  cartBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, paddingVertical: 14, gap: 8,
  },
  cartBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  reviewTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', flex: 1 },
  reviewCount: { fontSize: 12 },
  noReview: { fontSize: 13, color: '#aaa', marginTop: 4 },
  reviewRow: {
    paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#f5f5f5', gap: 4,
  },
  reviewMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewUser: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', flex: 1 },
  reviewDate: { fontSize: 11 },
  reviewComment: { fontSize: 13, color: '#555', lineHeight: 20 },
})
