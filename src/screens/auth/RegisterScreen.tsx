import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import api from '../../lib/axios'
import { useTheme } from '../../hooks/useTheme'
import { AuthStackParamList } from '../../types/navigation'

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>
}

const schema = z.object({
  full_name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

type FormData = z.infer<typeof schema>

export default function RegisterScreen({ navigation }: Props) {
  const t = useTheme()
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: '', email: '', password: '' },
  })

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/auth/register', data)
      Alert.alert('Berhasil', 'Akun berhasil dibuat. Cek email untuk verifikasi.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ])
    } catch (error: any) {
      Alert.alert('Gagal', error.response?.data?.message || 'Terjadi kesalahan')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daftar</Text>
      <Text style={styles.subtitle}>Buat akun baru</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Nama Lengkap</Text>
        <Controller
          control={control}
          name="full_name"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.full_name && styles.inputError]}
              placeholder="Nama lengkap"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.full_name && <Text style={styles.errorText}>{errors.full_name.message}</Text>}

        <Text style={styles.label}>Email</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="email@contoh.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

        <Text style={styles.label}>Password</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Minimal 6 karakter"
              secureTextEntry
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: t.primary }, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Daftar</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Sudah punya akun? <Text style={[styles.link, { color: t.primary }]}>Masuk</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 32,
  },
  form: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a1a1a',
    backgroundColor: '#fafafa',
  },
  inputError: {
    borderColor: '#e53e3e',
  },
  errorText: {
    fontSize: 12,
    color: '#e53e3e',
    marginTop: 4,
  },
  button: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  linkText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 13,
    marginTop: 16,
  },
  link: {
    color: 'transparent',
    fontWeight: '600',
  },
})
