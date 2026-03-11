import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useTasks } from '@/store/tasks-context';
import { formatDate } from '@/utils/date';

export default function ModalScreen() {
  const router = useRouter();
  const { tasks, markTaskStatus } = useTasks();

  const recentTasks = tasks.filter((task) => task.status !== 'active');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Tasks</Text>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
      </View>

      {recentTasks.length === 0 ? (
        <Text style={styles.emptyText}>No recent tasks yet.</Text>
      ) : (
        <View style={styles.list}>
          {recentTasks.map((task) => (
            <View key={task.id} style={styles.row}>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>{task.title}</Text>
                <Text style={styles.rowMeta}>
                  {task.status.toUpperCase()} · {formatDate(task.dueDate)}
                </Text>
              </View>
              <Pressable
                onPress={() => markTaskStatus(task.id, 'active')}
                style={styles.restoreButton}>
                <Text style={styles.restoreText}>Restore</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
    backgroundColor: '#F4F7FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1D2733',
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(29,39,51,0.08)',
  },
  closeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D2733',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7C93',
  },
  list: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0E1A2A',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  rowInfo: {
    flex: 1,
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1D2733',
    marginBottom: 4,
  },
  rowMeta: {
    fontSize: 12,
    color: '#6B7C93',
  },
  restoreButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(29,39,51,0.08)',
  },
  restoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D2733',
  },
});
