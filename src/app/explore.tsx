import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchByCity } from '@/api/weather';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function SearchScreen() {
  const [cityName, setCityName] = useState('');
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!cityName.trim()) {
      setError('Insira um nome de cidade.');
      return;
    }
    setLoading(true);
    setError('');
    setData(null);
    try {
      const result = await fetchByCity(cityName.trim());
      setData(result);
    } catch {
      setError('Erro ao buscar. Verifique o nome da cidade e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="title" style={styles.title}>
            Buscar por cidade
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Digite o nome de uma cidade para consultar o clima.
          </ThemedText>

          <ThemedView style={styles.searchRow}>
            <TextInput
              style={styles.input}
              placeholder="Ex: London, Tokyo, São Paulo"
              placeholderTextColor="#999"
              value={cityName}
              onChangeText={setCityName}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
              disabled={loading}
              onPress={handleSearch}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>Buscar</ThemedText>
              )}
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
                {loading ? 'Buscando...' : 'Digite uma cidade e pressione Buscar'}
              </ThemedText>
            )}
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
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
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignSelf: 'stretch',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: Spacing.one,
    padding: Spacing.two,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#eb6e4b',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
    justifyContent: 'center',
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
});
