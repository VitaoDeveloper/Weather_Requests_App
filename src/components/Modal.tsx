import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal as RNModal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { FormatInputType } from '@/utils/formatInputType';
import type { ModalProps } from '@/types/ModalProps';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing } from '@/constants/theme';

export function Modal({ open, onClose, onSubmit, title, inputs }: ModalProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState<Record<string, string>>(
    () => Object.fromEntries((inputs ?? []).map((i) => [i.label, ''])),
  );

  const handleChange = (label: string, value: string) => {
    setValues((prev) => ({ ...prev, [label]: value }));
  };

  const handleSubmit = () => {
    if (inputs) {
      const args = inputs.map((i) => FormatInputType.format(i, values));
      onSubmit(...args);
      setValues(Object.fromEntries(inputs.map((i) => [i.label, ''])));
      onClose();
    }
  };

  return (
    <RNModal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ThemedView type="backgroundElement" style={styles.content}>
          {title ? <ThemedText type="subtitle">{title}</ThemedText> : null}

          <ScrollView>
            {inputs?.map((input) => (
              <ThemedView key={input.label} style={styles.field}>
                <ThemedText type="small">{input.label}</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder={input.placeholder}
                  placeholderTextColor="#999"
                  keyboardType={input.type === 'number' ? 'numeric' : 'default'}
                  value={values[input.label]}
                  onChangeText={(v) => handleChange(input.label, v)}
                />
              </ThemedView>
            ))}
          </ScrollView>

          <ThemedView style={styles.footer}>
            <Pressable
              style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
              onPress={onClose}
            >
              <ThemedText style={styles.btnText}>{t('modal.close')}</ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.btnConfirm, pressed && styles.btnPressed]}
              onPress={handleSubmit}
            >
              <ThemedText style={styles.btnConfirmText}>{t('modal.submit')}</ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </KeyboardAvoidingView>
    </RNModal>
  );
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
    maxWidth: 400,
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.half,
    marginBottom: Spacing.two,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: Spacing.two,
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
});
