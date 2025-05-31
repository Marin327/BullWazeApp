import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';

export default function ExploreScreen() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; phone: string } | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'register' | 'profile'>('register');

  const [startLocation, setStartLocation] = useState<string>('Текущо местоположение');
  const [destination, setDestination] = useState('');

  // При регистрация
  const handleRegister = () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      Alert.alert('Грешка', 'Моля, попълнете всички полета.');
      return;
    }
    setUser({ name, email, phone });
    setIsRegistered(true);
    setStep('profile');
  };

  // Вземи текуща локация и задай като стартова точка
  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Грешка', 'Няма разрешение за местоположение.');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setStartLocation(`Lat: ${location.coords.latitude.toFixed(4)}, Lon: ${location.coords.longitude.toFixed(4)}`);
  };

  // Когато влезеш в профила, автоматично взимаме текущата локация
  React.useEffect(() => {
    if (step === 'profile') {
      getCurrentLocation();
    }
  }, [step]);

  // Започни пътуване (тук можеш да добавиш логика за карта/навигация)
  const startTravel = () => {
    if (!destination.trim()) {
      Alert.alert('Грешка', 'Моля, въведете дестинация.');
      return;
    }
    Alert.alert(
      'Пътуване започва!',
      `От: ${startLocation}\nДо: ${destination}`
    );
    // Тук може да навигираш към друга страница с картата, например
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {step === 'register' && (
          <>
            <Text style={styles.title}>Регистрация</Text>
            <TextInput
              style={styles.input}
              placeholder="Име"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Телефон"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <Button title="Регистрирай се" onPress={handleRegister} />
          </>
        )}

        {step === 'profile' && user && (
          <View>
            <Text style={styles.welcome}>Добре дошъл, {user.name}!</Text>

            <Text style={styles.label}>Начална точка:</Text>
            <TextInput
              style={styles.input}
              value={startLocation}
              onChangeText={setStartLocation}
            />

            <Text style={styles.label}>Дестинация:</Text>
            <TextInput
              style={styles.input}
              placeholder="Въведи град или място"
              value={destination}
              onChangeText={setDestination}
            />

            <Button title="Започни пътуването" onPress={startTravel} />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#f0f4f8',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: '#2c3e50',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'white',
    fontSize: 16,
  },
  welcome: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#27ae60',
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: '#34495e',
    fontWeight: '500',
  },
});
