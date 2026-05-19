import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontWeight } from '@/constants/tokens';

type StepResult = 'correct' | 'incorrect' | null;

type QuizProgressProps = {
  currentStep: 1 | 2 | 3;
  results?: [StepResult, StepResult, StepResult];
};

export function QuizProgress({ currentStep, results = [null, null, null] }: QuizProgressProps) {
  return (
    <View style={styles.row}>
      {[1, 2, 3].map((step, index) => {
        const isActive = step === currentStep;
        const isDone = step < currentStep;
        const result = isDone ? results[step - 1] : null;

        return (
          <Fragment key={step}>
            <View style={isActive ? styles.activeOuter : styles.inactiveOuter}>
              <View style={[styles.circle, isActive ? styles.activeCircle : styles.inactiveCircle]}>
                {isDone && result ? (
                  <Text style={styles.resultLabel}>
                    {result === 'correct' ? 'O' : '×'}
                  </Text>
                ) : (
                  <Text style={[styles.label, isActive ? styles.activeLabel : styles.inactiveLabel]}>
                    {step}
                  </Text>
                )}
              </View>
            </View>
            {index < 2 ? <View style={styles.line} /> : null}
          </Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  activeOuter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(101, 97, 255, 0.2)',
  },
  inactiveOuter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCircle: {
    backgroundColor: colors.primary,
  },
  inactiveCircle: {
    backgroundColor: 'rgba(13, 28, 45, 0.08)',
  },
  label: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: fontWeight.bold,
  },
  activeLabel: {
    color: colors.white,
  },
  inactiveLabel: {
    color: 'rgba(13, 28, 45, 0.16)',
  },
  resultLabel: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: fontWeight.bold,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  line: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
    backgroundColor: 'rgba(13, 28, 45, 0.08)',
  },
});
