<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import Badge from './Badge.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  options: {
    type: Array,
    required: true,
    validator: (options) => options.every(option => option.value !== undefined && option.label)
  },
  id: {
    type: String,
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: 'Select options'
  },
  hasError: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const searchQuery = ref('')
const searchInput = ref(null)
const filteredOptions = ref([...props.options])
const buttonRef = ref(null)
const dropdownStyle = ref({})

const selectedLabels = computed(() => {
  return props.options
    .filter(option => props.modelValue.includes(option.value))
    .map(option => option.label)
})

const updateDropdownPosition = () => {
  if (!buttonRef.value) return

  const rect = buttonRef.value.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const spaceBelow = viewportHeight - rect.bottom
  const dropdownHeight = 320 // approximate max height of dropdown

  // Position above if there's not enough space below
  if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
    dropdownStyle.value = {
      position: 'fixed',
      bottom: `${viewportHeight - rect.top + 4}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      zIndex: 9999
    }
  } else {
    dropdownStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      zIndex: 9999
    }
  }
}

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      updateDropdownPosition()
      nextTick(() => {
        searchInput.value?.focus()
      })
    } else {
      searchQuery.value = ''
      filteredOptions.value = [...props.options]
    }
  }
}

const toggleOption = (value) => {
  let newValue
  if (props.modelValue.includes(value)) {
    newValue = props.modelValue.filter(v => v !== value)
  } else {
    newValue = [...props.modelValue, value]
  }
  emit('update:modelValue', newValue)
}

const filterOptions = () => {
  if (!searchQuery.value.trim()) {
    filteredOptions.value = [...props.options]
  } else {
    const query = searchQuery.value.toLowerCase()
    filteredOptions.value = props.options.filter(option =>
      option.label.toLowerCase().includes(query)
    )
  }
}

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    isOpen.value = false
    searchQuery.value = ''
    filteredOptions.value = [...props.options]
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!buttonRef.value) return
  const target = event.target
  if (target && !buttonRef.value.contains(target) && !target.closest('[data-multiselect-dropdown]')) {
    isOpen.value = false
    searchQuery.value = ''
    filteredOptions.value = [...props.options]
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', updateDropdownPosition, true)
  window.addEventListener('resize', updateDropdownPosition)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', updateDropdownPosition, true)
  window.removeEventListener('resize', updateDropdownPosition)
})

// Watch for options changes
watch(() => props.options, (newOptions) => {
  filteredOptions.value = [...newOptions]
}, { immediate: true })

watch(isOpen, (open) => {
  if (open) {
    updateDropdownPosition()
  }
})
</script>

<template>
  <div class="relative">
    <button
      :id="id"
      ref="buttonRef"
      type="button"
      :disabled="disabled"
      :class="[
        'w-full px-3 py-2.5 text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-(--ui-primary) ui-surface  min-h-[42px]',
        hasError ? 'border-(--ui-danger)' : 'ui-border-strong ',
        disabled ? 'ui-surface-muted cursor-not-allowed opacity-50' : 'hover:border-(--ui-border-strong)'
      ]"
      @click="toggleDropdown"
      @keydown="handleKeydown"
    >
      <div
        v-if="selectedLabels.length === 0"
        class="ui-text-muted"
      >
        {{ placeholder || 'Select options' }}
      </div>
      <div
        v-else
        class="flex flex-wrap gap-1.5"
      >
        <Badge
          v-for="label in selectedLabels"
          :key="label"
          variant="primary"
          size="sm"
        >
          {{ label }}
        </Badge>
      </div>
      <svg
        class="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 ui-text pointer-events-none transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="isOpen"
          :style="dropdownStyle"
          data-multiselect-dropdown
          class="shadow-lg max-h-72 rounded-md text-base ring-1 ring-(----ui-bg) ring-opacity-5 overflow-hidden focus:outline-none ui-surface"
        >
          <!-- Search input -->
          <div class="px-3 py-2.5 border-b ui-border-strong  ui-surface-muted">
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="Search options..."
              class="w-full px-3 py-2 text-sm border ui-border-strong  rounded-md focus:outline-none focus:ring-2 focus:ring-(--ui-primary) focus:border-transparent ui-surface placeholder:text-(--ui-text-muted)"
              @input="filterOptions"
              @keydown.stop
            >
          </div>

          <!-- Options list -->
          <div
            v-if="filteredOptions.length > 0"
            class="max-h-52 overflow-y-auto py-1"
          >
            <button
              v-for="option in filteredOptions"
              :key="option.value"
              type="button"
              class="cursor-pointer select-none relative py-2.5 pl-3 pr-9 w-full text-left hover:bg-(--ui-primary-soft) focus:bg-(--ui-primary-soft) focus:outline-none transition-colors duration-150"
              :class="{ 'ui-primary-soft': modelValue.includes(option.value) }"
              @click="toggleOption(option.value)"
            >
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  :checked="modelValue.includes(option.value)"
                  class="h-4 w-4 ui-primary focus:ring-(--ui-primary) ui-border-strong  rounded cursor-pointer pointer-events-none"
                  readonly
                  tabindex="-1"
                >
                <span
                  class="block font-normal truncate"
                  :class="{ 'ui-primary font-medium': modelValue.includes(option.value) }"
                >
                  {{ option.label }}
                </span>
              </div>
            </button>
          </div>

          <!-- No results -->
          <div
            v-else
            class="px-4 py-6 text-sm ui-text text-center"
          >
            No options found
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
