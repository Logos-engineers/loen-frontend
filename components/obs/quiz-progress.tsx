import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontWeight } from '@/constants/tokens';

type QuizProgressProps = {
  currentStep: 1 | 2 | 3;
};

export function QuizProgress({ currentStep }: QuizProgressProps) {
  return (
    <View style={styles.row}>
      {[1, 2, 3].map((step, index) => (
        <Fragment key={step}>
          <View style={step === currentStep ? styles.activeOuter : styles.inactiveOuter}>
            <View style={[styles.circle, step === currentStep ? styles.activeCircle : styles.inactiveCircle]}>
              <Text style={[styles.label, step === currentStep ? styles.activeLabel : styles.inactiveLabel]}>
                {step}
              </Text>
            </View>
          </View>
          {index < 2 ? <View style={styles.line} /> : null}
        </Fragment>
      ))}
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
  line: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
    backgroundColor: 'rgba(13, 28, 45, 0.08)',
  },
});
