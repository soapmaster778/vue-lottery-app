<script setup lang="ts">
import { ref, useId } from 'vue'
import { useField, useForm } from 'vee-validate'
import BaseButton from './BaseButton.vue'
import UserFormField from './UserFormField.vue'
import type { CreateUserDto, User, UserGender } from '@/types/user'
import { getErrorMessage } from '@/utils/errors'
import { userSchema } from '@/utils/user-validation'

const props = withDefaults(
  defineProps<{
    save: (data: CreateUserDto) => Promise<void>
    user?: User
    submitLabel?: string
  }>(),
  {
    user: undefined,
    submitLabel: 'Створити користувача',
  },
)

const genderId = useId()
const serverError = ref('')

const { handleSubmit, isSubmitting } = useForm<CreateUserDto>({
  validationSchema: userSchema,

  initialValues: {
    firstName: props.user?.firstName ?? '',
    lastName: props.user?.lastName ?? '',
    email: props.user?.email ?? '',
    username: props.user?.username ?? '',
    password: props.user?.password ?? '',
    age: props.user?.age ?? 18,
    gender: props.user?.gender ?? 'female',
    phone: props.user?.phone ?? '',
  },
})

const {
  value: gender,
  errorMessage: genderError,
  handleBlur: handleGenderBlur,
} = useField<UserGender>('gender')

const submit = handleSubmit(async (values) => {
  serverError.value = ''

  try {
    await props.save(values)
  } catch (error: unknown) {
    serverError.value = getErrorMessage(error)
  }
})
</script>

<template>
  <form novalidate @submit.prevent="submit">
    <fieldset :disabled="isSubmitting">
      <div class="user-form-grid">
        <UserFormField name="firstName" label="First name" autocomplete="given-name" />

        <UserFormField name="lastName" label="Last name" autocomplete="family-name" />

        <UserFormField name="email" label="Email" type="email" autocomplete="email" />

        <UserFormField name="username" label="Username" autocomplete="username" />

        <UserFormField
          name="password"
          label="Password"
          type="password"
          autocomplete="new-password"
        />

        <UserFormField name="age" label="Age" type="number" />

        <div class="lottery-field">
          <label :for="genderId" class="form-label"> Gender </label>

          <select
            :id="genderId"
            v-model="gender"
            name="gender"
            class="form-select"
            :class="{ 'is-invalid': genderError }"
            :aria-invalid="genderError ? 'true' : undefined"
            :aria-describedby="genderError ? `${genderId}-error` : undefined"
            required
            @blur="handleGenderBlur"
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>

          <div v-if="genderError" :id="`${genderId}-error`" class="invalid-feedback">
            {{ genderError }}
          </div>
        </div>

        <UserFormField name="phone" label="Phone" type="tel" autocomplete="tel" />
      </div>

      <p v-if="serverError" class="login-error" role="alert">
        {{ serverError }}
      </p>

      <div class="user-form-actions">
        <BaseButton type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Збереження…' : submitLabel }}
        </BaseButton>
      </div>
    </fieldset>
  </form>
</template>
