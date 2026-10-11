<script setup lang="ts" generic="Row extends { id: string | number }">
import type { TableColumn } from '@/types/table'

defineProps<{
  columns: readonly TableColumn<Row>[]
  rows: readonly Row[]
}>()

function getCellValue(row: Row, column: TableColumn<Row>, index: number): unknown {
  return column.value?.(row, index) ?? ''
}
</script>

<template>
  <div class="participants-table-wrapper">
    <table class="table participants-table">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="String(column.key)"
            :aria-sort="column.ariaSort"
            scope="col"
          >
            <slot :name="`header-${String(column.key)}`" :column="column">
              {{ column.label }}
            </slot>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(row, index) in rows" :key="row.id">
          <td v-for="column in columns" :key="String(column.key)">
            <slot
              :name="`cell-${String(column.key)}`"
              :row="row"
              :index="index"
              :value="getCellValue(row, column, index)"
            >
              {{ getCellValue(row, column, index) }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
