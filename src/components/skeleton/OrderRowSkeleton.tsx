import { View, StyleSheet } from 'react-native'
import Skeleton from './Skeleton'

export default function OrderRowSkeleton() {
  return (
    <View style={styles.row}>
      <Skeleton width={44} height={44} borderRadius={8} />
      <View style={styles.mid}>
        <Skeleton width={120} height={14} style={styles.mb6} />
        <Skeleton width={80} height={12} />
      </View>
      <View style={styles.right}>
        <Skeleton width={90} height={14} style={styles.mb6} />
        <Skeleton width={60} height={22} borderRadius={20} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  mid: { flex: 1 },
  right: { alignItems: 'flex-end' },
  mb6: { marginBottom: 6 },
})
