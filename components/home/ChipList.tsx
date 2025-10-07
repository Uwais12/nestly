import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { theme } from '@/constants/theme';
import { Chip } from '@/components/ui/Chip';
import { TAGS } from '@/lib/supabase';

export function ChipList({ selected, onToggle, compact = false }: { selected: string[]; onToggle: (tag: string) => void; compact?: boolean }) {
  const items = useMemo(() => TAGS.filter((t) => t !== 'Inbox'), []);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.row, compact && { paddingVertical: 6 }]}> 
      {items.map((tag) => {
        const isSelected = selected.includes(tag);
        return (
          <Chip
            key={tag}
            title={tag}
            onPress={() => onToggle(tag)}
            variant={isSelected ? 'solid' : 'glass'}
            style={{ marginRight: 8, borderRadius: 18 }}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({ row: { paddingHorizontal: 6, paddingVertical: 8 } });


