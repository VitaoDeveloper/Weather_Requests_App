import { useEffect, useState } from 'react';
import {
  Modal as RNModal,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';

import type { ApiResponse } from '@/types/ApiResponse';
import type { StoredRecord } from '@/utils/sendResponse';
import { SendResponse } from '@/utils/sendResponse';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing } from '@/constants/theme';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function HistoryModal({ open, onClose }: Props) {
  const [records, setRecords] = useState<StoredRecord[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setRecords(SendResponse.getAll());
  }, [open]);

  return (
    <RNModal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <ThemedView style={styles.overlay}>
        <ThemedView type="backgroundElement" style={styles.content}>
          <ThemedView style={styles.header}>
            <ThemedText type="subtitle">Histórico</ThemedText>
            <Pressable onPress={onClose}>
              <ThemedText style={styles.closeBtn}>✕</ThemedText>
            </Pressable>
          </ThemedView>

          {records.length === 0 ? (
            <ThemedText themeColor="textSecondary" style={styles.empty}>
              Nenhum registro salvo.
            </ThemedText>
          ) : (
            <ScrollView style={styles.list}>
              {records.map((r) => (
                <ThemedView key={r.key} type="backgroundSelected" style={styles.item}>
                  <ThemedView style={styles.itemTop}>
                    <ThemedText
                      style={[
                        styles.badge,
                        { color: r.type === 'SUCCESS' ? '#22c55e' : '#ef4444' },
                      ]}
                    >
                      {r.type}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {new Date(r.timestamp).toLocaleString('pt-BR')}
                    </ThemedText>
                  </ThemedView>

                  {r.type === 'SUCCESS' ? (
                    <HistoryItemPreview value={r.value} />
                  ) : (
                    <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
                      {r.value}
                    </ThemedText>
                  )}
                </ThemedView>
              ))}
            </ScrollView>
          )}
        </ThemedView>
      </ThemedView>
    </RNModal>
  );
}

function HistoryItemPreview({ value }: { value: string }) {
  let data: ApiResponse | null = null;
  try {
    data = JSON.parse(value) as ApiResponse;
  } catch {
    return <ThemedText type="small">Erro ao decodificar resposta.</ThemedText>;
  }

  return (
    <ThemedView style={styles.preview}>
      <ThemedText type="smallBold" numberOfLines={1}>
        {data.name || '—'}{' '}
        <ThemedText type="small" themeColor="textSecondary">
          {data.sys?.country ?? ''}
        </ThemedText>
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {data.main?.temp ?? '?'} °C — {data.weather?.[0]?.description ?? '?'}
      </ThemedText>
    </ThemedView>
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
    maxWidth: 500,
    maxHeight: '80%',
    padding: Spacing.four,
    borderRadius: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  closeBtn: {
    fontSize: 22,
    padding: Spacing.one,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.six,
  },
  list: {
    maxHeight: 400,
  },
  item: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    marginBottom: Spacing.two,
    gap: Spacing.one,
  },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }) as string,
  },
  preview: {
    gap: Spacing.half,
  },
});
