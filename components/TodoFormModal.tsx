import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { TodoItem } from '@/types/todo';
import { Priority } from '@/types/wishlist';
import { PrioritySelector } from '@/components/PrioritySelector';

interface TodoFormModalProps {
  visible: boolean;
  item: TodoItem | null;
  onClose: () => void;
  onSave: (data: { title: string; notes: string; deadline: number | null; priority: Priority }) => void;
  onDelete?: () => void;
}

export function TodoFormModal({ visible, item, onClose, onSave, onDelete }: TodoFormModalProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [deadline, setDeadline] = useState<number | null>(null);
  const [priority, setPriority] = useState<Priority>('medium');
  const [showPicker, setShowPicker] = useState(false);

  const surface = useThemeColor({}, 'surface');
  const surfaceElevated = useThemeColor({}, 'surfaceElevated');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const border = useThemeColor({}, 'border');
  const accent = useThemeColor({}, 'accent');
  const overlay = useThemeColor({}, 'overlay');
  const danger = useThemeColor({}, 'danger');
  const success = useThemeColor({}, 'success');

  const isEditing = !!item;

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setNotes(item.notes);
      setDeadline(item.deadline);
      setPriority(item.priority);
    } else {
      setTitle('');
      setNotes('');
      setDeadline(null);
      setPriority('medium');
    }
    setShowPicker(false);
  }, [item, visible]);

  const pickerValue = deadline != null ? new Date(deadline) : new Date();

  const handlePickerChange = (event: any, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'set' && selected) {
        const d = selected;
        d.setHours(23, 59, 59, 999);
        setDeadline(d.getTime());
      }
    } else if (selected) {
      const d = selected;
      d.setHours(23, 59, 59, 999);
      setDeadline(d.getTime());
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      notes: notes.trim(),
      deadline,
      priority,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: overlay }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={[styles.container, { backgroundColor: surface }]}>
            <View style={[styles.handle, { backgroundColor: border }]} />

            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: text }]}>
                {isEditing ? 'Edit To-do' : 'New To-do'}
              </Text>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={28} color={textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.field}>
                <Text style={[styles.label, { color: text }]}>Title *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: surfaceElevated, borderColor: border, color: text }]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="What needs to be done?"
                  placeholderTextColor={textSecondary}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: text }]}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.notesInput, { backgroundColor: surfaceElevated, borderColor: border, color: text }]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Any additional details..."
                  placeholderTextColor={textSecondary}
                  multiline
                  scrollEnabled={false}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: text }]}>Deadline</Text>
                {deadline != null && (
                  <TouchableOpacity
                    style={[styles.deadlineBtn, { backgroundColor: success + '15', borderColor: success }]}
                    onPress={() => setShowPicker((s) => !s)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="calendar" size={16} color={success} />
                    <Text style={[styles.deadlineBtnText, { color: success }]}>
                      {new Date(deadline).toDateString()}
                    </Text>
                  </TouchableOpacity>
                )}
                {deadline == null && (
                  <TouchableOpacity
                    style={[styles.deadlineBtn, { backgroundColor: surfaceElevated, borderColor: border }]}
                    onPress={() => setShowPicker((s) => !s)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="calendar-outline" size={16} color={textSecondary} />
                    <Text style={[styles.deadlineBtnText, { color: textSecondary }]}>Set a deadline</Text>
                  </TouchableOpacity>
                )}

                {showPicker && Platform.OS === 'ios' && (
                  <View style={[styles.pickerWrap, { borderColor: border }]}>
                    <DateTimePicker
                      value={pickerValue}
                      mode="date"
                      display="inline"
                      onChange={handlePickerChange}
                    />
                    <TouchableOpacity
                      style={[styles.clearBtn, { backgroundColor: danger + '15' }]}
                      onPress={() => {
                        setDeadline(null);
                        setShowPicker(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close-circle-outline" size={16} color={danger} />
                      <Text style={[styles.clearBtnText, { color: danger }]}>Remove deadline</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {showPicker && Platform.OS === 'android' && (
                  <DateTimePicker
                    value={pickerValue}
                    mode="date"
                    onChange={handlePickerChange}
                  />
                )}
              </View>

              <PrioritySelector value={priority} onChange={setPriority} />
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: border }]}>
              {isEditing && onDelete && (
                <TouchableOpacity
                  style={[styles.deleteBtn, { backgroundColor: danger + '15' }]}
                  onPress={() => {
                    onClose();
                    setTimeout(onDelete, 300);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={18} color={danger} />
                  <Text style={[styles.deleteText, { color: danger }]}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: accent, opacity: title.trim() ? 1 : 0.5 }]}
                onPress={handleSave}
                disabled={!title.trim()}
                activeOpacity={0.7}
              >
                <Text style={styles.saveText}>{isEditing ? 'Update' : 'Add To-do'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  notesInput: {
    minHeight: 80,
    paddingTop: 12,
  },
  deadlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
  },
  deadlineBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  pickerWrap: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  clearBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 12,
    marginTop: 8,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
