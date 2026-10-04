<script setup lang="ts">
import { computed, ref } from 'vue'
import ParticipantsTable from './components/ParticipantsTable.vue'
import RegistrationBlock from './components/RegistrationBlock.vue'
import WinnersBlock from './components/WinnersBlock.vue'
import type { Participant, ParticipantFormData } from './types/participant'

const MAX_WINNERS = 3

const participants = ref<Participant[]>([])
const winnerIds = ref<string[]>([])

const winners = computed<Participant[]>(() =>
  winnerIds.value.flatMap((id) => {
    const participant = participants.value.find((participant) => participant.id === id)

    return participant ? [participant] : []
  }),
)

const availableParticipants = computed<Participant[]>(() =>
  participants.value.filter((participant) => !winnerIds.value.includes(participant.id)),
)

const canChooseWinner = computed<boolean>(
  () => winnerIds.value.length < MAX_WINNERS && availableParticipants.value.length > 0,
)

function addParticipant(data: ParticipantFormData): void {
  participants.value.push({
    id: crypto.randomUUID(),
    ...data,
  })
}

function chooseWinner(): void {
  if (!canChooseWinner.value) {
    return
  }

  const candidates = availableParticipants.value
  const randomIndex = Math.floor(Math.random() * candidates.length)
  const participant = candidates[randomIndex]

  if (participant) {
    winnerIds.value.push(participant.id)
  }
}

function removeWinner(id: string): void {
  winnerIds.value = winnerIds.value.filter((winnerId) => winnerId !== id)
}
</script>

<template>
  <main class="lottery-app">
    <WinnersBlock
      :winners="winners"
      :can-choose-winner="canChooseWinner"
      @new-winner="chooseWinner"
      @remove-winner="removeWinner"
    />

    <RegistrationBlock :participants="participants" @save="addParticipant" />

    <ParticipantsTable :participants="participants" />
  </main>
</template>
