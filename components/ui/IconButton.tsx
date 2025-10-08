import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { theme } from '@/constants/theme';
import { TouchableOpacity, ViewStyle } from 'react-native';

export function IconButton({ name, onPress, style }: { name: IconSymbolName; onPress?: () => void; style?: ViewStyle }) {
  return (
    <TouchableOpacity accessibilityRole="button" onPress={onPress} style={[{ width: 36, height: 36, borderRadius: 12, backgroundColor: theme.colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border }, style]}>
      <IconSymbol name={name} size={18} color={theme.colors.text} />
    </TouchableOpacity>
  );
}


