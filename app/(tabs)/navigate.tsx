import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import places from '@/data/places.json';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDe_IDTGrpTaZhbH1ouKzZKK4XoHTH_orw';

export default function NavigateScreen() {
  // Регистрация и вход
  const [registeredUser, setRegisteredUser] = useState<{
    name: string;
    email: string;
    phone: string;
  } | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Локация и дестинация
  const [destination, setDestination] = useState('');
  const [destinationCoords, setDestinationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // За показване на модал с регистрация
  const [modalVisible, setModalVisible] = useState(false);

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setCurrentLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      } else {
        Alert.alert('Грешка', 'Няма разрешение за локация');
      }
    })();
  }, []);

  const handleRegister = () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      Alert.alert('Грешка', 'Моля, попълнете всички полета');
      return;
    }
    setRegisteredUser({ name, email, phone });
    setModalVisible(false);
  };

  const handleLogout = () => {
    setRegisteredUser(null);
    setName('');
    setEmail('');
    setPhone('');
  };

  const searchDestination = async () => {
    const trimmedDest = destination.trim();
    if (!trimmedDest) {
      Alert.alert('Внимание', 'Моля въведи град или село.');
      return;
    }

    const place = places.find(p =>
      p.name.toLowerCase().includes(trimmedDest.toLowerCase())
    );

    if (place) {
      setDestinationCoords({ latitude: place.latitude, longitude: place.longitude });
      animateMapTo(place.latitude, place.longitude);
    } else {
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(trimmedDest)}&region=bg&language=bg&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
          const loc = data.results[0].geometry.location;
          setDestinationCoords({ latitude: loc.lat, longitude: loc.lng });
          animateMapTo(loc.lat, loc.lng);
        } else {
          Alert.alert('Грешка', 'Не може да се намери дестинацията.');
        }
      } catch {
        Alert.alert('Грешка', 'Възникна проблем при търсенето на дестинацията.');
      }
    }
  };

  const animateMapTo = (latitude: number, longitude: number) => {
    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      },
      1000
    );
  };

  const startTravel = () => {
    if (!currentLocation || !destinationCoords) {
      Alert.alert('Внимание', 'Трябва да зададете дестинация и да имате локация');
      return;
    }
    Alert.alert(
      'Пътуването започва!',
      `Здравей, ${registeredUser?.name}! Пътуваш от (${currentLocation.latitude.toFixed(
        4
      )}, ${currentLocation.longitude.toFixed(4)}) до ${destination}`
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Хедър с бутон Вход/Изход */}
      <View style={styles.header}>
        {!registeredUser ? (
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Вход</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>Изход</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Ако е регистриран - показва профил */}
      {registeredUser && (
        <View style={styles.profileContainer}>
          <Text style={styles.welcomeText}>Здравей, {registeredUser.name}!</Text>
          <Text>Email: {registeredUser.email}</Text>
          <Text>Телефон: {registeredUser.phone}</Text>
        </View>
      )}

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Въведи град или село"
          value={destination}
          onChangeText={setDestination}
          style={styles.input}
          autoCapitalize="words"
          autoCorrect={false}
          clearButtonMode="while-editing"
          onSubmitEditing={searchDestination}
          returnKeyType="search"
        />
        <Button title="Търси" onPress={searchDestination} />
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation
        initialRegion={{
          latitude: currentLocation?.latitude ?? 42.6977,
          longitude: currentLocation?.longitude ?? 23.3219,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
        region={
          destinationCoords && currentLocation
            ? {
                latitude: (destinationCoords.latitude + currentLocation.latitude) / 2,
                longitude: (destinationCoords.longitude + currentLocation.longitude) / 2,
                latitudeDelta: Math.abs(destinationCoords.latitude - currentLocation.latitude) * 2,
                longitudeDelta: Math.abs(destinationCoords.longitude - currentLocation.longitude) * 2,
              }
            : undefined
        }
      >
        {destinationCoords && (
          <Marker coordinate={destinationCoords} title={destination} pinColor="blue" />
        )}

        {currentLocation && destinationCoords && (
          <MapViewDirections
            origin={currentLocation}
            destination={destinationCoords}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={4}
            strokeColor="blue"
            onError={errorMessage => {
              Alert.alert('Грешка при чертане на маршрута', errorMessage);
            }}
          />
        )}
      </MapView>

      <View style={styles.startButtonContainer}>
        <Button title="Започни пътуването" onPress={startTravel} />
      </View>

      {/* Модален прозорец за регистрация */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={styles.registerContainer}>
              <Text style={styles.title}>Регистрация</Text>
              <TextInput
                placeholder="Име"
                style={styles.input}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                keyboardType="default"
              />
              <TextInput
                placeholder="Email"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                placeholder="Телефон"
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <Button title="Регистрирай се" onPress={handleRegister} />
              <Button title="Затвори" onPress={() => setModalVisible(false)} color="red" />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 15,
    zIndex: 20,
  },
  loginButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  profileContainer: {
    padding: 10,
    backgroundColor: '#dbeafe',
    marginTop: Platform.OS === 'ios' ? 90 : 70,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
    color: '#2563eb',
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 130 : 110,
    left: 10,
    right: 10,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    fontSize: 16,
    marginRight: 8,
  },
  map: { flex: 1 },
  startButtonContainer: {
    padding: 10,
    backgroundColor: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  registerContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: '#2c3e50',
  },
});

