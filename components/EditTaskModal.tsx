import Slider from '@react-native-community/slider';
import { BlurView } from 'expo-blur';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Bubble } from '@/components/Bubble';
import { Subtask, Task } from '@/types/task';
import { getBubbleSize, getEnergyColors } from '@/utils/bubble';
import { formatDate, toIsoDate } from '@/utils/date';

export type EditTaskModalProps = {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (taskId: string, updates: Partial<Task>) => void;
  onComplete: (taskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onRemoveSubtask: (taskId: string, subtaskId: string) => void;
};

export const EditTaskModal = ({
  visible,
  task,
  onClose,
  onSave,
  onComplete,
  onAddSubtask,
  onRemoveSubtask,
}: EditTaskModalProps) => {
  const [draftTitle, setDraftTitle] = useState('');
  const [draftPriority, setDraftPriority] = useState(3);
  const [draftEnergy, setDraftEnergy] = useState(3);
  const [draftDueDate, setDraftDueDate] = useState<Date | null>(null);
  const [draftSubtasks, setDraftSubtasks] = useState<Subtask[]>([]);
  const [subtaskDraft, setSubtaskDraft] = useState('');
  const [showSubtaskPrompt, setShowSubtaskPrompt] = useState(false);
  const [showDatePrompt, setShowDatePrompt] = useState(false);
  const [dateDraft, setDateDraft] = useState('');

  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!task || !visible) return;
    setDraftTitle(task.title);
    setDraftPriority(task.priority);
    setDraftEnergy(task.energy);
    setDraftDueDate(task.dueDate ? new Date(task.dueDate) : null);
    setDraftSubtasks(task.subtasks);
    setSubtaskDraft('');
    setShowSubtaskPrompt(false);
    setShowDatePrompt(false);
    setDateDraft(task.dueDate ? task.dueDate.slice(0, 10) : '');
  }, [task?.id, visible]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      ]).start();
    } else {
      opacity.setValue(0);
      scale.setValue(0.85);
    }
  }, [opacity, scale, visible]);

  const previewSize = getBubbleSize(draftPriority) + 18;
  const previewColors = useMemo(() => getEnergyColors(draftEnergy), [draftEnergy]);

  const applyQuickDate = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    setDraftDueDate(date);
    setDateDraft(date.toISOString().slice(0, 10));
  };

  const applyTypedDate = () => {
    const trimmed = dateDraft.trim();
    if (!trimmed) {
      setDraftDueDate(null);
      setShowDatePrompt(false);
      return;
    }
    const parts = trimmed.split('-').map((part) => Number(part));
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return;
    const [year, month, day] = parts;
    const date = new Date(year, month - 1, day);
    if (Number.isNaN(date.getTime())) return;
    setDraftDueDate(date);
    setShowDatePrompt(false);
  };

  if (!task) return null;

  const handleSave = () => {
    onSave(task.id, {
      title: draftTitle.trim() || task.title,
      subtasks: draftSubtasks,
      priority: draftPriority,
      energy: draftEnergy,
      dueDate: draftDueDate ? toIsoDate(draftDueDate) : null,
    });
    onClose();
  };

  const handleAddSubtask = () => {
    if (task.subtasks.length >= 6) return;
    const title = subtaskDraft.trim() || `Subtask ${task.subtasks.length + 1}`;
    setDraftSubtasks([...draftSubtasks, { id: `sub-${Date.now()}`, title: title, completed: false },]);
    setSubtaskDraft('');
    setShowSubtaskPrompt(false);
  };

  const handleRemoveSubtask = (subtaskId: string) => {
    setDraftSubtasks(draftSubtasks.filter((sub) => sub.id !== subtaskId));
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={60} tint="light" style={styles.blur} />
        <View style={styles.stage}>
          <Animated.View style={[styles.previewDock, { opacity, transform: [{ scale }] }]}>
            <Bubble
              title={draftTitle || 'Untitled'}
              size={previewSize}
              colors={previewColors}
              subtasks={draftSubtasks}
              floating={false}
            />
            <Pressable style={styles.addSubtaskBubble} onPress={() => setShowSubtaskPrompt(true)}>
              <Text style={styles.addSubtaskText}>+</Text>
            </Pressable>
          </Animated.View>

          <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
            <View style={styles.header}>
              <Text style={styles.title}>Edit Task</Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>Discard changes</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.body}
              contentContainerStyle={styles.bodyContent}
              showsVerticalScrollIndicator={false}>
              <View style={styles.fieldColumn}>
                <Text style={styles.label}>Task name</Text>
                <TextInput
                  value={draftTitle}
                  onChangeText={setDraftTitle}
                  style={styles.input}
                  placeholder="Rename task"
                  placeholderTextColor="rgba(29,39,51,0.4)"
                />

                <Text style={styles.label}>Subtasks</Text>
                {draftSubtasks.slice(0, 6).map((subtask) => {
                  const label = subtask.title.trim() || '...';

                  return (
                    <View style={styles.row}>
                      <TextInput
                        key={subtask.id}
                        value={subtask.title}
                        onChangeText={(input) => 
                          setDraftSubtasks(draftSubtasks.map((sub) => 
                            sub.id === subtask.id ? 
                            {...subtask, title: input}
                            : sub))
                          }
                        style={styles.input}
                        placeholder="Rename subtask"
                        placeholderTextColor="rgba(29,39,51,0.4)"
                      />
                      <Pressable
                        onPress = { () => handleRemoveSubtask(subtask.id) }
                        style={styles.closeButton}>
                        <Text style={styles.closeText}>Pop!</Text>
                      </Pressable>
                    </View>
                  );
                })}
                {draftSubtasks.length < 6 &&
                <TextInput
                  value={subtaskDraft}
                  onChangeText={setSubtaskDraft}
                  onSubmitEditing={handleAddSubtask}
                  style={styles.input}
                  placeholder="Add a subtask"
                  placeholderTextColor="rgba(29,39,51,0.4)"
                />}

              <Text style={styles.label}>Due date</Text>
              <Pressable onPress={() => setShowDatePrompt(true)} style={styles.dateButton}>
                <Text style={styles.dateText}>
                  {formatDate(draftDueDate?.toISOString() ?? null)}
                </Text>
              </Pressable>
              <View style={styles.quickDatesRow}>
                <Pressable onPress={() => applyQuickDate(0)} style={styles.quickDateChip}>
                  <Text style={styles.quickDateText}>Today</Text>
                </Pressable>
                <Pressable onPress={() => applyQuickDate(1)} style={styles.quickDateChip}>
                  <Text style={styles.quickDateText}>Tomorrow</Text>
                </Pressable>
                <Pressable onPress={() => applyQuickDate(7)} style={styles.quickDateChip}>
                  <Text style={styles.quickDateText}>Next Week</Text>
                </Pressable>
                <Pressable onPress={() => setDraftDueDate(null)} style={styles.quickDateChip}>
                  <Text style={styles.quickDateText}>Clear</Text>
                </Pressable>
              </View>

            </View>

              <View style={styles.sliderBlock}>
                <Text style={styles.label}>Priority</Text>
                <Slider
                  minimumValue={1}
                  maximumValue={5}
                  step={1}
                  value={draftPriority}
                  onValueChange={setDraftPriority}
                  minimumTrackTintColor="#1D2733"
                  maximumTrackTintColor="rgba(29,39,51,0.2)"
                  thumbTintColor="#1D2733"
                  style={styles.slider}
                />
                <Text style={styles.sliderCaption}>Bigger bubble means higher priority.</Text>
              </View>

              <View style={styles.sliderBlock}>
                <Text style={styles.label}>Energy</Text>
                <Slider
                  minimumValue={1}
                  maximumValue={5}
                  step={1}
                  value={draftEnergy}
                  onValueChange={setDraftEnergy}
                  minimumTrackTintColor="#FF8F7A"
                  maximumTrackTintColor="rgba(29,39,51,0.2)"
                  thumbTintColor="#FF8F7A"
                  style={styles.slider}
                />
                <Text style={styles.sliderCaption}>Calm to vibrant color range.</Text>
              </View>

            </ScrollView>

            <View style={styles.footer}>
              <Pressable onPress={() => onComplete(task.id)} style={styles.discardButton}>
                <Text style={styles.discardText}>Pop bubble!</Text>
              </Pressable>
              <Pressable onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.saveText}>Save changes</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>

        {showDatePrompt && (
          <Modal transparent animationType="fade">
            <View style={styles.pickerOverlay}>
              <View style={styles.pickerCard}>
                <Text style={styles.promptTitle}>Set due date</Text>
                <TextInput
                  value={dateDraft}
                  onChangeText={setDateDraft}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="rgba(29,39,51,0.4)"
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType={Platform.select({ ios: 'numbers-and-punctuation', android: 'numeric' })}
                />
                <View style={styles.datePromptActions}>
                  <Pressable onPress={() => setShowDatePrompt(false)} style={styles.promptCancel}>
                    <Text style={styles.promptCancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={applyTypedDate} style={styles.promptAdd}>
                    <Text style={styles.promptAddText}>Set</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {showSubtaskPrompt && (
          <Modal transparent animationType="fade">
            <View style={styles.pickerOverlay}>
              <View style={styles.pickerCard}>
                <Text style={styles.promptTitle}>New subtask</Text>
                <TextInput
                  value={subtaskDraft}
                  onChangeText={setSubtaskDraft}
                  placeholder="Name your subtask"
                  placeholderTextColor="rgba(29,39,51,0.4)"
                  style={styles.input}
                  autoFocus
                />
                <View style={styles.promptActions}>
                  <Pressable onPress={() => setShowSubtaskPrompt(false)} style={styles.promptCancel}>
                    <Text style={styles.promptCancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={handleAddSubtask} style={styles.promptAdd}>
                    <Text style={styles.promptAddText}>Add</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 16, 26, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  stage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 75,
    height: "90%",
  },
  previewDock: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    zIndex: 2,
  },
  card: {
    flexShrink: 1,
    backgroundColor: '#F9FBFF',
    borderRadius: 28,
    padding: 22,
    boxShadow: '0 12 24 rgb(14 26 42 / 25%',
    elevation: 10,
    width: 320,
    overflow: 'hidden',
    zIndex: 1,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingBottom: 12,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
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
    color: '#1D2733',
    fontSize: 12,
    fontWeight: '600',
  },
  addSubtaskBubble: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1D2733',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSubtaskText: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  fieldColumn: {
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7C93',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1D2733',
  },
  dateButton: {
    borderRadius: 14,
    backgroundColor: 'rgba(29,39,51,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dateText: {
    color: '#1D2733',
    fontSize: 14,
  },
  quickDatesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  quickDateChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(29,39,51,0.08)',
  },
  quickDateText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1D2733',
  },
  sliderBlock: {
    marginTop: 18,
  },
  slider: {
    width: '100%',
  },
  sliderCaption: {
    fontSize: 12,
    color: '#6B7C93',
    marginTop: 4,
  },
  footer: {
    marginTop: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 16, 26, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  pickerCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  pickerClose: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#1D2733',
    alignItems: 'center',
  },
  pickerCloseText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  promptTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D2733',
    marginBottom: 10,
  },
  promptActions: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  datePromptActions: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  promptCancel: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(29,39,51,0.08)',
  },
  promptCancelText: {
    color: '#1D2733',
    fontWeight: '600',
  },
  promptAdd: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1D2733',
  },
  promptAddText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
    row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  discardButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 115, 115, 0.2)',
    alignItems: 'center',
  },
  discardText: {
    color: '#B24040',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#1D2733',
    alignItems: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
