import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { Chip } from '@/components/ui/Chip';
import { TAGS } from '@/lib/supabase';

type Props = { selected: string[]; onToggle: (tag: string) => void; compact?: boolean };

export function ChipList({ selected, onToggle, compact = false }: Props) {
  const items = useMemo(() => TAGS.filter((t) => t !== 'Inbox'), []);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, compact && { paddingVertical: 6 }]}
    >
      {items.map((tag) => {
        const isSelected = selected.includes(tag);
        return (
          <Chip
            key={tag}
            title={tag}
            onPress={() => onToggle(tag)}
            selected={isSelected}
            variant={isSelected ? 'solid' : 'glass'}
            compact={compact}
            style={styles.chip}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 6, paddingVertical: 8, gap: 8 },
  chip: { marginRight: 10, borderRadius: theme.chip.radius },
});


