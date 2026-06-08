import { useEffect, useState } from 'react'
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../hooks/useTheme'
import { useCreateReview } from '../../hooks/useReviews'

interface Props {
  visible: boolean
  productId: string
  productName: string
  orderId: string
  onClose: () => void
  onSuccess?: (productId: string) => void
}

export default function ReviewModal({ visible, productId, productName, orderId, onClose, onSuccess }: Props) {
  const t = useTheme()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const createReview = useCreateReview()

  const errorMsg = createReview.error?.message ?? ''

  // Sukses → tutup modal + notif parent
  useEffect(() => {
    if (createReview.isSuccess) {
      onSuccess?.(productId)
      setComment('')
      setRating(5)
      createReview.reset()
      onClose()
    }
  }, [createReview.isSuccess])

  // Error duplikat → sembunyikan button di parent, tapi biarkan modal terbuka agar pesan terbaca
  useEffect(() => {
    if (createReview.isError && errorMsg.includes('sudah memberi rating')) {
      onSuccess?.(productId)
    }
  }, [createReview.isError])

  const handleSubmit = () => {
    if (!comment.trim()) return
    createReview.reset()
    createReview.mutate({ product_id: productId, order_id: orderId, rating, comment: comment.trim() })
  }

  const handleClose = () => {
    setComment('')
    setRating(5)
    createReview.reset()
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <View style={styles.drag} />

          <View style={styles.header}>
            <Text style={styles.title}>Beri Rating</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={22} color="#888" />
            </TouchableOpacity>
          </View>

          <Text style={styles.productName} numberOfLines={2}>{productName}</Text>

          {/* Stars */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={36}
                  color={star <= rating ? '#f59e0b' : '#ddd'}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingLabel}>{RATING_LABELS[rating]}</Text>

          {/* Comment */}
          <TextInput
            style={styles.input}
            placeholder="Tulis ulasanmu..."
            placeholderTextColor="#aaa"
            value={comment}
            onChangeText={text => { setComment(text); createReview.reset() }}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Error */}
          {createReview.isError && !!errorMsg && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={14} color="#ef4444" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: comment.trim() ? t.primary : '#ccc' }]}
              onPress={handleSubmit}
              disabled={!comment.trim() || createReview.isPending}
            >
              {createReview.isPending
                ? <ActivityIndicator size={16} color="#fff" />
                : <Text style={styles.submitText}>Kirim Ulasan</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const RATING_LABELS: Record<number, string> = {
  1: 'Sangat Buruk', 2: 'Buruk', 3: 'Cukup', 4: 'Bagus', 5: 'Sangat Bagus',
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 32,
  },
  drag: {
    width: 40, height: 4, backgroundColor: '#e0e0e0',
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
  },
  title: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  productName: { fontSize: 14, color: '#555', marginBottom: 16 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  ratingLabel: { textAlign: 'center', fontSize: 13, color: '#888', marginBottom: 16, fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
    padding: 12, fontSize: 14, color: '#1a1a1a', minHeight: 100, marginBottom: 8,
  },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fef2f2', borderRadius: 8, padding: 10, marginBottom: 12,
  },
  errorText: { fontSize: 13, color: '#ef4444', flex: 1 },
  actions: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    paddingVertical: 13, alignItems: 'center',
  },
  cancelText: { fontSize: 14, color: '#888', fontWeight: '600' },
  submitBtn: {
    flex: 2, borderRadius: 10, paddingVertical: 13, alignItems: 'center',
  },
  submitText: { fontSize: 14, color: '#fff', fontWeight: '700' },
})
