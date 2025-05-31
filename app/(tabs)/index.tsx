import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, Easing } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  // Анимация на бутона "Влез в колата"
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const onPressIn = () => {
    scale.value = withTiming(0.9, { duration: 100, easing: Easing.out(Easing.ease) });
  };

  const onPressOut = () => {
    scale.value = withTiming(1, { duration: 100, easing: Easing.out(Easing.ease) });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Добре дошъл в AutoWaze</Text>
      <Text style={styles.subtitle}>Избери къде да тръгнеш и къде да отидеш</Text>

      <Animated.View style={[styles.carButtonContainer, animatedStyle]}>
        <TouchableOpacity
          onPress={() => alert('Влязохте в колата!')}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={styles.carButton}
          activeOpacity={0.8}
        >
          <Text style={styles.carButtonText}>🚗 Влез в колата</Text>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity
        style={styles.navigateButton}
        onPress={() => router.push('/(tabs)/navigate')}
      >
        <Text style={styles.navigateButtonText}>Къде да тръгваме?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A84FF',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#d0e6ff',
    marginBottom: 40,
    textAlign: 'center',
  },
  carButtonContainer: {
    marginBottom: 30,
  },
  carButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  carButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0A84FF',
  },
  navigateButton: {
    borderColor: '#fff',
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 40,
  },
  navigateButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
});
