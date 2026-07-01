import { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal as RNModal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { validateKey } from '@/api/weather';
import { setKey, removeKey } from '@/utils/keyStore';
import { parseApiError, ApiError } from '@/utils/parseApiError';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing } from '@/constants/theme';

interface Props {
  open: boolean;
  /** true = first-time onboarding, false = user-initiated from settings */
  onboarding: boolean;
  currentKey?: string;
  onDone: () => void;
  onClose: () => void;
}

export function KeySetupModal({ open, onboarding, currentKey, onDone, onClose }: Props) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const handleSave = async () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setSaving(true);
    setError(null);
    try {
      const valid = await validateKey(trimmed);
      if (!valid) {
        setError(t('byokErrors.invalid'));
        setSaving(false);
        return;
      }
      await setKey(trimmed);
      onDone();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError(t('byokErrors.invalid'));
      } else {
        setError(parseApiError(err));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    await removeKey();
    onDone();
    onClose();
  };

  return (
    <RNModal visible={open} transparent animationType="fade" onRequestClose={onboarding ? undefined : onClose}>
      <ThemedView style={styles.overlay}>
        <ThemedView type="backgroundElement" style={styles.content}>
          <ThemedText type="subtitle" style={styles.title}>
            {onboarding ? t('byok.title') : t('byok.changeTitle')}
          </ThemedText>

          {!onboarding && currentKey ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.currentKey}>
              {t('byok.currentKey', { masked: maskKey(currentKey) })}
            </ThemedText>
          ) : null}

          <ThemedText type="small" themeColor="textSecondary" style={styles.desc}>
            {t('byok.description')}
          </ThemedText>

          <Pressable onPress={() => Linking.openURL('https://home.openweathermap.org/users/sign_up')}>
            <ThemedText type="linkPrimary" style={styles.link}>
              {t('byok.registerLink')}
            </ThemedText>
          </Pressable>

          <ThemedView style={styles.field}>
            <ThemedText type="small">{t('byok.label')}</ThemedText>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={(v) => { setValue(v); setError(null); }}
              placeholder={t('byok.placeholder')}
              placeholderTextColor="#999"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!saving}
            />
          </ThemedView>

          {error ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.error}>
              {error}
            </ThemedText>
          ) : null}

          <ThemedView style={styles.footer}>
            {!onboarding ? (
              <Pressable
                style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
                onPress={onClose}
              >
                <ThemedText style={styles.btnText}>{t('byok.cancel')}</ThemedText>
              </Pressable>
            ) : null}

            <Pressable
              style={({ pressed }) => [styles.btnConfirm, pressed && styles.btnPressed, saving && styles.btnDisabled]}
              onPress={handleSave}
              disabled={saving || !value.trim()}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#eb6e4b" />
              ) : (
                <ThemedText style={styles.btnConfirmText}>{t('byok.save')}</ThemedText>
              )}
            </Pressable>
          </ThemedView>

          {!onboarding && currentKey && !showRemoveConfirm ? (
            <Pressable
              style={({ pressed }) => [styles.removeBtn, pressed && styles.btnPressed]}
              onPress={() => setShowRemoveConfirm(true)}
            >
              <ThemedText style={styles.removeBtnText}>{t('byok.remove')}</ThemedText>
            </Pressable>
          ) : null}

          {showRemoveConfirm ? (
            <ThemedView style={styles.removeConfirm}>
              <ThemedText type="small" themeColor="textSecondary">{t('byok.removeConfirm')}</ThemedText>
              <ThemedView style={styles.removeActions}>
                <Pressable
                  style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
                  onPress={() => setShowRemoveConfirm(false)}
                >
                  <ThemedText style={styles.btnText}>{t('byok.cancel')}</ThemedText>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.btnConfirm, pressed && styles.btnPressed]}
                  onPress={handleRemove}
                >
                  <ThemedText style={styles.btnConfirmText}>{t('byok.confirm')}</ThemedText>
                </Pressable>
              </ThemedView>
            </ThemedView>
          ) : null}
        </ThemedView>
      </ThemedView>
    </RNModal>
  );
}

function maskKey(key: string): string {
  if (key.length <= 6) return '••••••';
  return '••••••••' + key.slice(-4);
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
  title: {
    textAlign: 'center',
  },
  currentKey: {
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }) as string,
  },
  desc: {
    textAlign: 'center',
    lineHeight: 20,
  },
  link: {
    textAlign: 'center',
  },
  field: {
    gap: Spacing.half,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: Spacing.one,
    padding: Spacing.two,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }) as string,
  },
  error: {
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.2)',
  },
  btn: {
    paddingVertical: Spacing.two - 1,
    paddingHorizontal: Spacing.three,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  btnConfirm: {
    paddingVertical: Spacing.two - 1,
    paddingHorizontal: Spacing.three,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'rgba(235,110,75,0.1)',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnPressed: {
    borderColor: 'rgba(235,110,75,0.5)',
  },
  btnText: {
    color: '#eb6e4b',
    fontSize: 15,
  },
  btnConfirmText: {
    color: '#eb6e4b',
    fontSize: 15,
  },
  removeBtn: {
    alignSelf: 'center',
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
    borderRadius: 4,
  },
  removeBtnText: {
    color: '#ef4444',
    fontSize: 13,
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }) as string,
  },
  removeConfirm: {
    gap: Spacing.two,
  },
  removeActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
});
