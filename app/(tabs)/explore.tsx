import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  Easing,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

// Функционален компонент
export default function ExploreScreen() {
  // Състояния за стартова точка, дестинация и информация
  const [startLocation, setStartLocation] = useState('Текущо местоположение');
  const [destination, setDestination] = useState('');
  const [trafficInfo, setTrafficInfo] = useState('');
  const [weatherInfo, setWeatherInfo] = useState('');
  const [accidentsInfo, setAccidentsInfo] = useState('');
  const [loadingInfo, setLoadingInfo] = useState(true);

  // Анимация на фон - прогрес от 0 до 1
  const progress = useSharedValue(0);

  // При mount пускаме анимацията, която циклира безкрайно
  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.linear }),
      -1,
      true // обръща посоката обратно
    );
  }, []);

  // Интерполиране на два цвята плавно в зависимост от стойността на progress
  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ['#2980b9', '#6dd5fa']
    );
    return {
      backgroundColor,
    };
  });

  // Получаване на текуща локация (псевдо код с Alert)
  const getCurrentLocation = async () => {
    // Симулираме работа с геолокация
    try {
      setLoadingInfo(true);
      // Тук може да сложиш Expo Location API ако искаш
      // Сега ползваме фиктивни данни
      setTimeout(() => {
        setStartLocation('София (42.6977, 23.3219)');
        setLoadingInfo(false);
      }, 1500);
    } catch {
      Alert.alert('Грешка', 'Няма разрешение за местоположение.');
      setLoadingInfo(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
    fetchTrafficData();

    // Обновяване на информацията на всеки 60 сек
    const interval = setInterval(fetchTrafficData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Зареждане на фиктивна информация за трафик, време и инциденти
  const fetchTrafficData = () => {
    setLoadingInfo(true);
    setTimeout(() => {
      setWeatherInfo('София: Облачно, 16°C');
      setTrafficInfo('Интензивен трафик по бул. Цариградско шосе');
      setAccidentsInfo('Катастрофа на бул. Витоша – избягвайте района');
      setLoadingInfo(false);
    }, 1000);
  };

  // Анимиран бутон - при натискане малко се смалява и връща
  const scale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const onPressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const onPressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  // Старт на пътуване - валидация и Alert
  const startTravel = () => {
    if (!destination.trim()) {
      Alert.alert('Грешка', 'Моля, въведете дестинация.');
      return;
    }
    Alert.alert('Пътуване започва!', `От: ${startLocation}\nДо: ${destination}`);
  };

  return (
    <Animated.View style={[styles.container, animatedBackgroundStyle]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Планирай пътуването си</Text>

          <Text style={styles.label}>Начална точка:</Text>
          <TextInput
            style={styles.input}
            value={startLocation}
            onChangeText={setStartLocation}
            placeholder="Въведи начална точка"
          />

          <Text style={styles.label}>Дестинация:</Text>
          <TextInput
            style={styles.input}
            placeholder="Въведи град или място"
            value={destination}
            onChangeText={setDestination}
          />

          <TouchableOpacity
            onPress={startTravel}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            activeOpacity={0.8}
            style={styles.buttonWrapper}
          >
            <Animated.View style={[styles.button, animatedButtonStyle]}>
              <Text style={styles.buttonText}>Започни пътуването</Text>
            </Animated.View>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Актуална информация за България</Text>
            {loadingInfo ? (
              <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
            ) : (
              <>
                <Text style={styles.infoLabel}>Време:</Text>
                <Text style={styles.infoText}>{weatherInfo}</Text>

                <Text style={styles.infoLabel}>Трафик:</Text>
                <Text style={styles.infoText}>{trafficInfo}</Text>

                <Text style={styles.infoLabel}>Катастрофи и инциденти:</Text>
                <Text style={styles.infoText}>{accidentsInfo}</Text>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // фонът вече е анимиран
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: '#fff',
    textShadowColor: '#00000099',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '600',
    color: '#dbe9ff',
    textShadowColor: '#00000099',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  input: {
    height: 50,
    borderColor: '#74aaffaa',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 18,
    backgroundColor: '#ffffffcc',
    fontSize: 16,
    color: '#333',
  },
  buttonWrapper: {
    alignSelf: 'center',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#005bb5',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#003d7a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  infoBox: {
    marginTop: 40,
    backgroundColor: '#004a99dd',
    borderRadius: 12,
    padding: 20,
    borderColor: '#74aaff',
    borderWidth: 1,
    shadowColor: '#003d7a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    elevation: 6,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#aaddff',
    textAlign: 'center',
    textShadowColor: '#00000099',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  infoLabel: {
    fontWeight: '600',
    fontSize: 16,
    marginTop: 10,
    color: '#cce6ff',
  },
  infoText: {
    fontSize: 16,
    color: '#dbe9ff',
    marginTop: 4,
  },
});

