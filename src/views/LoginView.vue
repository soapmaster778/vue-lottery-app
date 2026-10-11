<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import BaseButton from '@/components/BaseButton.vue'
import { ApiError } from '@/api/http-client'
import { useAuthStore } from '@/stores/auth'
import type { LoginDto } from '@/types/auth'
import { getErrorMessage } from '@/utils/errors'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const serverError = ref('')

const schema = yup.object({
  username: yup.string().trim().required('Введіть ім’я користувача.'),

  password: yup
    .string()
    .required('Введіть пароль.')
    .min(6, 'Пароль має містити щонайменше 6 символів.'),
})

const { defineField, errors, handleSubmit, isSubmitting } = useForm<LoginDto>({
  validationSchema: schema,

  initialValues: {
    username: '',
    password: '',
  },
})

const [username, usernameAttributes] = defineField('username')
const [password, passwordAttributes] = defineField('password')

function getRedirect(): string {
  const redirect = route.query.redirect

  if (typeof redirect !== 'string' || !redirect.startsWith('/') || redirect.startsWith('//')) {
    return '/users'
  }

  const destination = router.resolve(redirect)

  if (
    destination.name === 'login' ||
    destination.name === 'not-found' ||
    destination.matched.length === 0
  ) {
    return '/users'
  }

  return destination.fullPath
}

const submit = handleSubmit(async (values) => {
  serverError.value = ''

  try {
    await auth.login(values)
    await router.replace(getRedirect())
  } catch (error: unknown) {
    serverError.value =
      error instanceof ApiError && error.status === 400
        ? 'Неправильне ім’я користувача або пароль.'
        : getErrorMessage(error)
  }
})
</script>

<template>
  <section class="lottery-panel">
    <h1 class="page-title">Login</h1>

    <p v-if="auth.notice" class="auth-notice" role="status">
      {{ auth.notice }}
    </p>

    <form novalidate @submit.prevent="submit">
      <div class="lottery-field">
        <label for="login-username" class="form-label"> Username </label>

        <input
          id="login-username"
          v-model="username"
          v-bind="usernameAttributes"
          type="text"
          autocomplete="username"
          class="form-control"
          :class="{ 'is-invalid': errors.username }"
          :aria-invalid="errors.username ? 'true' : undefined"
          :aria-describedby="errors.username ? 'login-username-error' : undefined"
          required
        />

        <div v-if="errors.username" id="login-username-error" class="invalid-feedback">
          {{ errors.username }}
        </div>
      </div>

      <div class="lottery-field">
        <label for="login-password" class="form-label"> Password </label>

        <input
          id="login-password"
          v-model="password"
          v-bind="passwordAttributes"
          type="password"
          autocomplete="current-password"
          class="form-control"
          :class="{ 'is-invalid': errors.password }"
          :aria-invalid="errors.password ? 'true' : undefined"
          :aria-describedby="errors.password ? 'login-password-error' : undefined"
          required
        />

        <div v-if="errors.password" id="login-password-error" class="invalid-feedback">
          {{ errors.password }}
        </div>
      </div>

      <p v-if="serverError" class="login-error" role="alert">
        {{ serverError }}
      </p>

      <div class="login-actions">
        <BaseButton type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Вхід…' : 'Login' }}
        </BaseButton>
      </div>
    </form>
  </section>
</template>
