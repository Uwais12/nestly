import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { theme } from '@/constants/theme';
import { TouchableOpacity, ViewStyle } from 'react-native';

export function IconButton({ name, onPress, style }: { name: IconSymbolName; onPress?: () => void; style?: ViewStyle }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        {
          width: 38,
          height: 38,
          borderRadius: 14,
          backgroundColor: theme.colors.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: theme.colors.borderSubtle,
          shadowColor: '#000',
          shadowOpacity: 0.18,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
        },
        style,
      ]}
    >
      <IconSymbol name={name} size={18} color={theme.colors.text} />
    </TouchableOpacity>
  );
}


