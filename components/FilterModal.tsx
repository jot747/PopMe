import { BlurView } from 'expo-blur';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';


export const Filters = {
  NONE: "NONE",
  DATE: "DATE",
  PRIORITY: "PRIORITY",
  ENERGY: "ENERGY",
};
export const FilterOrderings = {
  ASCENDING: 1,
  DESCENDING: -1,
};

export type FilterModalProps = {
  visible: boolean;
  onSave: (filter: string, value: number) => void;
  onClose: () => void;
};

export const FilterModal = ({
  visible,
  onSave,
  onClose,
}: FilterModalProps) => {

  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

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


  const handleSelect = (filter: string, order: number) => {
    onSave(filter, order);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={60} tint="light" style={styles.blur} />
        <View style={styles.stage}>
          <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
            <View style={styles.header}>
              <Text style={styles.title}>Select Filter</Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.body}
              contentContainerStyle={styles.bodyContent}
              showsVerticalScrollIndicator={false}>
                <View style={styles.fieldColumn}>
                <Text style={styles.label}>Due Date</Text>
                <View style={styles.footer}>
                    <Pressable onPress={() => handleSelect(Filters.DATE, FilterOrderings.ASCENDING)} style={styles.saveButton}>
                        <Text style={styles.saveText}>Due soon</Text>
                    </Pressable>
                    <Pressable onPress={() => handleSelect(Filters.DATE, FilterOrderings.DESCENDING)} style={styles.saveButton}>
                        <Text style={styles.saveText}>Due later</Text>
                    </Pressable>
                </View>
                
                <Text style={styles.label}>Priority</Text>
                <View style = {styles.footer}>
                    <Pressable onPress={() => handleSelect(Filters.PRIORITY, FilterOrderings.ASCENDING)} style={styles.saveButton}>
                        <Text style={styles.saveText}>Least important</Text>
                    </Pressable>
                    <Pressable onPress={() => handleSelect(Filters.PRIORITY, FilterOrderings.DESCENDING)} style={styles.saveButton}>
                        <Text style={styles.saveText}>Most important</Text>
                    </Pressable>
                </View>

                <Text style={styles.label}>Energy</Text>
                <View style = {styles.footer}>
                    <Pressable onPress={() => handleSelect(Filters.ENERGY, FilterOrderings.ASCENDING)} style={styles.saveButton}>
                        <Text style={styles.saveText}>Least energy</Text>
                    </Pressable>
                    <Pressable onPress={() => handleSelect(Filters.ENERGY, FilterOrderings.DESCENDING)} style={styles.saveButton}>
                        <Text style={styles.saveText}>Most energy</Text>
                    </Pressable>
                </View>
              </View>
            </ScrollView>

            <View style={styles.footer}>
                <Pressable onPress={() => handleSelect(Filters.NONE, 0)} style={styles.discardButton}>
                    <Text style={styles.discardText}>Remove filter</Text>
                </Pressable>
            </View>
          </Animated.View>
        </View>
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 44,
    paddingTop: 70,
  },
  previewDock: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    zIndex: 2,
  },
  card: {
    backgroundColor: '#F9FBFF',
    borderRadius: 28,
    padding: 22,
    boxShadow: '0 12 24 rgb(14 26 42 / 25%',
    elevation: 10,
    width: 320,
    height: 'auto',
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  discardButton: {
    flex: 1,
    paddingVertical: 12,
    marginTop: 22,
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
