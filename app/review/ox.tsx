import { Stack, router } from 'expo-router';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

// tokens
import { colors, fontSize, fontWeight, radius } from '@/constants/tokens';

import OMarkIcon from '@/assets/icons/O mark.svg';
import XMarkIcon from '@/assets/icons/X mark.svg';
import HumanOMarkIcon from '@/assets/icons/humanOmark.svg';
import HumanXMarkIcon from '@/assets/icons/humanXmark.svg';
import WhiteOMarkIcon from '@/assets/icons/whiteO mark.svg';
import WhiteXMarkIcon from '@/assets/icons/whiteX mark.svg';

const PROGRESS_RING_SVG = `<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="43.3333" height="43.3333" rx="21.6667" fill="#0D1C2D" fill-opacity="0.5"/><path d="M21.6667 12.9665C26.4644 12.9667 30.3677 16.8686 30.3669 21.6667C30.3658 26.4643 26.4636 30.3666 21.6667 30.3669C16.8704 30.3669 12.9675 26.4644 12.9665 21.6667C12.9665 16.8695 16.8695 12.9665 21.6667 12.9665ZM21.6667 15.3669C18.3022 15.3669 15.5437 18.0192 15.3747 21.3424L15.3669 21.6715C15.3706 25.1432 18.1963 27.9665 21.6667 27.9665C25.031 27.9663 27.789 25.3139 27.9587 21.9899L27.9665 21.6667L27.9587 21.3424C27.7895 18.0193 25.0318 15.3671 21.6667 15.3669Z" fill="white"/></svg>`;
const PROGRESS_2_ACTIVE_SVG = `<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="43.3333" height="43.3333" rx="21.6667" fill="#6561FF"/><path d="M16.6102 29.9497V28.1441L22.2751 22.434C24.0581 20.5608 24.9609 19.5226 24.9609 18.1007C24.9609 16.4983 23.6518 15.4601 21.9366 15.4601C20.131 15.4601 18.9574 16.6111 18.9574 18.349H16.6102C16.5876 15.3698 18.8671 13.3837 21.9817 13.3837C25.1414 13.3837 27.3081 15.3698 27.3307 18.033C27.3081 19.8611 26.4504 21.3056 23.381 24.3299L20.0633 27.6927V27.8281H27.6015V29.9497H16.6102Z" fill="white"/></svg>`;
const PROGRESS_3_INACTIVE_SVG = `<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="43.3333" height="43.3333" rx="21.6667" fill="#0D1C2D" fill-opacity="0.08"/><path d="M22.5006 30.0625C19.1152 30.0625 16.7003 28.2344 16.61 25.5712H19.1378C19.2281 27.0156 20.6499 27.9184 22.4781 27.9184C24.4416 27.9184 25.886 26.8351 25.886 25.2552C25.886 23.6528 24.5319 22.4792 22.2072 22.4792H20.8079V20.4479H22.2072C24.0579 20.4479 25.3669 19.4097 25.3669 17.8524C25.3669 16.3628 24.261 15.3472 22.5232 15.3472C20.8756 15.3472 19.4312 16.25 19.3635 17.7396H16.9711C17.0388 15.0764 19.4989 13.2708 22.5458 13.2708C25.7506 13.2708 27.7819 15.3021 27.7593 17.717C27.7819 19.5677 26.6308 20.9219 24.8704 21.3507V21.4635C27.1048 21.7795 28.3913 23.2691 28.3913 25.3455C28.3913 28.0764 25.886 30.0625 22.5006 30.0625Z" fill="#0D1C2D" fill-opacity="0.16"/></svg>`;

// Navigation SVGs
const ARROW_BACK_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.9393 3.93934C12.5251 3.35355 13.4746 3.35355 14.0604 3.93934C14.6462 4.52513 14.6462 5.47465 14.0604 6.06043L8.12098 11.9999L14.0604 17.9393C14.6462 18.5251 14.6462 19.4746 14.0604 20.0604C13.4746 20.6462 12.5251 20.6462 11.9393 20.0604L4.93934 13.0604C4.35355 12.4746 4.35355 11.5251 4.93934 10.9393L11.9393 3.93934Z" fill="#0D1C2D" fill-opacity="0.16"/></svg>`;

// Progress Indicator SVG Components
const ID_LINE_COMPLETED = `<svg width="100%" height="2" preserveAspectRatio="none" viewBox="0 0 100 2" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 1H100" stroke="#0D1C2D" stroke-opacity="0.08" stroke-width="2"/></svg>`;
const ID_LINE_INACTIVE = `<svg width="100%" height="2" preserveAspectRatio="none" viewBox="0 0 100 2" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 1H100" stroke="#0D1C2D" stroke-opacity="0.08" stroke-width="2"/></svg>`;

export default function OXQuizScreen() {
  const [selectedAnswer, setSelectedAnswer] = React.useState<'O' | 'X' | null>(null);
  const [isModalVisible, setIsModalVisible] = React.useState(false);

  // Assuming 'O' is the correct answer for this question
  const isCorrect = selectedAnswer === 'O';

  const handleSubmit = () => {
    if (selectedAnswer) {
      setIsModalVisible(true);
    }
  };

  const handleNextQuiz = () => {
    setIsModalVisible(false);
    router.push('/review/multiple');
  };

  // Calculate generic active progress item
  const renderProgressIndicator = (step: number, isActive: boolean) => {
    let xml = "";
    if (step === 1) xml = PROGRESS_RING_SVG;
    else if (step === 2) xml = PROGRESS_2_ACTIVE_SVG;
    else xml = PROGRESS_3_INACTIVE_SVG;

    if (isActive) {
      return (
        <View style={styles.progressItemActiveContainer}>
          <View style={styles.progressItemInner}>
            <SvgXml xml={xml} width={43.33} height={43.33} />
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.progressItemInactiveContainer}>
          <View style={styles.progressItemInner}>
             <SvgXml xml={xml} width={43.33} height={43.33} />
          </View>
        </View>
      );
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.8} onPress={() => router.back()}>
            <SvgXml xml={ARROW_BACK_SVG} width={24} height={24} />
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        <View style={styles.content}>
          <View style={styles.quizCard}>
            
            {/* Header: Title */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>시들어버린 박넝쿨의 역사</Text>
            </View>

            {/* Progress Indicator */}
          <View style={styles.progressRow}>
            {renderProgressIndicator(1, true)}
            <View style={styles.progressLine}>
              <SvgXml xml={ID_LINE_INACTIVE} width="100%" height={2} />
            </View>
            {renderProgressIndicator(2, false)}
            <View style={styles.progressLine}>
              <SvgXml xml={ID_LINE_INACTIVE} width="100%" height={2} />
            </View>
            {renderProgressIndicator(3, false)}
          </View>
            
          </View>

          {/* Question Area */}
          <View style={styles.questionCard}>
            <View style={styles.tagWrapper}>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>O/X퀴즈</Text>
              </View>
            </View>
            
            <View style={styles.questionRow}>
              <Text style={styles.questionQ}>Q.</Text>
              <Text style={styles.questionText}>
                '쓴 뿌리' 는 우리가 가진 부정적인 감정상태나 상처를의미하며, 단순히 기분이 나쁜 것을 말한다.
              </Text>
            </View>

            <View style={styles.optionsRow}>
              {/* O Option */}
              <TouchableOpacity 
                style={[
                  styles.optionBtn, 
                  { backgroundColor: selectedAnswer === 'O' ? '#6561FF' : '#F2F4F7' }
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedAnswer('O')}
              >
                {selectedAnswer === 'O' ? (
                  <WhiteOMarkIcon width={80} height={80} />
                ) : (
                  <OMarkIcon width={80} height={80} />
                )}
              </TouchableOpacity>
              
              {/* X Option */}
              <TouchableOpacity 
                style={[
                  styles.optionBtn, 
                  { backgroundColor: selectedAnswer === 'X' ? '#6561FF' : '#F2F4F7' }
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedAnswer('X')}
              >
                {selectedAnswer === 'X' ? (
                  <WhiteXMarkIcon width={80} height={80} />
                ) : (
                  <XMarkIcon width={80} height={80} />
                )}
              </TouchableOpacity>
            </View>
          </View>

        </View>

        {/* Bottom CTA Area */}
        <View style={styles.ctaWrapper}>
          <TouchableOpacity 
            style={[
              styles.ctaButton,
              { backgroundColor: selectedAnswer ? colors.primary : 'rgba(101, 97, 255, 0.4)' }
            ]} 
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={!selectedAnswer}
          >
            <Text style={[
              styles.ctaButtonText,
              { color: '#FFFFFF' }
            ]}>
              선택할게요
            </Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>

      {/* Result Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsModalVisible(false)}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {/* Top Handle */}
              <View style={styles.modalHandleWrapper}>
                <View style={styles.modalHandle} />
              </View>

              {/* Illustration Area */}
              <View style={styles.modalImageWrapper}>
                {isCorrect ? (
                  <HumanOMarkIcon width={80} height={80} />
                ) : (
                  <HumanXMarkIcon width={80} height={80} />
                )}
              </View>

              {/* Text Area */}
              <View style={styles.modalTextWrapper}>
                <Text style={styles.modalTitle}>{isCorrect ? '정답이에요!' : '오답이에요!'}</Text>
                <Text style={styles.modalDesc}>
                  쓴 뿌리는 죄의 씨앗이며, 방치되면 하나님의 은혜에서 멀어지게 돼요.
                </Text>
              </View>

              {/* Next Button */}
              <View style={styles.modalBtnWrapper}>
                <TouchableOpacity 
                  style={styles.modalBtn} 
                  activeOpacity={0.8}
                  onPress={handleNextQuiz}
                >
                  <Text style={styles.modalBtnText}>다음 퀴즈 풀기</Text>
                </TouchableOpacity>
              </View>

            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F2F4F7', // background/fill/elevated
  },
  navBar: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 24,
  },
  quizCard: {
    backgroundColor: '#FFFFFF', // white
    borderRadius: radius.lg, // 16px
    paddingBottom: 16,
  },
  cardHeader: {
    padding: 16,
  },
  cardTitle: {
    fontSize: fontSize.xl, // 20px
    fontWeight: fontWeight.bold,
    color: 'rgba(13, 28, 45, 0.8)',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  progressItemInactiveContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressItemActiveContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(101, 97, 255, 0.2)', // Light primary bg shell
  },
  progressItemInner: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    paddingTop: 16,
    paddingBottom: 24,
  },
  tagWrapper: {
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  tagBadge: {
    backgroundColor: 'rgba(101, 97, 255, 0.2)', // Light primary
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm, // 8px
    alignSelf: 'flex-start',
  },
  tagText: {
    color: colors.primary,
    fontSize: 12, 
    fontWeight: '600',
    lineHeight: 18,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 21,
    paddingBottom: 20,
  },
  questionQ: {
    fontSize: 20,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    paddingLeft: 16,
    paddingRight: 8,
  },
  questionText: {
    flex: 1,
    fontSize: 20,
    fontWeight: fontWeight.bold,
    color: 'rgba(13, 28, 45, 0.8)',
    paddingRight: 16,
    lineHeight: 28,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
  },
  optionBtn: {
    flex: 1,
    height: 160,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  ctaWrapper: {
    backgroundColor: '#FFFFFF', // white
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 34, // approximate safe area bottom
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  ctaButton: {
    borderRadius: radius.md, // 12px
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    fontSize: fontSize.lg, // 18px
    fontWeight: fontWeight.semibold,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 28, 45, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHandleWrapper: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalHandle: {
    width: 80,
    height: 5,
    backgroundColor: 'rgba(13, 28, 45, 0.08)',
    borderRadius: 10,
  },
  modalImageWrapper: {
    height: 152,
    backgroundColor: '#F2F4F7', 
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
  },
  modalTextWrapper: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32, // More spacing before the button 
    gap: 12, // Increased gap slightly
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: fontWeight.bold,
    color: 'rgba(13, 28, 45, 0.8)',
  },
  modalDesc: {
    fontSize: 16,
    fontWeight: fontWeight.semibold, // Figma 6413-29693 SemiBold
    color: 'rgba(13, 28, 45, 0.8)',
    lineHeight: 25.6,
  },
  modalBtnWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: fontWeight.bold, // Figma 6413-29693 Bold
  },
});
