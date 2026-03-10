import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../theme';

interface Props {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

const StepIndicator: React.FC<Props> = ({ currentStep, totalSteps, labels }) => (
  <View style={styles.container}>
    {Array.from({ length: totalSteps }, (_, i) => {
      const step = i + 1;
      const done    = step < currentStep;
      const active  = step === currentStep;
      return (
        <React.Fragment key={step}>
          <View style={styles.stepWrap}>
            <View style={[styles.dot, done && styles.dotDone, active && styles.dotActive]}>
              {done ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : (
                <Text style={[styles.dotLabel, active && styles.dotLabelActive]}>{step}</Text>
              )}
            </View>
            {labels?.[i] && (
              <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
                {labels[i]}
              </Text>
            )}
          </View>
          {step < totalSteps && (
            <View style={[styles.line, done && styles.lineDone]} />
          )}
        </React.Fragment>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  stepWrap: { alignItems: 'center', gap: 4 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    borderColor: colors.primaryGreen,
    backgroundColor: colors.primaryGreen,
  },
  dotDone: {
    borderColor: colors.primaryGreen,
    backgroundColor: colors.primaryGreen,
  },
  checkmark: { fontSize: 13, color: colors.white, fontWeight: '700' },
  dotLabel: { fontSize: 12, fontWeight: '600', color: colors.gray[400] },
  dotLabelActive: { color: colors.white },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: colors.gray[200],
    marginHorizontal: 6,
    marginBottom: 18,
  },
  lineDone: { backgroundColor: colors.primaryGreen },
  label: { fontSize: 11, color: colors.textSecondary, maxWidth: 72, textAlign: 'center' },
  labelActive: { color: colors.primaryGreen, fontWeight: '600' },
});

export default StepIndicator;
