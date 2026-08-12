import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLoginUser, useRegisterUser } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import * as Haptics from 'expo-haptics';

type AuthMode = 'login' | 'register';

function AuthForm() {
  const colors = useColors();
  const { login } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { mutate: loginMutate, isPending: loginPending } = useLoginUser({
    mutation: {
      onSuccess: async (data) => {
        await login(data.token, data.user);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
      onError: (err: any) => {
        const msg = err?.data?.error ?? 'Invalid credentials';
        setError(msg);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      },
    },
  });

  const { mutate: registerMutate, isPending: registerPending } = useRegisterUser({
    mutation: {
      onSuccess: () => {
        // After register, switch to login
        setMode('login');
        setError(null);
        setPassword('');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
      onError: (err: any) => {
        const msg = err?.data?.error ?? 'Registration failed';
        setError(msg);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      },
    },
  });

  const isPending = loginPending || registerPending;

  const handleSubmit = () => {
    setError(null);
    if (mode === 'login') {
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }
      loginMutate({ data: { email: email.trim(), password } });
    } else {
      if (!email || !username || !password) {
        setError('Please fill in all fields');
        return;
      }
      if (username.trim().length < 3) {
        setError('Username must be at least 3 characters');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      registerMutate({ data: { email: email.trim(), username: username.trim(), password } });
    }
  };

  const inputStyle = [styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, borderRadius: colors.radius }];
  const labelStyle = [styles.label, { color: colors.mutedForeground }];

  return (
    <View style={styles.formContainer}>
      {/* Mode toggle */}
      <View style={[styles.modeToggle, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
        <Pressable
          style={[styles.modeBtn, mode === 'login' && { backgroundColor: colors.card, borderRadius: colors.radius - 2 }]}
          onPress={() => { setMode('login'); setError(null); }}
        >
          <Text style={[styles.modeBtnText, { color: mode === 'login' ? colors.foreground : colors.mutedForeground }]}>
            Sign In
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeBtn, mode === 'register' && { backgroundColor: colors.card, borderRadius: colors.radius - 2 }]}
          onPress={() => { setMode('register'); setError(null); }}
        >
          <Text style={[styles.modeBtnText, { color: mode === 'register' ? colors.foreground : colors.mutedForeground }]}>
            Register
          </Text>
        </Pressable>
      </View>

      {/* Form fields */}
      <View style={styles.fields}>
        {mode === 'register' ? (
          <View>
            <Text style={labelStyle}>Username</Text>
            <TextInput
              style={inputStyle}
              placeholder="at least 3 characters"
              placeholderTextColor={colors.mutedForeground}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        ) : null}

        <View>
          <Text style={labelStyle}>Email</Text>
          <TextInput
            style={inputStyle}
            placeholder="your@email.com"
            placeholderTextColor={colors.mutedForeground}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            autoComplete="email"
          />
        </View>

        <View>
          <Text style={labelStyle}>Password</Text>
          <TextInput
            style={inputStyle}
            placeholder={mode === 'register' ? 'at least 6 characters' : 'your password'}
            placeholderTextColor={colors.mutedForeground}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </View>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: colors.destructive + '22', borderRadius: 8 }]}>
            <Feather name="alert-circle" size={14} color={colors.destructive} />
            <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed || isPending ? 0.8 : 1 },
          ]}
          onPress={handleSubmit}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color={colors.primaryForeground} size="small" />
          ) : (
            <Text style={[styles.submitBtnText, { color: colors.primaryForeground }]}>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function ProfileView() {
  const colors = useColors();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
  };

  return (
    <View style={styles.profileContainer}>
      <View style={[styles.avatarCircle, { backgroundColor: colors.primary + '22' }]}>
        <Feather name="user" size={36} color={colors.primary} />
      </View>

      <Text style={[styles.profileName, { color: colors.foreground }]}>{user?.username}</Text>
      <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>{user?.email}</Text>

      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <View style={styles.profileRow}>
          <Feather name="calendar" size={16} color={colors.mutedForeground} />
          <Text style={[styles.profileRowText, { color: colors.mutedForeground }]}>
            Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
          </Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.logoutBtn,
          { borderColor: colors.destructive, borderRadius: colors.radius, opacity: pressed ? 0.75 : 1 },
        ]}
        onPress={handleLogout}
      >
        <Feather name="log-out" size={16} color={colors.destructive} />
        <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

export default function AccountScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, isLoading } = useAuth();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.scrollContent, { paddingTop: topInset + 20, paddingBottom: Platform.OS === 'web' ? 34 + 84 : 100 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.screenTitle, { color: colors.foreground }]}>Account</Text>

      {user ? <ProfileView /> : <AuthForm />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 24,
  },
  formContainer: {
    gap: 20,
  },
  modeToggle: {
    flexDirection: 'row',
    padding: 4,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  modeBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  fields: {
    gap: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
  },
  errorText: {
    fontSize: 13,
    flex: 1,
  },
  submitBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  profileContainer: {
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700' as const,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  profileCard: {
    width: '100%',
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileRowText: {
    fontSize: 14,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 16,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
});
