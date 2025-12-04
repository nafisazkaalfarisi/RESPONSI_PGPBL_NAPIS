import React, { ComponentProps } from 'react';
import { Text as DefaultText, View as DefaultView, StyleSheet } from 'react-native';

import { useThemeColor } from '../hooks/use-theme-color';

export type TextProps = ComponentProps<typeof DefaultText>;
export type ViewProps = ComponentProps<typeof DefaultView>;

export function Text(props: TextProps) {
  const { style, ...otherProps } = props;
  const color = useThemeColor({}, 'text');

  return <DefaultText style={[styles.defaultText, { color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, ...otherProps } = props;
  const backgroundColor = useThemeColor({}, 'background');

  return <DefaultView style={[styles.defaultView, { backgroundColor }, style]} {...otherProps} />;
}

const styles = StyleSheet.create({
  defaultText: {
    color: '#000000', // Default black color
  },
  defaultView: {
    padding: 0, // Default padding
  },
});
