import { Platform, StyleSheet, View } from 'react-native';

import type { TableRows } from '@/types/TableRows';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing } from '@/constants/theme';

export function DataTable({ rows }: TableRows) {
  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      {rows.map((row, i) => (
        <View key={row.name} style={[styles.row, i === rows.length - 1 && styles.rowLast]}>
          <ThemedText style={styles.cell}>{row.name}</ThemedText>
          <ThemedText style={styles.cellValue}>{row.data}</ThemedText>
        </View>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Spacing.two,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two + 6,
    paddingHorizontal: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  cell: {
    fontSize: 15,
  },
  cellValue: {
    fontSize: 15,
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }) as string,
    textAlign: 'right',
  },
});
