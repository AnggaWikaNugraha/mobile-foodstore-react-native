import { useState } from 'react'
import { useDebounce } from 'use-debounce'
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useProducts } from '../../hooks/useProducts'
import { useCategories } from '../../hooks/useCategories'
import { useTags } from '../../hooks/useTags'
import { useTheme } from '../../hooks/useTheme'
import useAuthStore from '../../store/authStore'
import { useWishlist, useAddWishlist, useRemoveWishlist } from '../../hooks/useWishlist'
import ProductCard from '../../components/product/ProductCard'
import Header from '../../components/ui/Header'
import Banner from '../../components/ui/Banner'
import { MainStackParamList } from '../../types/navigation'

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Home'>
}

const CATEGORY_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  semua: 'view-grid',
  utama: 'food',
  minuman: 'cup',
  snack: 'food-apple',
  pastry: 'bread-slice',
}

export default function HomeScreen({ navigation }: Props) {
  const t = useTheme()
  const token = useAuthStore((s) => s.token)
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 500)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const { data: productsData, isLoading, refetch } = useProducts({
    q: debouncedSearch || undefined,
    category: selectedCategory || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    limit: 20,
  })

  const { data: categoriesData } = useCategories()
  const { data: tagsData } = useTags()

  const { data: wishlistItems } = useWishlist()
  const addWishlist = useAddWishlist()
  const removeWishlist = useRemoveWishlist()

  const wishlistedIds = new Set((wishlistItems ?? []).map(w => w.product._id))

  const handleToggleWishlist = (productId: string) => {
    if (wishlistedIds.has(productId)) {
      removeWishlist.mutate(productId)
    } else {
      addWishlist.mutate(productId)
    }
  }

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        onProfilePress={() => navigation.navigate('Profile')}
        onCartPress={() => token ? navigation.navigate('Cart') : navigation.navigate('Login')}
        onLoginPress={() => navigation.navigate('Login')}
        onRegisterPress={() => navigation.navigate('Register')}
      />

      <FlatList
        data={productsData?.data}
        keyExtractor={(item) => item._id}
        numColumns={2}
        renderItem={({ item }) => {
          const wishlistLoading =
            (addWishlist.isPending && addWishlist.variables === item._id) ||
            (removeWishlist.isPending && removeWishlist.variables === item._id)
          return (
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { productId: item._id, name: item.name })}
              isWishlisted={wishlistedIds.has(item._id)}
              onToggleWishlist={() => handleToggleWishlist(item._id)}
              wishlistLoading={wishlistLoading}
            />
          )
        }}
        contentContainerStyle={styles.productList}
        onRefresh={refetch}
        refreshing={isLoading}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>Produk tidak ditemukan</Text>
            </View>
          ) : null
        }
        ListHeaderComponent={
          <View>
            <Banner />

            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color="#aaa" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Cari produk..."
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
              />
            </View>

            {/* Kategori */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kategori</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryRow}>
                  <TouchableOpacity
                    style={styles.categoryItem}
                    onPress={() => setSelectedCategory('')}
                  >
                    <View style={[styles.categoryIcon, !selectedCategory && { backgroundColor: t.primary }]}>
                      <MaterialCommunityIcons name="view-grid" size={22} color="#fff" />
                    </View>
                    <Text style={[styles.categoryLabel, !selectedCategory && { color: t.primary, fontWeight: '700' }]}>
                      Semua
                    </Text>
                  </TouchableOpacity>

                  {categoriesData?.data.map((cat) => {
                    const iconName = CATEGORY_ICONS[cat.name.toLowerCase()] ?? 'food'
                    const isActive = selectedCategory === cat.name
                    return (
                      <TouchableOpacity
                        key={cat._id}
                        style={styles.categoryItem}
                        onPress={() => setSelectedCategory(isActive ? '' : cat.name)}
                      >
                        <View style={[styles.categoryIcon, isActive && { backgroundColor: t.primary }]}>
                          <MaterialCommunityIcons name={iconName} size={22} color="#fff" />
                        </View>
                        <Text style={[styles.categoryLabel, isActive && { color: t.primary, fontWeight: '700' }]}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </ScrollView>
            </View>

            {/* Tags */}
            {tagsData?.data && tagsData.data.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tagsContainer}
              >
                {tagsData.data.map((tag) => {
                  const isActive = selectedTags.includes(tag.name)
                  return (
                    <TouchableOpacity
                      key={tag._id}
                      style={[styles.tagChip, isActive && { borderColor: t.primary, backgroundColor: t.primaryFaint }]}
                      onPress={() => toggleTag(tag.name)}
                    >
                      <View style={[styles.tagLetter, { backgroundColor: t.primary }]}>
                        <Text style={styles.tagLetterText}>{tag.name[0].toUpperCase()}</Text>
                      </View>
                      <Text style={[styles.tagText, isActive && { color: t.primary, fontWeight: '600' }]}>
                        {tag.name}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            )}

            {/* Count */}
            {productsData?.count !== undefined && (
              <Text style={styles.countText}>{productsData.count} produk ditemukan</Text>
            )}

            {isLoading && (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color={t.primary} />
              </View>
            )}
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a1a1a',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 16,
  },
  categoryItem: {
    alignItems: 'center',
    gap: 6,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 11,
    color: '#666',
    textTransform: 'capitalize',
  },
  tagsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 6,
  },
  tagLetter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagLetterText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  tagText: {
    fontSize: 13,
    color: '#555',
  },

  productList: {
    padding: 10,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 14,
  },
  countText: {
    fontSize: 12,
    color: '#888',
    marginHorizontal: 16,
    marginBottom: 8,
  },
})
