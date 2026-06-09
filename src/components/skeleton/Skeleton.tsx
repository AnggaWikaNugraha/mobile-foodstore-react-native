import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View, DimensionValue } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

interface Props {
  width: DimensionValue
  height: number
  borderRadius?: number
  style?: object
}

export default function Skeleton({ width, height, borderRadius = 6, style }: Props) {
  const shimmer = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1100,
        useNativeDriver: true,
      })
    ).start()
    return () => shimmer.stopAnimation()
  }, [])

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  })

  return (
    <View style={[{ width, height, borderRadius, backgroundColor: '#e8e8e8', overflow: 'hidden' }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.55)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  )
}
