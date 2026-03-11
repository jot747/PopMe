import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Subtask } from '@/types/task';

export const SubtaskBubbles = ({ subtasks }: { subtasks: Subtask[] }) => {
  if (!subtasks.length) return null;

  return (
    <View style={styles.container}>
      {subtasks.slice(0, 4).map((subtask) => (
        <View key={subtask.id} style={[styles.bubble, subtask.completed && styles.completed]}>
          <Text numberOfLines={1} style={styles.text}>
            {subtask.title}
          </Text>
        </View>
      ))}
      {subtasks.length > 4 && (
        <View style={[styles.bubble, styles.moreBubble]}>
          <Text style={styles.text}>+{subtasks.length - 4}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  bubble: {
    minWidth: 48,
    maxWidth: 92,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(29, 39, 51, 0.1)',
  },
  completed: {
    opacity: 0.55,
  },
  moreBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  text: {
    fontSize: 11,
    color: '#1D2733',
  },
});
