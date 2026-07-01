import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchByCity, fetchByCoords } from '@/api/weather';
import type { ApiResponse } from '@/types/ApiResponse';
import type { ModalProps } from '@/types/ModalProps';
import { parseApiError } from '@/utils/parseApiError';
import { SendResponse } from '@/utils/sendResponse';
import { DataTable } from '@/components/DataTable';
import { HistoryModal } from '@/components/HistoryModal';
import { Logo } from '@/components/Logo';
import { Modal } from '@/components/Modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';

export default function WeatherScreen() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(0); // 0=none, 1=coords, 2=manual, 3=city
  const [coords, setCoords] = useState({ lat: 0, lon: 0 });
  const [modalsOpen, setModalsOpen] = useState([false, false]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [persistEnabled, setPersistEnabled] = useState(() => {
    if (typeof localStorage === 'undefined') return false;
    const stored = localStorage.getItem('WEATHER_PERSIST_ENABLED');
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('WEATHER_PERSIST_ENABLED', String(persistEnabled));
    }
  }, [persistEnabled]);

  useEffect(() => {
    if (!persistEnabled) return;
    if (data) SendResponse.send('SUCCESS', JSON.stringify(data));
    if (error) SendResponse.send('ERROR', error);
  }, [data, error, persistEnabled]);

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') {
        if (!navigator.geolocation) {
          setError('Geolocalização não é suportada pelo seu navegador.');
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
          (err) => setError(`Erro ao obter localização: ${err.message}`),
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

  const fetchCurrent = useCallback(async () => {
    setLoading(1);
    setError(null);
    setData(null);
    try {
      const res = await fetchByCoords(coords.lat, coords.lon);
      setData(res);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(0);
    }
  }, [coords]);

  const fetchByEnterCoords: ModalProps['onSubmit'] = async (...args) => {
    setLoading(2);
    setError(null);
    setData(null);
    try {
      const [lat, lon] = args as [number, number];
      const res = await fetchByCoords(lat, lon);
      setData(res);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(0);
    }
  };

  const fetchByCityName: ModalProps['onSubmit'] = async (...args) => {
    setLoading(3);
    setError(null);
    setData(null);
    try {
      const [name] = args as [string];
      const res = await fetchByCity(name);
      setData(res);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(0);
    }
  };

  const isLoading = loading > 0;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Logo size={200} />

          <ThemedText type="title" style={styles.title}>
            OpenWeather
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Use os botões abaixo para consultar o clima via API OpenWeather.
          </ThemedText>

          <ThemedView style={styles.buttonsRow}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled,
              ]}
              disabled={isLoading}
              onPress={fetchCurrent}
            >
              {isLoading && loading === 1 ? (
                <ActivityIndicator size="small" color="#eb6e4b" />
              ) : (
                <ThemedText style={styles.buttonText}>Coordenadas atuais</ThemedText>
              )}
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled,
              ]}
              disabled={isLoading}
              onPress={() => setModalsOpen([true, false])}
            >
              <ThemedText style={styles.buttonText}>Inserir coordenadas</ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled,
              ]}
              disabled={isLoading}
              onPress={() => setModalsOpen([false, true])}
            >
              <ThemedText style={styles.buttonText}>Buscar cidade</ThemedText>
            </Pressable>
          </ThemedView>

          <ThemedView style={styles.toggleRow}>
            <ThemedText type="small">Salvar respostas</ThemedText>
            <Switch
              value={persistEnabled}
              onValueChange={setPersistEnabled}
              trackColor={{ false: '#ccc', true: 'rgba(235,110,75,0.3)' }}
              thumbColor={persistEnabled ? '#eb6e4b' : '#f4f3f4'}
            />
          </ThemedView>

          <Pressable
            style={({ pressed }) => [styles.historyBtn, pressed && styles.buttonPressed]}
            onPress={() => setHistoryOpen(true)}
          >
            <ThemedText style={styles.historyBtnText}>Histórico</ThemedText>
          </Pressable>

          {error ? (
            <ThemedView type="backgroundElement" style={styles.errorBox}>
              <ThemedText themeColor="textSecondary">{error}</ThemedText>
            </ThemedView>
          ) : null}

          {data ? (
            <DataTable
              rows={[
                { name: 'Temperatura', data: `${data.main.temp} °C` },
                { name: 'Sensação', data: `${data.main.feels_like} °C` },
                { name: 'Clima', data: data.weather[0].description },
                {
                  name: 'Local',
                  data: data.name
                    ? `${data.name} — ${data.sys.country}`
                    : 'Não encontrado',
                },
                { name: 'Coordenadas', data: `${data.coord.lat}, ${data.coord.lon}` },
              ]}
            />
          ) : isLoading ? (
            <ThemedText themeColor="textSecondary" style={styles.placeholder}>
              Buscando...
            </ThemedText>
          ) : (
            <ThemedText themeColor="textSecondary" style={styles.placeholder}>
              Pressione um botão para buscar
            </ThemedText>
          )}
        </ScrollView>
      </SafeAreaView>

      <Modal
        open={modalsOpen[0]}
        title="Inserir coordenadas"
        onClose={() => setModalsOpen([false, false])}
        onSubmit={fetchByEnterCoords}
        inputs={[
          { label: 'Latitude', placeholder: 'Ex: -23.5505', type: 'number' },
          { label: 'Longitude', placeholder: 'Ex: -46.6333', type: 'number' },
        ]}
      />

      <Modal
        open={modalsOpen[1]}
        title="Buscar por cidade"
        onClose={() => setModalsOpen([false, false])}
        onSubmit={fetchByCityName}
        inputs={[
          { label: 'Cidade', placeholder: 'Ex: London, Tokyo', type: 'text' },
        ]}
      />
      <HistoryModal open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.five,
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
    paddingVertical: Spacing.one + 1,
    paddingHorizontal: Spacing.three,
    borderRadius: 5,
    minWidth: 130,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'rgba(235, 110, 75, 0.1)',
  },
  buttonPressed: {
    borderColor: 'rgba(235, 110, 75, 0.5)',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#eb6e4b',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }) as string,
    fontSize: 15,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  historyBtn: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  historyBtnText: {
    color: '#eb6e4b',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }) as string,
    fontSize: 13,
  },
  errorBox: {
    alignSelf: 'stretch',
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
  placeholder: {
    textAlign: 'center',
    paddingVertical: Spacing.four,
  },
});
