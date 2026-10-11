<script setup lang="ts">
import { useId } from 'vue'
import { useField } from 'vee-validate'
import type { CreateUserDto } from '@/types/user'

const props = withDefaults(
  defineProps<{
    name: keyof CreateUserDto
    label: string
    type?: 'text' | 'email' | 'password' | 'number' | 'tel'
    autocomplete?: string
  }>(),
  {
    type: 'text',
    autocomplete: 'off',
  },
)

const inputId = useId()

const { value, errorMessage, handleBlur } = useField<string | number>(() => props.name)
</script>

<template>
  <div class="lottery-field">
    <label :for="inputId" class="form-label">
      {{ label }}
    </label>

    <input
      :id="inputId"
      v-model="value"
      :name="name"
      :type="type"
      :autocomplete="autocomplete"
      class="form-control"
      :class="{ 'is-invalid': errorMessage }"
      :aria-invalid="errorMessage ? 'true' : undefined"
      :aria-describedby="errorMessage ? `${inputId}-error` : undefined"
      required
      @blur="handleBlur"
    />

    <div v-if="errorMessage" :id="`${inputId}-error`" class="invalid-feedback">
      {{ errorMessage }}
    </div>
  </div>
</template>
