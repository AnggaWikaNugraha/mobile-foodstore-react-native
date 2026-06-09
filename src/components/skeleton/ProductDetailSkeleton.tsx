import { View, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Skeleton from './Skeleton'

export default function ProductDetailSkeleton() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header bar */}
      <View style={styles.header}>
        <Skeleton width={32} height={32} borderRadius={16} />
        <Skeleton width={140} height={18} />
        <Skeleton width={32} height={32} borderRadius={16} />
      </View>

      <ScrollView>
        {/* Hero image */}
        <Skeleton width="100%" height={300} borderRadius={0} />

        <View style={styles.content}>
          {/* Name */}
          <Skeleton width="75%" height={22} style={styles.mb8} />
          {/* Price */}
          <Skeleton width="40%" height={28} style={styles.mb16} />

          {/* Category + tags row */}
          <View style={styles.row}>
            <Skeleton width={80} height={26} borderRadius={20} />
            <Skeleton width={70} height={26} borderRadius={20} />
            <Skeleton width={60} height={26} borderRadius={20} />
          </View>

          <View style={styles.divider} />

          {/* Description lines */}
          <Skeleton width="100%" height={14} style={styles.mb8} />
          <Skeleton width="95%" height={14} style={styles.mb8} />
          <Skeleton width="80%" height={14} style={styles.mb16} />

          {/* Stock */}
          <Skeleton width="35%" height={14} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: { padding: 16 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 16 },
  mb8: { marginBottom: 8 },
  mb16: { marginBottom: 16 },
})
