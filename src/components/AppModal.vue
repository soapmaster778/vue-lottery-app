<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const titleId = useId()
const dialog = ref<HTMLElement | null>(null)

let previousFocus: HTMLElement | null = null
let previousOverflow = ''
let scrollLocked = false

function unlockScroll(): void {
  if (scrollLocked) {
    document.body.style.overflow = previousOverflow
    scrollLocked = false
  }
}

function trapFocus(event: KeyboardEvent): void {
  if (!dialog.value) {
    return
  }

  const elements = Array.from(
    dialog.value.querySelectorAll<HTMLElement>(
      'button:not(:disabled), input:not(:disabled), ' +
        'select:not(:disabled), textarea:not(:disabled), ' +
        'a[href], [tabindex="0"]',
    ),
  ).filter((element) => element.getClientRects().length > 0)

  const first = elements[0]
  const last = elements[elements.length - 1]

  if (!first || !last) {
    event.preventDefault()
    dialog.value.focus()
    return
  }

  const active = document.activeElement

  if (event.shiftKey && (active === first || active === dialog.value)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && (active === last || active === dialog.value)) {
    event.preventDefault()
    first.focus()
  }
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null

      previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      scrollLocked = true

      await nextTick()

      if (props.open) {
        dialog.value?.focus()
      }
    } else {
      unlockScroll()
      previousFocus?.focus()
      previousFocus = null
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  unlockScroll()
  previousFocus?.focus()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="lottery-modal" @click.self="emit('close')">
        <div
          ref="dialog"
          class="modal-dialog lottery-modal-dialog"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
          @keydown.esc.stop.prevent="emit('close')"
          @keydown.tab="trapFocus"
        >
          <div class="modal-content">
            <div class="modal-header">
              <h2 :id="titleId" class="modal-title lottery-modal-title">
                <slot name="header"> Учасник </slot>
              </h2>

              <button
                type="button"
                class="modal-close"
                aria-label="Закрити вікно"
                title="Закрити вікно"
                @click="emit('close')"
              >
                <X :size="20" aria-hidden="true" />
              </button>
            </div>

            <div class="modal-body">
              <slot />
            </div>

            <div v-if="$slots.footer" class="modal-footer">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
