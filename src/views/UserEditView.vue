<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from 'vue-router'
import UserForm from '@/components/UserForm.vue'
import { useUsersStore } from '@/stores/users'
import type { CreateUserDto, User } from '@/types/user'

const props = defineProps<{
  id: string
  user: User
}>()

const route = useRoute()
const router = useRouter()
const usersStore = useUsersStore()

async function saveUser(data: CreateUserDto): Promise<void> {
  await usersStore.updateUser(Number(props.id), data)

  await router.push({
    name: 'users',
    query: route.query,
  })
}
</script>

<template>
  <section class="user-edit-section">
    <h2 class="section-title">Редагування користувача</h2>

    <UserForm :key="user.id" :user="user" :save="saveUser" submit-label="Оновити дані" />

    <RouterLink
      :to="{
        name: 'user-details',
        params: { id },
        query: route.query,
      }"
      class="project-link user-edit-cancel"
    >
      Скасувати
    </RouterLink>
  </section>
</template>
