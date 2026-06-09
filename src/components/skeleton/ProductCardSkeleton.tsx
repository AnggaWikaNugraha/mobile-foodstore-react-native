import { View, StyleSheet } from 'react-native'
import Skeleton from './Skeleton'

export default function ProductCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width="100%" height={130} borderRadius={0} />
      <View style={styles.body}>
        <Skeleton width="80%" height={14} style={styles.row} />
        <Skeleton width="50%" height={12} style={styles.row} />
        <Skeleton width="60%" height={14} style={styles.row} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    margin: 6,
  },
  body: { padding: 10, gap: 6 },
  row: { marginBottom: 2 },
})
