<script setup lang="ts">
import type { Participant } from '@/types/participant'

defineProps<{
  participants: readonly Participant[]
}>()
</script>

<template>
  <section class="lottery-panel participants-block" aria-label="Participants">
    <div class="participants-table-wrapper">
      <table class="table participants-table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Name</th>
            <th scope="col">Date of Birth</th>
            <th scope="col">Email</th>
            <th scope="col">Phone number</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(participant, index) in participants" :key="participant.id">
            <td>{{ index + 1 }}</td>
            <td>{{ participant.name }}</td>
            <td>{{ participant.birthDate }}</td>
            <td>{{ participant.email }}</td>
            <td>{{ participant.phone }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
