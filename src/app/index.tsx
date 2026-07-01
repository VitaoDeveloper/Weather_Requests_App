import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchByCity, fetchByCoords } from '@/api/weather';
import type { ApiResponse } from '@/types/ApiResponse';
import type { ModalProps } from '@/types/ModalProps';
import { parseApiError, ApiError } from '@/utils/parseApiError';
import { SendResponse } from '@/utils/sendResponse';
import { getKey } from '@/utils/keyStore';
import { DataTable } from '@/components/DataTable';
import { HistoryModal } from '@/components/HistoryModal';
import { KeySetupModal } from '@/components/KeySetupModal';
import { Logo } from '@/components/Logo';
import { Modal } from '@/components/Modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';

export default function WeatherScreen() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(0); // 0=none, 1=coords, 2=manual, 3=city
  const [coords, setCoords] = useState({ lat: 0, lon: 0 });
  const [modalsOpen, setModalsOpen] = useState([false, false]);
  const [historyOpen, setHistoryOpen] = useState(false);

  // BYOK state
  const [keyReady, setKeyReady] = useState<boolean | null>(null); // null = checking
  const [keySetupOpen, setKeySetupOpen] = useState(false);
  const [currentKey, setCurrentKey] = useState<string | undefined>();
  const [keyMgmtOpen, setKeyMgmtOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const has = await getKey();
      setKeyReady(!!has);
      if (has) setCurrentKey(has ?? undefined);
      if (!has) setKeySetupOpen(true);
    })();
  }, []);

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
          setError(t('errors.geoNotSupported'));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
          (err) => setError(t('errors.geoFailed', { message: err.message })),
        );
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError(t('errors.geoDenied'));
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setCoords({ lat: loc.coords.latitude, lon: loc.coords.longitude });
    })();
  }, [t]);

  const handleApiError = useCallback((err: unknown) => {
    if (err instanceof ApiError && err.status === 401) {
      setError(t('byokErrors.keyRevoked'));
      setKeySetupOpen(true);
      return;
    }
    setError(parseApiError(err));
  }, [t]);

  const fetchCurrent = useCallback(async () => {
    setLoading(1);
    setError(null);
    setData(null);
    try {
      const res = await fetchByCoords(coords.lat, coords.lon);
      setData(res);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(0);
    }
  }, [coords, handleApiError]);

  const fetchByEnterCoords: ModalProps['onSubmit'] = async (...args) => {
    setLoading(2);
    setError(null);
    setData(null);
    try {
      const [lat, lon] = args as [number, number];
      const res = await fetchByCoords(lat, lon);
      setData(res);
    } catch (err) {
      handleApiError(err);
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
      handleApiError(err);
    } finally {
      setLoading(0);
    }
  };

  const handleKeySetupDone = useCallback(async () => {
    setKeyReady(true);
    setKeySetupOpen(false);
    setKeyMgmtOpen(false);
    const k = await getKey();
    setCurrentKey(k ?? undefined);
  }, []);

  const handleKeyMgmtClose = useCallback(() => {
    setKeyMgmtOpen(false);
  }, []);

  const isLoading = loading > 0;

  // Don't render anything until we know key state
  if (keyReady === null) return null;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Logo size={200} />

          <ThemedText type="title" style={styles.title}>
            {t('app.title')}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            {t('app.description')}
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
                <ThemedText style={styles.buttonText}>{t('buttons.currentCoords')}</ThemedText>
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
              <ThemedText style={styles.buttonText}>{t('buttons.enterCoords')}</ThemedText>
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
              <ThemedText style={styles.buttonText}>{t('buttons.searchCity')}</ThemedText>
            </Pressable>
          </ThemedView>

          <ThemedView style={styles.toggleRow}>
            <ThemedText type="small">{t('toggle.saveResponses')}</ThemedText>
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
            <ThemedText style={styles.historyBtnText}>{t('history.btn')}</ThemedText>
          </Pressable>

          {/* Key management row */}
          {currentKey ? (
            <Pressable
              style={({ pressed }) => [styles.keyMgmtBtn, pressed && styles.buttonPressed]}
              onPress={() => setKeyMgmtOpen(true)}
            >
              <ThemedText style={styles.keyMgmtText}>
                {t('byok.currentKey', { masked: maskKey(currentKey) })}
              </ThemedText>
            </Pressable>
          ) : null}

          <ThemedView style={styles.langRow}>
            {(['en', 'pt', 'ru'] as const).map((l) => (
              <Pressable
                key={l}
                style={({ pressed }) => [
                  styles.langBtn,
                  i18n.language?.startsWith(l) && styles.langBtnActive,
                  pressed && styles.langBtnPressed,
                ]}
                onPress={() => i18n.changeLanguage(l)}
              >
                <ThemedText
                  style={[
                    styles.langBtnText,
                    i18n.language?.startsWith(l) && styles.langBtnTextActive,
                  ]}
                >
                  {l.toUpperCase()}
                </ThemedText>
              </Pressable>
            ))}
          </ThemedView>

          {error ? (
            <ThemedView type="backgroundElement" style={styles.errorBox}>
              <ThemedText themeColor="textSecondary">{error}</ThemedText>
            </ThemedView>
          ) : null}

          {data ? (
            <DataTable
              rows={[
                { name: t('table.temperature'), data: `${data.main.temp} °C` },
                { name: t('table.feelsLike'), data: `${data.main.feels_like} °C` },
                { name: t('table.weather'), data: data.weather[0].description },
                {
                  name: t('table.city'),
                  data: data.name
                    ? `${data.name} — ${data.sys.country}`
                    : t('app.notFound'),
                },
                { name: t('table.coordenates'), data: `${data.coord.lat}, ${data.coord.lon}` },
              ]}
            />
          ) : isLoading ? (
            <ThemedText themeColor="textSecondary" style={styles.placeholder}>
              {t('app.loading')}
            </ThemedText>
          ) : (
            <ThemedText themeColor="textSecondary" style={styles.placeholder}>
              {t('app.tapButton')}
            </ThemedText>
          )}
        </ScrollView>
      </SafeAreaView>

      <Modal
        open={modalsOpen[0]}
        title={t('modal.enterCoordsTitle')}
        onClose={() => setModalsOpen([false, false])}
        onSubmit={fetchByEnterCoords}
        inputs={[
          { label: t('fields.latitude'), placeholder: t('placeholders.latitude'), type: 'number' },
          { label: t('fields.longitude'), placeholder: t('placeholders.longitude'), type: 'number' },
        ]}
      />

      <Modal
        open={modalsOpen[1]}
        title={t('modal.enterCityTitle')}
        onClose={() => setModalsOpen([false, false])}
        onSubmit={fetchByCityName}
        inputs={[
          { label: t('fields.cityName'), placeholder: t('placeholders.cityName'), type: 'text' },
        ]}
      />

      <HistoryModal open={historyOpen} onClose={() => setHistoryOpen(false)} />

      <KeySetupModal
        open={keySetupOpen}
        onboarding={!currentKey}
        currentKey={currentKey}
        onDone={handleKeySetupDone}
        onClose={() => setKeySetupOpen(false)}
      />

      <KeySetupModal
        open={keyMgmtOpen}
        onboarding={false}
        currentKey={currentKey}
        onDone={handleKeySetupDone}
        onClose={handleKeyMgmtClose}
      />
    </ThemedView>
  );
}

function maskKey(key: string): string {
  if (key.length <= 6) return '••••••';
  return '••••••••' + key.slice(-4);
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
  keyMgmtBtn: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  keyMgmtText: {
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
  langRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  langBtn: {
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
    borderRadius: 4,
  },
  langBtnActive: {
    backgroundColor: 'rgba(235, 110, 75, 0.15)',
  },
  langBtnPressed: {
    opacity: 0.6,
  },
  langBtnText: {
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }) as string,
    fontSize: 12,
    color: '#999',
  },
  langBtnTextActive: {
    color: '#eb6e4b',
    fontWeight: '700',
  },
});
