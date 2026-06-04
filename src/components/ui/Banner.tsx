import { useRef, useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native'

const { width } = Dimensions.get('window')

const BANNERS = [
  { id: '1', label: 'Promo Spesial', title: 'Diskon Hingga\n30% Hari Ini!', cta: 'Pesan Sekarang →' },
  { id: '2', label: 'Menu Baru', title: 'Coba Menu\nTerbaru Kami!', cta: 'Lihat Menu →' },
  { id: '3', label: 'Free Ongkir', title: 'Gratis Ongkos\nKirim Hari Ini!', cta: 'Order Sekarang →' },
]

export default function Banner() {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<ScrollView>(null)

  const handleScroll = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width)
    setActiveIndex(index)
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
      >
        {BANNERS.map((banner) => (
          <View key={banner.id} style={styles.banner}>
            <Text style={styles.label}>🔥 {banner.label}</Text>
            <Text style={styles.title}>{banner.title}</Text>
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaText}>{banner.cta}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {BANNERS.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },
  banner: {
    width: width - 32,
    backgroundColor: '#c0392b',
    padding: 20,
    paddingBottom: 36,
  },
  label: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 8,
    overflow: 'hidden',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: 14,
  },
  ctaButton: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ctaText: {
    color: '#c0392b',
    fontWeight: '700',
    fontSize: 13,
  },
  dots: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#fff',
  },
})
