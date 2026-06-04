import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Product } from '../../types/product'
import { useTheme } from '../../hooks/useTheme'
import { useAddToCart, useCartQty } from '../../hooks/useCart'
import { getImageUrl } from '../../lib/utils'

interface Props {
  product: Product
  onPress?: () => void
}

export default function ProductCard({ product, onPress }: Props) {
  const t = useTheme()
  const { addToCart, isPending } = useAddToCart()
  const cartQty = useCartQty(product._id)
  const isMaxStock = cartQty >= product.stock

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: getImageUrl(product.image_url) }} style={styles.image} resizeMode="cover" />

        {product.stock > 0 && product.stock <= 5 && (
          <View style={[styles.stockBadge, { backgroundColor: t.primary }]}>
            <Text style={styles.stockBadgeText}>Sisa {product.stock}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.wishlistButton}>
          <Ionicons name="heart-outline" size={16} color="#aaa" />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { color: t.text }]} numberOfLines={2}>{product.name}</Text>
        <Text style={[styles.price, { color: t.primary }]}>{formatPrice(product.price)}</Text>

        <View style={styles.footer}>
          <Text style={[styles.noReview, { color: t.textMuted }]}>Belum ada ulasan</Text>
          {product.stock > 0 ? (
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: isMaxStock ? '#ccc' : t.primary, opacity: isPending ? 0.6 : 1 }]}
              onPress={() => addToCart(product._id)}
              disabled={isPending || isMaxStock}
            >
              {isPending
                ? <ActivityIndicator size={14} color={t.white} />
                : <Ionicons name="add" size={18} color={t.white} />
              }
            </TouchableOpacity>
          ) : (
            <View style={styles.outOfStockBadge}>
              <Text style={[styles.outOfStockText, { color: t.danger }]}>Habis</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    margin: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  imageContainer: { position: 'relative' },
  image: {
    width: '100%',
    height: 130,
    backgroundColor: '#f5f5f5',
  },
  stockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  stockBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  info: { padding: 10 },
  name: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  price: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noReview: { fontSize: 11 },
  addButton: { borderRadius: 8, padding: 5 },
  outOfStockBadge: {
    backgroundColor: '#fee2e2',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  outOfStockText: { fontSize: 11, fontWeight: '600' },
})
