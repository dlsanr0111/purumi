import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { RequireAuth } from '../../components/RequireAuth';
import { useAuth } from '../../providers/AuthProvider';
import { reservationService, Service } from '../../lib/supabase';
import { draftStorage, ReservationDraft } from '../../lib/storage';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

export default function ReservationScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(true);

  const { user, isGuest } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadServices();
    loadDraft();
  }, []);

  const loadServices = async () => {
    try {
      const servicesData = await reservationService.getServices();
      setServices(servicesData);
    } catch (error) {
      console.error('서비스 목록 로드 실패:', error);
      Alert.alert('오류', '서비스 목록을 불러오는데 실패했습니다.');
    } finally {
      setServicesLoading(false);
    }
  };

  const loadDraft = async () => {
    try {
      const draft = await draftStorage.getDraft();
      if (draft) {
        // 초안이 있으면 폼에 채우기
        const service = services.find(s => s.id === draft.service_id);
        if (service) {
          setSelectedService(service);
        }
        setSelectedDate(draft.scheduled_for.split('T')[0]);
        setSelectedTime(draft.scheduled_for.split('T')[1]?.split('+')[0] || '');
        setNote(draft.note || '');
      }
    } catch (error) {
      console.error('초안 로드 실패:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      Alert.alert('입력 오류', '모든 필수 항목을 입력해주세요.');
      return;
    }

    if (!user) {
      Alert.alert('로그인 필요', '예약을 하려면 로그인이 필요합니다.');
      return;
    }

    setLoading(true);
    try {
      const scheduledFor = `${selectedDate}T${selectedTime}:00+09:00`;
      
      const reservationData = {
        user_id: user.id,
        service_id: selectedService.id,
        scheduled_for: scheduledFor,
        note: note.trim() || undefined,
      };

      const { data, error } = await reservationService.createReservation(reservationData);

      if (error) {
        throw error;
      }

      // 초안 삭제
      await draftStorage.clearDraft();

      Alert.alert(
        '예약 완료',
        '예약이 성공적으로 완료되었습니다.',
        [
          {
            text: '확인',
            onPress: () => router.replace('/home'),
          },
        ]
      );
    } catch (error) {
      console.error('예약 생성 실패:', error);
      Alert.alert('오류', '예약 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      Alert.alert('입력 오류', '모든 필수 항목을 입력해주세요.');
      return;
    }

    try {
      const scheduledFor = `${selectedDate}T${selectedTime}:00+09:00`;
      
      const draft: ReservationDraft = {
        service_id: selectedService.id,
        scheduled_for: scheduledFor,
        note: note.trim() || undefined,
      };

      await draftStorage.saveDraft(draft);
      Alert.alert('저장 완료', '예약 초안이 저장되었습니다.');
    } catch (error) {
      console.error('초안 저장 실패:', error);
      Alert.alert('오류', '초안 저장에 실패했습니다.');
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  if (servicesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={styles.loadingText}>서비스 목록을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <RequireAuth>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>예약하기</Text>

          {/* 서비스 선택 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>서비스 선택 *</Text>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  selectedService?.id === service.id && styles.serviceCardSelected,
                ]}
                onPress={() => setSelectedService(service)}
              >
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
                <Text style={styles.serviceDuration}>소요시간: {service.duration_min}분</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 날짜 선택 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>날짜 선택 *</Text>
            <TouchableOpacity style={styles.dateButton}>
              <Text style={styles.dateButtonText}>
                {selectedDate || '날짜를 선택하세요'}
              </Text>
            </TouchableOpacity>
            {/* 실제 앱에서는 DatePicker 컴포넌트 사용 */}
            <Text style={styles.helperText}>
              실제 구현에서는 날짜 선택기를 사용하세요
            </Text>
          </View>

          {/* 시간 선택 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>시간 선택 *</Text>
            <View style={styles.timeGrid}>
              {timeSlots.slice(0, 12).map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeSlot,
                    selectedTime === time && styles.timeSlotSelected,
                  ]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      selectedTime === time && styles.timeSlotTextSelected,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 메모 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>메모 (선택사항)</Text>
            <TouchableOpacity style={styles.noteButton}>
              <Text style={styles.noteButtonText}>
                {note || '특별한 요청사항이 있으시면 입력해주세요'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.helperText}>
              실제 구현에서는 TextInput 컴포넌트 사용
            </Text>
          </View>

          {/* 버튼들 */}
          <View style={styles.buttonContainer}>
            {isGuest ? (
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveDraft}
              >
                <Text style={styles.saveButtonText}>초안 저장</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.text.inverse} />
                ) : (
                  <Text style={styles.submitButtonText}>예약하기</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  loadingText: {
    marginTop: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    color: Colors.text.secondary,
  },
  content: {
    padding: Layout.spacing.lg,
  },
  title: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xl,
    textAlign: 'center',
  },
  section: {
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.md,
  },
  serviceCard: {
    backgroundColor: Colors.background.secondary,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    marginBottom: Layout.spacing.sm,
  },
  serviceCardSelected: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  serviceName: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xs,
  },
  serviceDescription: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Layout.spacing.xs,
  },
  serviceDuration: {
    fontSize: Layout.fontSize.xs,
    color: Colors.text.secondary,
  },
  dateButton: {
    backgroundColor: Colors.background.secondary,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  dateButtonText: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.primary,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.sm,
  },
  timeSlot: {
    backgroundColor: Colors.background.secondary,
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    minWidth: 80,
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  timeSlotText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.primary,
  },
  timeSlotTextSelected: {
    color: Colors.text.inverse,
  },
  noteButton: {
    backgroundColor: Colors.background.secondary,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    minHeight: 80,
  },
  noteButtonText: {
    fontSize: Layout.fontSize.md,
    color: Colors.text.secondary,
  },
  helperText: {
    fontSize: Layout.fontSize.xs,
    color: Colors.text.secondary,
    marginTop: Layout.spacing.xs,
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginTop: Layout.spacing.lg,
  },
  button: {
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: Colors.primary[500],
  },
  saveButton: {
    backgroundColor: Colors.secondary[500],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.text.inverse,
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
  },
  saveButtonText: {
    color: Colors.text.inverse,
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
  },
});
