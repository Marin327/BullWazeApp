import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

const presetLocations = {
  work: { name: 'Работа: Козлодуй 25А', latitude: 43.6684, longitude: 23.6015 },
  home: { name: 'Дом: Сатовча ул. Александър Стамболийски 7', latitude: 41.6292, longitude: 23.1096 },
  frequent: { name: 'Често посещавано: Люлин 9, блок 409 вход Г', latitude: 42.6724, longitude: 23.2702 },
  bansko: { name: 'Банско', latitude: 41.8372, longitude: 23.4883 },
  pernik: { name: 'Перник', latitude: 42.6050, longitude: 23.0389 },
};

export default function HomeScreen() {
  const router = useRouter();

  // Анимация бутон
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const onPressIn = () => {
    scale.value = withTiming(0.9, { duration: 100, easing: Easing.out(Easing.ease) });
  };
  const onPressOut = () => {
    scale.value = withTiming(1, { duration: 100, easing: Easing.out(Easing.ease) });
  };

  // Начална и крайна точка
  const [startLocation, setStartLocation] = useState(presetLocations.bansko.name);
  const [destination, setDestination] = useState(presetLocations.pernik.name);

  // Стартиране на пътуване
  const startTravel = () => {
    if (!startLocation.trim() || !destination.trim()) {
      Alert.alert('Грешка', 'Моля, въведете начална и крайна точка.');
      return;
    }
    router.push({
      pathname: '/(tabs)/navigate',
      params: { start: startLocation, end: destination },
    });
  };

  // Функция за избор на preset локация
  const setPresetLocation = (type: 'start' | 'destination', locName: string) => {
    if (type === 'start') setStartLocation(locName);
    else setDestination(locName);
  };

  // За карта – взимаме координатите на избраните локации
  const getCoordsByName = (name: string) => {
    const loc = Object.values(presetLocations).find((l) => l.name === name);
    return loc ? { latitude: loc.latitude, longitude: loc.longitude } : null;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0A84FF' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.mainTitle}>Добре дошъл в AutoWaze</Text>
        <Text style={styles.subtitle}>Избери начална и крайна точка за твоето пътуване</Text>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 42.1,
              longitude: 23.2,
              latitudeDelta: 1.5,
              longitudeDelta: 1.5,
            }}
          >
            {getCoordsByName(startLocation) && (
              <Marker
                coordinate={getCoordsByName(startLocation)!}
                title="Начало"
                description={startLocation}
                pinColor="green"
              />
            )}
            {getCoordsByName(destination) && (
              <Marker
                coordinate={getCoordsByName(destination)!}
                title="Край"
                description={destination}
                pinColor="red"
              />
            )}
          </MapView>
        </View>

        <Text style={styles.sectionTitle}>Начална точка</Text>
        <View style={styles.presetContainer}>
          {Object.values(presetLocations).map((loc) => (
            <TouchableOpacity
              key={'start-' + loc.name}
              style={[
                styles.presetButton,
                startLocation === loc.name && styles.presetButtonSelected,
              ]}
              onPress={() => setPresetLocation('start', loc.name)}
            >
              <Text
                style={[
                  styles.presetText,
                  startLocation === loc.name && styles.presetTextSelected,
                ]}
              >
                {loc.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Въведи начална точка"
          value={startLocation}
          onChangeText={setStartLocation}
        />

        <Text style={styles.sectionTitle}>Дестинация</Text>
        <View style={styles.presetContainer}>
          {Object.values(presetLocations).map((loc) => (
            <TouchableOpacity
              key={'dest-' + loc.name}
              style={[
                styles.presetButton,
                destination === loc.name && styles.presetButtonSelected,
              ]}
              onPress={() => setPresetLocation('destination', loc.name)}
            >
              <Text
                style={[
                  styles.presetText,
                  destination === loc.name && styles.presetTextSelected,
                ]}
              >
                {loc.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Въведи дестинация"
          value={destination}
          onChangeText={setDestination}
        />

        <Animated.View style={[styles.carButtonContainer, animatedStyle]}>
          <TouchableOpacity
            onPress={startTravel}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            style={styles.carButton}
            activeOpacity={0.8}
          >
            <Text style={styles.carButtonText}>🚗 Започни пътуването</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 40,
  },
  mainTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#c0d8ff',
    textAlign: 'center',
    marginBottom: 20,
  },
  mapContainer: {
    height: 180,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  map: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f0f4f8',
    marginBottom: 10,
    marginTop: 18,
  },
  presetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    justifyContent: 'center',
  },
  presetButton: {
    backgroundColor: '#145cd9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 25,
    margin: 6,
    minWidth: 130,
    alignItems: 'center',
  },
  presetButtonSelected: {
    backgroundColor: '#27ae60',
  },
  presetText: {
    color: '#c0d8ff',
    fontWeight: '600',
    fontSize: 13,
  },
  presetTextSelected: {
    color: '#fff',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  input: {
    backgroundColor: '#fff',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 17,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#145cd9',
    color: '#0A0A0A',
  },
  carButtonContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  carButton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  carButtonText: {
    color: '#0A84FF',
    fontSize: 22,
    fontWeight: '700',
  },
});

