<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string
    label: string
    modelValue: string
    type?: 'text' | 'email' | 'tel' | 'date'
    placeholder?: string
    error?: string
    valid?: boolean
    max?: string
    autocomplete?: string
  }>(),
  {
    type: 'text',
    placeholder: '',
    error: '',
    valid: false,
    max: undefined,
    autocomplete: 'off',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function handleInput(event: Event): void {
  const input = event.target as HTMLInputElement
  emit('update:modelValue', input.value)
}
</script>

<template>
  <div class="lottery-field">
    <label :for="id" class="form-label">
      {{ label }}
    </label>

    <input
      :id="id"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :max="max"
      :autocomplete="autocomplete"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? `${id}-error` : undefined"
      :class="[
        'form-control',
        {
          'is-invalid': Boolean(error),
          'is-valid': valid && !error,
        },
      ]"
      required
      @input="handleInput"
    />

    <div v-if="error" :id="`${id}-error`" class="invalid-feedback">
      {{ error }}
    </div>
  </div>
</template>
