import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

const funFacts = [
  'В България има над 19 000 км пътища.',
  'Пътищата в Родопите са едни от най-живописните.',
  'През зимата проходите се почистват ежедневно.',
  'В София трафикът достига до 70% от пиковите часове.',
  'България планира разширение на автомагистрали до 2030 г.',
  'Пътят от София до Бургас е около 390 км.',
  'Автомагистрала „Струма“ е една от най-модерните у нас.',
  'Пътната полиция следи активно скоростта по основните трасета.',
  'В София работи система за интелигентно управление на трафика.',
  'През лятото много българи пътуват към Черноморието.',
];

export default function HomeScreen() {
  const router = useRouter();

  // Анимация на бутона "Влез в колата"
  const scale = useSharedValue(1);

  // Пулсираща анимация за заглавието
  const pulse = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulse.value }],
    };
  });

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 700 }),
        withTiming(1, { duration: 700 })
      ),
      -1,
      true
    );
  }, []);

  const onPressIn = () => {
    scale.value = withTiming(0.9, { duration: 100, easing: Easing.out(Easing.ease) });
  };

  const onPressOut = () => {
    scale.value = withTiming(1, { duration: 100, easing: Easing.out(Easing.ease) });
  };

  // Показва случайна факта
  const [fact, setFact] = useState('');

  const showRandomFact = () => {
    const randomIndex = Math.floor(Math.random() * funFacts.length);
    setFact(funFacts[randomIndex]);
    Alert.alert('Любопитен факт', funFacts[randomIndex]);
  };

  // Текуща дата и час
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleString('bg-BG', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      });
      setCurrentTime(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000); // ъпдейт всяка минута
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.title, pulseStyle]}>
        Добре дошъл в AutoWaze
      </Animated.Text>
      <Text style={styles.subtitle}>Избери къде да тръгнеш и къде да отидеш</Text>
      <Text style={styles.time}>Днес е {currentTime}</Text>

      <Animated.View style={[styles.carButtonContainer, animatedStyle]}>
        <TouchableOpacity
          onPress={() => alert('Влязохте в колата! 🚗')}
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

      <TouchableOpacity style={styles.factButton} onPress={showRandomFact}>
        <Text style={styles.factButtonText}>🎉 Покажи любопитен факт за пътищата</Text>
      </TouchableOpacity>

      {fact ? <Text style={styles.factText}>{fact}</Text> : null}
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
    marginBottom: 4,
    textAlign: 'center',
  },
  time: {
    fontSize: 14,
    color: '#b0d4ff',
    marginBottom: 24,
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
    marginBottom: 20,
  },
  navigateButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  factButton: {
    backgroundColor: '#2980b9',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  factButtonText: {
    color: 'white',
    fontSize: 16,
  },
  factText: {
    marginTop: 16,
    fontSize: 14,
    color: '#cce6ff',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
});
