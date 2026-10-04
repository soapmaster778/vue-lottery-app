<script setup lang="ts">
import { ref } from 'vue'
import AppModal from './components/AppModal.vue'
import BaseButton from './components/BaseButton.vue'
import ParticipantForm from './components/ParticipantForm.vue'
import ParticipantsTable from './components/ParticipantsTable.vue'
import RegistrationBlock from './components/RegistrationBlock.vue'
import WinnersBlock from './components/WinnersBlock.vue'
import { useParticipants } from './composables/useParticipants'
import type { Participant, ParticipantFormData } from './types/participant'

const {
  participants,
  winners,
  canChooseWinner,
  storageError,
  addParticipant,
  updateParticipant,
  deleteParticipant,
  chooseWinner,
  removeWinner,
} = useParticipants()

const editingParticipant = ref<Participant | null>(null)
const deletingParticipant = ref<Participant | null>(null)

function openEditModal(participant: Participant): void {
  deletingParticipant.value = null
  editingParticipant.value = participant
}

function closeEditModal(): void {
  editingParticipant.value = null
}

function saveParticipant(data: ParticipantFormData): void {
  if (!editingParticipant.value) {
    return
  }

  updateParticipant(editingParticipant.value.id, data)
  closeEditModal()
}

function openDeleteModal(participant: Participant): void {
  editingParticipant.value = null
  deletingParticipant.value = participant
}

function closeDeleteModal(): void {
  deletingParticipant.value = null
}

function confirmDelete(): void {
  if (!deletingParticipant.value) {
    return
  }

  deleteParticipant(deletingParticipant.value.id)
  closeDeleteModal()
}
</script>

<template>
  <main class="lottery-app">
    <p v-if="storageError" class="storage-error" role="alert">
      {{ storageError }}
    </p>

    <WinnersBlock
      :winners="winners"
      :can-choose-winner="canChooseWinner"
      @new-winner="chooseWinner"
      @remove-winner="removeWinner"
    />

    <RegistrationBlock :participants="participants" @save="addParticipant" />

    <ParticipantsTable
      :participants="participants"
      @edit="openEditModal"
      @delete="openDeleteModal"
    />
  </main>

  <AppModal :open="editingParticipant !== null" @close="closeEditModal">
    <template #header> Редагувати дані </template>

    <ParticipantForm
      v-if="editingParticipant"
      :key="editingParticipant.id"
      :participants="participants"
      :participant="editingParticipant"
      submit-label="Оновити дані"
      id-prefix="editing"
      @save="saveParticipant"
    />
  </AppModal>

  <AppModal :open="deletingParticipant !== null" @close="closeDeleteModal">
    <template #header> Видалити учасника </template>

    <p v-if="deletingParticipant" class="delete-confirmation">
      Ви дійсно бажаєте видалити учасника «{{ deletingParticipant.name }}», «{{
        deletingParticipant.email
      }}»?
    </p>

    <template #footer>
      <BaseButton variant="secondary" @click="closeDeleteModal"> Ні </BaseButton>

      <BaseButton variant="danger" @click="confirmDelete"> Так </BaseButton>
    </template>
  </AppModal>
</template>
