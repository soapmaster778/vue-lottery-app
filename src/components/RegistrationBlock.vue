<script setup lang="ts">
import { reactive } from 'vue'
import BaseButton from './BaseButton.vue'
import BaseInput from './BaseInput.vue'
import type { ParticipantFormData } from '@/types/participant'

const form = reactive<ParticipantFormData>({
  name: '',
  birthDate: '',
  email: '',
  phone: '',
})
</script>

<template>
  <section class="lottery-panel registration-block" aria-labelledby="registration-title">
    <h1 id="registration-title" class="lottery-title">REGISTER FORM</h1>

    <p class="registration-description">Please fill in all the fields.</p>

    <form novalidate @submit.prevent>
      <BaseInput
        id="registration-name"
        v-model="form.name"
        label="Name"
        placeholder="Enter user name"
        autocomplete="name"
      />

      <BaseInput
        id="registration-birth-date"
        v-model="form.birthDate"
        label="Date of Birth"
        type="date"
        autocomplete="bday"
      />

      <BaseInput
        id="registration-email"
        v-model="form.email"
        label="Email"
        type="email"
        placeholder="Enter email"
        autocomplete="email"
      />

      <BaseInput
        id="registration-phone"
        v-model="form.phone"
        label="Phone number"
        type="tel"
        placeholder="Enter Phone number"
        autocomplete="tel"
      />

      <div class="form-actions">
        <BaseButton type="submit" disabled> Save </BaseButton>
      </div>
    </form>
  </section>
</template>
