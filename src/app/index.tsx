import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchByCoords } from '@/api/weather';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function WeatherScreen() {
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState({ lat: 0, lon: 0 });
  const [coordsModalOpen, setCoordsModalOpen] = useState(false);
  const [latInput, setLatInput] = useState('');
  const [lonInput, setLonInput] = useState('');

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') {
        if (!navigator.geolocation) {
          setError('Geolocalização não é suportada pelo seu navegador.');
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          },
          (err) => {
            setError(`Erro ao obter localização: ${err.message}`);
          },
        );
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permissão de localização negada.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setCoords({ lat: loc.coords.latitude, lon: loc.coords.longitude });
    })();
  }, []);

  const doFetch = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError('');
    setData(null);
    try {
      const result = await fetchByCoords(lat, lon);
      setData(result);
    } catch {
      setError('Erro ao buscar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCurrent = useCallback(() => {
    doFetch(coords.lat, coords.lon);
  }, [coords, doFetch]);

  const fetchManualCoords = useCallback(() => {
    const lat = Number(latInput);
    const lon = Number(lonInput);
    if (isNaN(lat) || isNaN(lon)) {
      setError('Insira valores numéricos válidos.');
      return;
    }
    setCoords({ lat, lon });
    doFetch(lat, lon);
    setCoordsModalOpen(false);
    setLatInput('');
    setLonInput('');
  }, [latInput, lonInput, doFetch]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="title" style={styles.title}>
            OpenWeather
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Use os botões abaixo para chamar a API OpenWeather.
          </ThemedText>

          {coords.lat !== 0 || coords.lon !== 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              Localização: {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
            </ThemedText>
          ) : null}

          <ThemedView style={styles.buttonsRow}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
              disabled={loading}
              onPress={fetchCurrent}
            >
              {loading ? (
                <ActivityIndicator size="small" />
              ) : (
                <ThemedText style={styles.buttonText}>Atual localização</ThemedText>
              )}
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => setCoordsModalOpen(true)}
            >
              <ThemedText style={styles.buttonText}>Inserir coordenadas</ThemedText>
            </Pressable>
          </ThemedView>

          {error ? (
            <ThemedText themeColor="textSecondary" style={styles.error}>
              {error}
            </ThemedText>
          ) : null}

          <ThemedView type="backgroundElement" style={styles.dataBox}>
            {data ? (
              <ThemedText type="code" style={styles.jsonText}>
                {JSON.stringify(data, null, 2)}
              </ThemedText>
            ) : (
              <ThemedText themeColor="textSecondary" style={styles.placeholder}>
                {loading ? 'Buscando...' : 'Pressione um botão'}
              </ThemedText>
            )}
          </ThemedView>
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={coordsModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCoordsModalOpen(false)}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalContent}>
            <ThemedText type="subtitle">Inserir coordenadas</ThemedText>

            <TextInput
              style={styles.input}
              placeholder="Latitude"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={latInput}
              onChangeText={setLatInput}
            />
            <TextInput
              style={styles.input}
              placeholder="Longitude"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={lonInput}
              onChangeText={setLonInput}
            />

            <ThemedView style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalBtn,
                  styles.modalBtnCancel,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => {
                  setCoordsModalOpen(false);
                  setLatInput('');
                  setLonInput('');
                }}
              >
                <ThemedText>Cancelar</ThemedText>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalBtn,
                  styles.modalBtnConfirm,
                  pressed && styles.buttonPressed,
                ]}
                onPress={fetchManualCoords}
              >
                <ThemedText>Buscar</ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.three,
    alignItems: 'center',
    paddingBottom: BottomTabInset + Spacing.six,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#eb6e4b',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  error: {
    textAlign: 'center',
  },
  dataBox: {
    alignSelf: 'stretch',
    padding: Spacing.three,
    borderRadius: Spacing.two,
    minHeight: 100,
  },
  jsonText: {
    fontSize: 11,
    lineHeight: 16,
  },
  placeholder: {
    textAlign: 'center',
    paddingVertical: Spacing.four,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: Spacing.one,
    padding: Spacing.two,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  modalBtn: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
  },
  modalBtnCancel: {
    backgroundColor: '#ccc',
  },
  modalBtnConfirm: {
    backgroundColor: '#eb6e4b',
  },
});
