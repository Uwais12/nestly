import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { theme } from '@/constants/theme';

type CardProps = PropsWithChildren<ViewProps> & {
  padded?: boolean;
  elevated?: boolean;
  interactive?: boolean;
};

export function Card({ children, style, padded = false, elevated = true, interactive = false, ...rest }: CardProps) {
  return (
    <View
      {...rest}
      style={[
        styles.card,
        elevated && styles.elevated,
        interactive && styles.interactive,
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  elevated: {
    shadowColor: '#000',
    shadowOpacity: theme.shadowSm.opacity,
    shadowRadius: theme.shadowSm.radius,
    shadowOffset: { width: 0, height: theme.shadowSm.y },
  },
  interactive: {
    borderColor: 'rgba(255,255,255,0.08)',
  },
  padded: {
    padding: theme.spacing(2.5),
  },
});


