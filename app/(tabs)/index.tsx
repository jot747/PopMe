import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bubble } from '@/components/Bubble';
import { BubbleInput } from '@/components/BubbleInput';
import { EditTaskModal } from '@/components/EditTaskModal';
import { FilterModal, FilterOrderings, Filters } from '@/components/FilterModal';
import { useTasks } from '@/store/tasks-context';
import { Task } from '@/types/task';
import { getBubbleSize, getEnergyColors } from '@/utils/bubble';
import { layoutBubbles } from '@/utils/layout';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tasks, addTask, updateTask, markTaskStatus, addSubtask, removeSubtask } = useTasks();

  const [inputValue, setInputValue] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filter, setFilter] = useState("None");
  const [filterOrder, setFilterOrder] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fieldSize, setFieldSize] = useState({ width: 0, height: 0 });
  const [fieldOrigin, setFieldOrigin] = useState({ x: 0, y: 0 });
  const [addAnchor, setAddAnchor] = useState<{ x: number; y: number } | null>(null);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  const activeTasks = useMemo(
    () => {switch (filter) {
      case Filters.NONE:
        return tasks.filter((task) => task.status === 'active')
      case Filters.DATE:
        return tasks.filter((task) => task.status === 'active')
                    .filter((task) => { if (task.dueDate !== null) {
                                          let date = new Date(task.dueDate);
                                          let now = new Date();
                                          if (filterOrder === FilterOrderings.ASCENDING) {
                                            return date.getDate() - now.getDate() < 7;
                                          } 
                                          else {
                                            return date.getDate() - now.getDate() > 7;
                                          }
                                          }
                                      });
                    /*.sort((a, b) => {  if (a.dueDate === null) {
                                  return 1;
                                }
                                if (b.dueDate === null) {
                                  return -1;
                                }
                                if (a.dueDate < b.dueDate) {
                                  return -1 * filterOrder;
                                } 
                                if (a.dueDate > b.dueDate) {
                                  return 1 * filterOrder;
                                }
                                return 0;
                              });*/
      case Filters.PRIORITY:
        return tasks.filter((task) => task.status === 'active')
                    .filter((task) => filterOrder === FilterOrderings.ASCENDING ? task.priority < 3 : task.priority > 3);
                    //.sort((a, b) => (a.priority - b.priority) * filterOrder);
      case Filters.ENERGY:
        return tasks.filter((task) => task.status === 'active')
                    .filter((task) => filterOrder === FilterOrderings.ASCENDING ? task.energy < 3 : task.energy > 3);
                    //.sort((a, b) => (a.energy - b.energy) * filterOrder);
      default:
        return tasks.filter((task) => task.status === 'active');
      }
    },
    [filter, filterOrder, tasks]
  );

  const editingTask = useMemo(
    () => tasks.find((task) => task.id === editingId) ?? null,
    [editingId, tasks]
  );

  const resetFilter = () => {
    setFilter(Filters.NONE);
    setFilterOrder(0);
  }

  const handleFieldLayout = (event: LayoutChangeEvent) => {
    const { width, height, x, y } = event.nativeEvent.layout;
    setFieldSize({ width, height });
    setFieldOrigin({ x, y });
  };

  const handleAddTask = () => {
    if (!inputValue.trim()) return;
    const id = addTask(inputValue.trim());
    setInputValue('');
    setShowAddModal(false);
    setLastAddedId(id);
    setTimeout(() => setLastAddedId(null), 500);
    resetFilter();
  };

  const positions = useMemo(() => {
    if (!fieldSize.width || !fieldSize.height) return new Map<string, { left: number; top: number }>();
    return layoutBubbles(activeTasks, fieldSize.width, fieldSize.height, 14);
  }, [activeTasks, fieldSize.height, fieldSize.width]);

  const renderBubble = (task: Task) => {
    const size = getBubbleSize(task.priority);
    const pos = positions.get(task.id);
    const left = pos?.left ?? 10;
    const top = pos?.top ?? 10;
    const spawnOffset =
      task.id === lastAddedId && addAnchor
        ? {
            x: addAnchor.x - (left + size / 2),
            y: addAnchor.y - (top + size / 2),
          }
        : null;

    return (
      <Bubble
        key={task.id}
        title={task.title}
        size={size}
        colors={getEnergyColors(task.energy)}
        subtasks={task.subtasks}
        selected={selectedId === task.id}
        onPress={() => {setSelectedId(task.id);
                        setEditingId(task.id)}}
        onPop={() => markTaskStatus(task.id, 'completed')}
        spawnOffset={spawnOffset}
        style={{ position: 'absolute', left, top }}
      />
    );
  };

  return (
    <LinearGradient
      colors={['#F9FBFF', '#DDEBFF']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}> 
        <View>
          <Text style={styles.title}>PopMe</Text>
        </View>
        <View style = {styles.cornerButtonContainer}>
        <Pressable onPress={() => {resetFilter(), router.push('/modal')}} style={styles.cornerButton}>
          <Text style={styles.cornerText}>Recent Tasks</Text>
        </Pressable>
        <Pressable onPress={() => setShowFilterModal(true)} style={styles.cornerButton}>
          <Text style={styles.cornerText}>Apply filter</Text>
        </Pressable>
        </View>
      </View>

      <View style={styles.field} onLayout={handleFieldLayout}>
        <View style={styles.glowBlob} />
        <View style={styles.glowBlobAlt} />
        {activeTasks.map(renderBubble)}
        {!activeTasks.length && (
          <Text style={styles.emptyText}>Add your first task in the bubble below.</Text>
        )}
      </View>

      <BubbleInput
        label="Tap to add a task"
        onPress={() => setShowAddModal(true)}
        onLayout={(event) => {
          const { x, y, width, height } = event.nativeEvent.layout;
          setAddAnchor({
            x: x - fieldOrigin.x + width / 2,
            y: y - fieldOrigin.y + height / 2,
          });
        }}
      />

      <Modal transparent visible={showAddModal} animationType="fade">
        <View style={styles.addOverlay}>
          <View style={styles.addCard}>
            <Text style={styles.addTitle}>New task</Text>
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Name your task"
              placeholderTextColor="rgba(29,39,51,0.4)"
              style={styles.addInput}
              autoFocus
            />
            <View style={styles.addActions}>
              <Pressable onPress={() => setShowAddModal(false)} style={styles.addCancel}>
                <Text style={styles.addCancelText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleAddTask} style={styles.addConfirm}>
                <Text style={styles.addConfirmText}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <EditTaskModal
        visible={!!editingTask}
        task={editingTask}
        onClose={() => setEditingId(null)}
        onSave={(taskId, updates) => updateTask(taskId, updates)}
        onComplete={(taskId) => {
          markTaskStatus(taskId, 'completed');
          setEditingId(null);
        }}
        onAddSubtask={addSubtask}
        onRemoveSubtask={removeSubtask}
      />

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onSave={(filter, order) => {setFilter(filter);
                                    setFilterOrder(order);
                                   }
               }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 22,  
    justifyContent: "space-between",
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D2733',
  },
  cornerButtonContainer: {
    flexDirection: 'row',
  },
  cornerButton: {
    marginRight: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(29, 39, 51, 0.08)',
    alignItems: 'center',
    alignSelf: "flex-end"
  },
  cornerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D2733',
    letterSpacing: 0.6,
  },
  field: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 100,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.45)',
    overflow: 'hidden',
  },
  glowBlob: {
    position: 'absolute',
    top: 30,
    left: 10,
    width: 180,
    height: 180,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 199, 173, 0.35)',
    opacity: 0.7,
  },
  glowBlobAlt: {
    position: 'absolute',
    bottom: 20,
    right: -10,
    width: 220,
    height: 220,
    borderRadius: 120,
    backgroundColor: 'rgba(153, 210, 255, 0.3)',
  },
  emptyText: {
    position: 'absolute',
    alignSelf: 'center',
    top: '45%',
    color: '#6B7C93',
    fontSize: 14,
  },
  addOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 16, 26, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  addCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 18,
    boxShadow: '0 8 16 rgb(14 26 42 / 20%',
    elevation: 8,
  },
  addTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D2733',
    marginBottom: 10,
  },
  addInput: {
    borderRadius: 14,
    backgroundColor: 'rgba(29,39,51,0.06)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1D2733',
  },
  addActions: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  addCancel: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(29,39,51,0.08)',
  },
  addCancelText: {
    color: '#1D2733',
    fontWeight: '600',
  },
  addConfirm: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1D2733',
  },
  addConfirmText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
