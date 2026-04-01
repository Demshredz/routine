import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';

interface NowIndicatorProps {
  themeColor: string;
}

export const NowIndicator = React.memo(({ themeColor }: NowIndicatorProps) => {
  return (
    <View style={styles.container}>
      <MotiView
        from={{ scale: 0.8, opacity: 0.5 }}
        animate={{ scale: 1.2, opacity: 1 }}
        transition={{ type: 'timing', duration: 1500, loop: true }}
        style={[styles.dot, { backgroundColor: themeColor }]}
      />
      <View style={[styles.line, { backgroundColor: themeColor }]} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 2,
    marginVertical: 4,
    zIndex: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: -5,
  },
  line: {
    flex: 1,
    height: 2,
  },
});
