<template>
  <div class="relative w-full">
    <!-- Input Field -->
    <div class="relative">
      <input
        :id="id"
        type="text"
        :value="displayValue"
        readonly
        :disabled="disabled"
        :placeholder="placeholder"
        :required="required"
        :aria-describedby="ariaDescribedby"
        class="w-full px-3 py-2 pr-10 border ui-border-strong  rounded-md bg-(----ui-bg)  ui-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-(--ui-primary) focus:border-(--ui-primary) cursor-pointer disabled:bg-(--ui-surface) disabled:text-(--ui-text) disabled:cursor-not-allowed"
        @click="toggleCalendar"
      >
      
      <!-- Calendar Icon -->
      <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          class="w-5 h-5 ui-text"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>

      <!-- Clear Button -->
      <button
        v-if="clearable && displayValue && !disabled"
        type="button"
        class="absolute right-9 top-1/2 -translate-y-1/2 p-1 hover:bg-(--ui-surface) rounded"
        aria-label="Clear date"
        @click.stop="clearDate"
      >
        <svg
          class="w-4 h-4 ui-text"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Calendar Dropdown -->
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        :class="['absolute z-99999 mt-2 rounded-lg shadow-lg p-4 ui-surface', calendarPosition]"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-3">
          <button
            type="button"
            class="p-1 hover:bg-(--ui-surface) rounded"
            aria-label="Previous Month"
            @click="prevMonth"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 18l-6-6 6-6"
              />
            </svg>
          </button>

          <div class="text-sm font-medium">
            {{ monthName }} {{ currentYear }}
          </div>

          <button
            type="button"
            class="p-1 hover:bg-(--ui-surface) rounded"
            aria-label="Next Month"
            @click="nextMonth"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 18l6-6-6-6"
              />
            </svg>
          </button>
        </div>

        <!-- Weekdays -->
        <div class="grid grid-cols-7 gap-1 mb-2">
          <div
            v-for="day in weekdays"
            :key="day"
            class="text-center text-xs font-medium ui-text py-1"
          >
            {{ day }}
          </div>
        </div>

        <!-- Calendar Grid -->
        <div class="grid grid-cols-7 gap-1">
          <!-- Previous month days -->
          <div
            v-for="(day, index) in leadingDays"
            :key="'prev-' + index"
            class="text-center text-sm ui-text py-2"
          >
            {{ day }}
          </div>

          <!-- Current month days -->
          <button
            v-for="day in daysInMonth"
            :key="day"
            type="button"
            :disabled="isDateDisabled(day)"
            :class="[
              'w-8 h-8 text-sm rounded flex items-center justify-center',
              isSelected(day) ? 'ui-primary-bg ui-text' : 'hover:bg-(--ui-surface)',
              isDateDisabled(day) ? 'ui-text cursor-not-allowed' : ''
            ]"
            @click="selectDate(day)"
          >
            {{ day }}
          </button>

          <!-- Next month days -->
          <div
            v-for="(day, index) in trailingDays"
            :key="'next-' + index"
            class="text-center text-sm ui-text py-2"
          >
            {{ day }}
          </div>
        </div>

        <!-- Footer with Today button -->
        <div
          v-if="showToday"
          class="mt-4 pt-3 border-t ui-border-strong"
        >
          <button
            type="button"
            class="w-full px-3 py-2 text-sm font-medium ui-primary hover:bg-(--ui-primary-soft) rounded-lg transition-colors"
            @click="selectToday"
          >
            Today
          </button>
        </div>
      </div>
    </transition>

    <!-- Backdrop to close calendar -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-99998"
      @click="closeCalendar"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  id: String,
  modelValue: [String, Date],
  disabled: Boolean,
  required: Boolean,
  min: [String, Date],
  max: [String, Date],
  placeholder: {
    type: String,
    default: 'Select date'
  },
  format: {
    type: String,
    default: 'MM/DD/YYYY'
  },
  clearable: {
    type: Boolean,
    default: true
  },
  showToday: {
    type: Boolean,
    default: true
  },
  calendarPosition: {
    type: String,
    default: 'left-0'
  },
  ariaDescribedby: String
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())
const selectedDate = ref(null)

const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const monthName = computed(() =>
  new Date(currentYear.value, currentMonth.value).toLocaleString('default', {
    month: 'long'
  })
)

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay()
})

const leadingDays = computed(() => {
  const prevMonthDays = new Date(currentYear.value, currentMonth.value, 0).getDate()
  const count = firstDayOfMonth.value
  return Array.from({ length: count }, (_, i) => prevMonthDays - count + i + 1)
})

const trailingDays = computed(() => {
  const totalCells = leadingDays.value.length + daysInMonth.value
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7)
  return Array.from({ length: remaining }, (_, i) => i + 1)
})

const displayValue = computed(() => {
  if (!selectedDate.value) return ''
  return formatDate(selectedDate.value)
})

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const year = d.getFullYear()
  
  return props.format
    .replace('MM', month)
    .replace('DD', day)
    .replace('YYYY', year)
}

function parseDate(value) {
  if (!value) return null
  if (value instanceof Date) return value
  
  // Try to parse string date
  const date = new Date(value)
  return isNaN(date.getTime()) ? null : date
}


function isSelected(day) {
  if (!selectedDate.value) return false
  const date = new Date(selectedDate.value)
  return (
    date.getDate() === day &&
    date.getMonth() === currentMonth.value &&
    date.getFullYear() === currentYear.value
  )
}

function isDateDisabled(day) {
  const date = new Date(currentYear.value, currentMonth.value, day)
  
  if (props.min) {
    const minDate = parseDate(props.min)
    if (minDate && date < minDate) return true
  }
  
  if (props.max) {
    const maxDate = parseDate(props.max)
    if (maxDate && date > maxDate) return true
  }
  
  return false
}

function toggleCalendar() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function closeCalendar() {
  isOpen.value = false
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function selectDate(day) {
  if (isDateDisabled(day)) return

  const date = new Date(currentYear.value, currentMonth.value, day)
  selectedDate.value = date

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const dayString = String(date.getDate()).padStart(2, '0')

  emit('update:modelValue', `${year}-${month}-${dayString}`)

  isOpen.value = false
}

function selectToday() {
  currentMonth.value = today.getMonth()
  currentYear.value = today.getFullYear()
  selectDate(today.getDate())
}

function clearDate() {
  selectedDate.value = null
  emit('update:modelValue', '')
}

// Watch for external changes
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    const date = parseDate(newVal)
    if (date) {
      selectedDate.value = date
      currentMonth.value = date.getMonth()
      currentYear.value = date.getFullYear()
    }
  } else {
    selectedDate.value = null
  }
}, { immediate: true })

// Handle Escape key to close calendar
function handleEscape(e) {
  if (e.key === 'Escape' && isOpen.value) {
    closeCalendar()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>
