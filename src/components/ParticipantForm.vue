<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import BaseButton from './BaseButton.vue'
import BaseInput from './BaseInput.vue'
import type { Participant, ParticipantFormData } from '@/types/participant'
import { getToday, normalizeForm, validateParticipant } from '@/utils/validation'
import type { FormErrors } from '@/utils/validation'

const props = withDefaults(
  defineProps<{
    participants: readonly Participant[]
    participant?: Participant
    submitLabel?: string
    idPrefix?: string
  }>(),
  {
    participant: undefined,
    submitLabel: 'Save',
    idPrefix: 'registration',
  },
)

const emit = defineEmits<{
  save: [data: ParticipantFormData]
}>()

function createEmptyForm(): ParticipantFormData {
  return {
    name: '',
    birthDate: '',
    email: '',
    phone: '',
  }
}

const form = reactive<ParticipantFormData>(createEmptyForm())
const submitted = ref(false)

const errors = computed<FormErrors>(() => {
  if (!submitted.value) {
    return {}
  }

  return validateParticipant(form, props.participants, props.participant?.id)
})

function isFieldValid(field: keyof ParticipantFormData): boolean {
  return submitted.value && !errors.value[field]
}

function resetForm(): void {
  submitted.value = false
  Object.assign(form, createEmptyForm())
}

function submitForm(): void {
  submitted.value = true

  if (Object.keys(errors.value).length > 0) {
    return
  }

  emit('save', normalizeForm(form))

  if (!props.participant) {
    resetForm()
  }
}

function handleEnter(event: KeyboardEvent): void {
  if (event.isComposing) {
    return
  }

  event.preventDefault()

  if (!event.repeat) {
    submitForm()
  }
}

watch(
  () => props.participant,
  (participant) => {
    resetForm()

    if (participant) {
      Object.assign(form, {
        name: participant.name,
        birthDate: participant.birthDate,
        email: participant.email,
        phone: participant.phone,
      })
    }
  },
  { immediate: true },
)
</script>

<template>
  <form novalidate @submit.prevent="submitForm" @keydown.enter="handleEnter">
    <BaseInput
      :id="`${idPrefix}-name`"
      v-model="form.name"
      label="Name"
      placeholder="Enter user name"
      autocomplete="name"
      :error="errors.name"
      :valid="isFieldValid('name')"
    />

    <BaseInput
      :id="`${idPrefix}-birth-date`"
      v-model="form.birthDate"
      label="Date of Birth"
      type="date"
      autocomplete="bday"
      :max="getToday()"
      :error="errors.birthDate"
      :valid="isFieldValid('birthDate')"
    />

    <BaseInput
      :id="`${idPrefix}-email`"
      v-model="form.email"
      label="Email"
      type="email"
      placeholder="Enter email"
      autocomplete="email"
      :error="errors.email"
      :valid="isFieldValid('email')"
    />

    <BaseInput
      :id="`${idPrefix}-phone`"
      v-model="form.phone"
      label="Phone number"
      type="tel"
      placeholder="+380671234567"
      autocomplete="tel"
      :error="errors.phone"
      :valid="isFieldValid('phone')"
    />

    <div class="form-actions">
      <BaseButton type="submit">
        {{ submitLabel }}
      </BaseButton>
    </div>
  </form>
</template>
