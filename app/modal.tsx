import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTasks } from '@/store/tasks-context';
import { formatDate } from '@/utils/date';

export default function ModalScreen() {
  const router = useRouter();
  const { tasks, removeTask, markTaskStatus } = useTasks();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedId, setSelectedId] = useState(' ');

  const recentTasks = tasks.filter((task) => task.status === 'completed');

  return (
    <View style={styles.container}>
      <Modal transparent visible={showConfirmModal} animationType="fade">
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Are you sure you want to delete this task?</Text>
            <View style={styles.confirmActions}>
              <Pressable onPress={() => setShowConfirmModal(false)} style={styles.cancel}>
                <Text style={styles.cancelText}>No</Text>
              </Pressable>
              <Pressable onPress={() => {removeTask(selectedId);
                                         setSelectedId(' ');
                                         setShowConfirmModal(false);
              }} style={styles.confirm}>
                <Text style={styles.confirmText}>Yes</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Text style={styles.title}>Recent Tasks</Text>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
      </View>

      {recentTasks.length === 0 ? (
        <Text style={styles.emptyText}>No tasks to display...</Text>
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
                onPress = { () => {setShowConfirmModal(true);
                                  setSelectedId(task.id)}
                 }
                style={styles.deleteButton}>
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
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
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 16, 26, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 18,
    boxShadow: '0 8 16 rgb(14 26 42 / 20%',
    elevation: 8,
  },
  confirmTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D2733',
    marginBottom: 10,
  },
  confirmActions: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancel: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(29,39,51,0.08)',
  },
  cancelText: {
    color: '#1D2733',
    fontWeight: '600',
  },
  confirm: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1D2733',
  },
  confirmText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
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
  deleteButton: {
    marginRight: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 115, 115, 0.2)',
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 12,
    color: '#B24040',
    fontWeight: '600',
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
    boxShadow: '0 8 16 rgb(14 26 42 / 20%',
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
    marginRight: 12,
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
