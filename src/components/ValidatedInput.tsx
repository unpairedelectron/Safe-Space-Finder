import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { FieldProps } from 'formik';

interface ValidatedTextInputProps extends FieldProps {
  label: string;
  placeholder?: string;
  mode?: 'flat' | 'outlined';
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  disabled?: boolean;
  maxLength?: number;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export const ValidatedTextInput: React.FC<ValidatedTextInputProps> = ({
  field,
  form,
  label,
  placeholder,
  mode = 'outlined',
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  autoCapitalize = 'sentences',
  disabled = false,
  maxLength,
  left,
  right,
}) => {
  const { name, value } = field;
  const { errors, touched, setFieldTouched, setFieldValue } = form;
  
  const hasError = errors[name] && touched[name];
  const isValid = touched[name] && !errors[name] && value;

  return (
    <View style={styles.container}>
      <TextInput
        label={label}
        placeholder={placeholder}
        value={value}
        onChangeText={(text) => setFieldValue(name, text)}
        onBlur={() => setFieldTouched(name)}
        mode={mode}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        autoCapitalize={autoCapitalize}
        disabled={disabled}
        maxLength={maxLength}
        left={left}
        right={right}
        error={!!hasError}
        style={[
          styles.input,
          hasError && styles.errorInput,
          isValid && styles.validInput,
        ]}
        contentStyle={styles.inputContent}
      />
      {hasError && (
        <HelperText type="error" style={styles.errorText}>
          {errors[name] as string}
        </HelperText>
      )}
      {isValid && (
        <HelperText type="info" style={styles.successText}>
          ✓ Looks good!
        </HelperText>
      )}
      {maxLength && (
        <HelperText type="info" style={styles.counterText}>
          {value?.length || 0}/{maxLength}
        </HelperText>
      )}
    </View>
  );
};

interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['#F44336', '#FF9800', '#FFC107', '#8BC34A', '#4CAF50'];

  if (!password) return null;

  return (
    <View style={styles.strengthContainer}>
      <View style={styles.strengthBar}>
        {[...Array(5)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.strengthSegment,
              {
                backgroundColor: index < strength ? strengthColors[strength - 1] : '#E0E0E0',
              },
            ]}
          />
        ))}
      </View>
      <HelperText
        type="info"
        style={[styles.strengthText, { color: strengthColors[strength - 1] || '#666' }]}
      >
        {strengthLabels[strength - 1] || 'Enter password'}
      </HelperText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  inputContent: {
    fontSize: 16,
  },
  errorInput: {
    // Additional error styling if needed
  },
  validInput: {
    // Additional success styling if needed
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  successText: {
    fontSize: 12,
    marginTop: 4,
    color: '#4CAF50',
  },
  counterText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
    color: '#666',
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthBar: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  strengthSegment: {
    flex: 1,
    marginRight: 2,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
