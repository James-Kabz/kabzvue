<template>
  <div class=" border-b ui-border">
    <!-- Main Filters Bar -->
    <div :class="filtersClasses">
      <!-- Search Input -->
      <div
        v-if="showSearch"
        class="flex-1 min-w-80 max-w-md"
      >
        <div class="relative group">
          <Icon
            icon="magnifying-glass"
            :class="searchIconClasses"
          />
          <input
            :model-value="searchQuery"
            :placeholder="searchPlaceholder"
            :class="searchInputClasses"
            @input="$emit('update:searchQuery', $event.target.value)"
          >
          <button
            v-if="searchQuery"
            :class="clearSearchButtonClasses"
            @click="$emit('update:searchQuery', '')"
          >
            <Icon
              icon="circle-xmark"
              class="w-3 h-3"
            />
          </button>
        </div>
      </div>

      <!-- Dynamic Select Filters -->
      <div
        v-for="filter in selectFilters"
        :key="filter.key"
        class="min-w-36"
      >
        <div class="relative">
          <Select
            :model-value="filter.value"
            :class="selectClasses"
            @change="updateSelectFilter(filter.key, $event.target.value)"
          >
            <option value="">
              {{ filter.placeholder || `All ${filter.label}` }}
            </option>
            <option
              v-for="option in filter.options"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </Select>
          <Icon
            icon="chevron-down"
            class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 ui-text pointer-events-none"
          />
        </div>
      </div>

      <!-- Legacy Status Filter (for backward compatibility) -->
      <div
        v-if="showFilters && statusOptions.length > 0"
        class="min-w-36"
      >
        <div class="relative">
          <Select
            :model-value="selectedStatus"
            :class="selectClasses"
            @change="$emit('update:selectedStatus', $event.target.value)"
          >
            <option value="">
              All Status
            </option>
            <option
              v-for="option in statusOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </Select>
          <Icon
            icon="chevron-down"
            class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 ui-text pointer-events-none"
          />
        </div>
      </div>

      <!-- Advanced Filters Toggle -->
      <button
        v-if="showFilters && (dateFilters.length > 0 || hasAdvancedFilters)"
        :class="advancedFiltersToggleClasses"
        @click="toggleAdvancedFilters"
      >
        <Icon
          icon="filter"
          class="w-4 h-4"
        />
        Filters
        <span
          v-if="activeFiltersCount > 0"
          :class="filterCountBadgeClasses"
        >
          {{ activeFiltersCount }}
        </span>
        <Icon
          :icon="showAdvancedFilters ? 'chevron-up' : 'chevron-down'"
          class="w-4 h-4 ml-1"
        />
      </button>

      <!-- Custom Filters Slot -->
      <div
        v-if="$slots.filters"
        class="flex items-center gap-2"
      >
        <slot name="filters" />
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3 ml-auto">
        <!-- File Upload Button -->
        <!-- File Upload Button -->
        <div v-if="showFileUpload">
          <Button
            variant="default"
            size="lg"
            @click="openFileUploadModal"
          >
            <Icon
              icon="upload"
              class="w-4 h-4 mr-2"
            />
            Upload Files
          </Button>
        </div>

        <!-- Clear Filters -->
        <Button
          v-if="hasActiveFilters"
          :class="clearFiltersButtonClasses"
          @click="clearFilters"
        >
          <Icon
            icon="rotate-left"
            class="w-4 h-4 mr-2"
          />
          Clear All
        </Button>

        <!-- Export Button -->
        <Button
          v-if="showExport"
          :class="exportButtonClasses"
          @click="$emit('export')"
        >
          <Icon
            icon="download"
            class="w-4 h-4 mr-2"
          />
          Export
        </Button>

      </div>
    </div>

    <!-- Advanced Filters Panel -->
    <div
      v-if="showFilters && showAdvancedFilters"
      :class="advancedFiltersContainerClasses"
    >
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Date Range Filters -->
        <div
          v-for="dateFilter in dateFilters"
          :key="dateFilter.key"
          class="space-y-3"
        >
          <div class="flex items-center justify-between">
            <label :class="dateFilterLabelClasses">
              {{ dateFilter.label }}
            </label>
            <span :class="getDateFilterStatusClasses(dateFilter)">
              {{ hasDateFilterValues(dateFilter) ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <div class="flex items-center gap-3">
            <div class="relative flex-1">
              <Icon
                icon="calendar"
                class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ui-text"
              />
              <input
                type="date"
                :model-value="dateFilter.from"
                :class="dateInputClasses"
                :placeholder="`From ${dateFilter.label}`"
                @input="updateDateFilter(dateFilter.key, 'from', $event.target.value)"
              >
            </div>
            <span :class="dateRangeSeparatorClasses">to</span>
            <div class="relative flex-1">
              <Icon
                icon="calendar"
                class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ui-text"
              />
              <input
                type="date"
                :model-value="dateFilter.to"
                :class="dateInputClasses"
                :placeholder="`To ${dateFilter.label}`"
                @input="updateDateFilter(dateFilter.key, 'to', $event.target.value)"
              >
            </div>
            <button
              v-if="hasDateFilterValues(dateFilter)"
              :class="clearDateFilterButtonClasses"
              title="Clear this filter"
              @click="clearDateFilter(dateFilter.key)"
            >
              <Icon
                icon="circle-xmark"
                class="w-4 h-4"
              />
            </button>
          </div>
        </div>

        <!-- Number Range Filters -->
        <div
          v-for="numberFilter in numberFilters"
          :key="numberFilter.key"
          class="space-y-3"
        >
          <div class="flex items-center justify-between">
            <label :class="dateFilterLabelClasses">
              {{ numberFilter.label }}
            </label>
            <span :class="getNumberFilterStatusClasses(numberFilter)">
              {{ hasNumberFilterValues(numberFilter) ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <div class="flex items-center gap-3">
            <div class="relative flex-1">
              <input
                type="number"
                :model-value="numberFilter.min"
                :class="dateInputClasses"
                :placeholder="`Min ${numberFilter.label}`"
                :step="numberFilter.step || 1"
                @input="updateNumberFilter(numberFilter.key, 'min', $event.target.value)"
              >
            </div>
            <span :class="dateRangeSeparatorClasses">to</span>
            <div class="relative flex-1">
              <input
                type="number"
                :model-value="numberFilter.max"
                :class="dateInputClasses"
                :placeholder="`Max ${numberFilter.label}`"
                :step="numberFilter.step || 1"
                @input="updateNumberFilter(numberFilter.key, 'max', $event.target.value)"
              >
            </div>
            <button
              v-if="hasNumberFilterValues(numberFilter)"
              :class="clearDateFilterButtonClasses"
              title="Clear this filter"
              @click="clearNumberFilter(numberFilter.key)"
            >
              <Icon
                icon="circle-xmark"
                class="w-4 h-4"
              />
            </button>
          </div>
        </div>

        <!-- Multi-Select Filters -->
        <div
          v-for="multiFilter in multiSelectFilters"
          :key="multiFilter.key"
          class="space-y-3"
        >
          <div class="flex items-center justify-between">
            <label :class="dateFilterLabelClasses">
              {{ multiFilter.label }}
            </label>
            <span :class="getMultiSelectFilterStatusClasses(multiFilter)">
              {{ hasMultiSelectFilterValues(multiFilter) ? `${multiFilter.selected.length} selected` : 'None' }}
            </span>
          </div>

          <div class="relative">
            <Select
              :model-value="''"
              :class="selectClasses"
              @change="toggleMultiSelectOption(multiFilter.key, $event.target.value)"
            >
              <option value="">
                Select {{ multiFilter.label }}
              </option>
              <option
                v-for="option in multiFilter.options"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </Select>
            <Icon
              icon="chevron-down"
              class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 ui-text pointer-events-none"
            />
          </div>

          <div
            v-if="multiFilter.selected.length > 0"
            class="flex flex-wrap gap-2 mt-2"
          >
            <span
              v-for="selectedValue in multiFilter.selected"
              :key="selectedValue"
              class="inline-flex items-center gap-1 ui-primary-soft ui-primary text-xs px-2 py-1 rounded-full"
            >
              {{ getMultiSelectOptionLabel(multiFilter, selectedValue) }}
              <button
                class="hover:bg-(--ui-primary-soft) rounded-full p-0.5"
                @click="removeMultiSelectOption(multiFilter.key, selectedValue)"
              >
                <Icon
                  icon="circle-xmark"
                  class="w-3 h-3"
                />
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Filters Display -->
    <div
      v-if="showFilters && activeFiltersDisplay.length > 0"
      :class="activeFiltersContainerClasses"
    >
      <div class="flex items-center gap-3 flex-wrap">
        <span :class="activeFiltersLabelClasses">Active filters:</span>
        <div
          v-for="filter in activeFiltersDisplay"
          :key="filter.key"
          :class="activeFilterTagClasses"
        >
          <Icon
            :icon="filter.icon"
            class="w-3 h-3"
          />
          <span>{{ filter.label }}: {{ filter.value }}</span>
          <button
            :class="activeFilterRemoveButtonClasses"
            @click="removeFilter(filter.key)"
          >
            <Icon
              icon="circle-xmark"
              class="w-3 h-3"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Table Info Bar -->
  </div>

  <!-- File Upload Modal -->
  <div
    v-if="showFileUpload && isFileUploadModalOpen"
    class="fixed inset-0 ui-bg backdrop-blur-3xl z-50 flex items-center justify-center p-4"
    @click.self="closeFileUploadModal"
  >
    <div class="rounded-xl shadow-2xl max-w-2xl w-full p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold ui-text">
          Upload Files
        </h3>
        <button
          class="ui-text hover:text-(--ui-text) p-2 hover:bg-(--ui-surface) rounded-full transition-all"
          @click="closeFileUploadModal"
        >
          <Icon
            icon="circle-xmark"
            class="w-5 h-5"
          />
        </button>
      </div>

      <FileUpload
        :multiple="fileUploadMultiple"
        :accept="fileUploadAccept"
        :max-size="fileUploadMaxSize"
        :variant="fileUploadVariant"
        @files-selected="handleFilesSelected"
        @file-removed="handleFileRemoved"
      />

      <div class="flex justify-end gap-3 mt-6">
        <Button
          variant="default"
          @click="closeFileUploadModal"
        >
          Close
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import Button from './Button.vue'
import Select from './Select.vue'
import FileUpload from './FileUpload.vue'
import { computed, ref } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'
import Icon from './Icon.vue'

const props = defineProps({
  searchQuery: {
    type: String,
    default: ''
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...'
  },
  // Legacy props for backward compatibility
  selectedStatus: {
    type: String,
    default: ''
  },
  statusOptions: {
    type: Array,
    default: () => []
  },
  showDateFilter: {
    type: Boolean,
    default: false
  },
  dateFrom: {
    type: String,
    default: ''
  },
  dateTo: {
    type: String,
    default: ''
  },
  // NEW: Dynamic select filters (category, status, etc.)
  selectFilters: {
    type: Array,
    default: () => [],
    validator: (filters) => {
      return filters.every(filter =>
        Object.prototype.hasOwnProperty.call(filter, 'key') &&
        Object.prototype.hasOwnProperty.call(filter, 'label') &&
        Object.prototype.hasOwnProperty.call(filter, 'options') &&
        Object.prototype.hasOwnProperty.call(filter, 'value')
      )
    }
  },
  // Date range filters
  dateFilters: {
    type: Array,
    default: () => [],
    validator: (filters) => {
      return filters.every(filter =>
        Object.prototype.hasOwnProperty.call(filter, 'key') &&
        Object.prototype.hasOwnProperty.call(filter, 'label') &&
        Object.prototype.hasOwnProperty.call(filter, 'from') &&
        Object.prototype.hasOwnProperty.call(filter, 'to')
      )
    }
  },
  // NEW: Number range filters (price, age, score, etc.)
  numberFilters: {
    type: Array,
    default: () => [],
    validator: (filters) => {
      return filters.every(filter =>
        Object.prototype.hasOwnProperty.call(filter, 'key') &&
        Object.prototype.hasOwnProperty.call(filter, 'label') &&
        Object.prototype.hasOwnProperty.call(filter, 'min') &&
        Object.prototype.hasOwnProperty.call(filter, 'max')
      )
    }
  },
  // NEW: Multi-select filters
  multiSelectFilters: {
    type: Array,
    default: () => [],
    validator: (filters) => {
      return filters.every(filter =>
        Object.prototype.hasOwnProperty.call(filter, 'key') &&
        Object.prototype.hasOwnProperty.call(filter, 'label') &&
        Object.prototype.hasOwnProperty.call(filter, 'options') &&
        Object.prototype.hasOwnProperty.call(filter, 'selected')
      )
    }
  },
  showExport: {
    type: Boolean,
    default: false
  },
  showTableInfo: {
    type: Boolean,
    default: true
  },
  showSearch: {
    type: Boolean,
    default: true
  },
  showFilters: {
    type: Boolean,
    default: true
  },
  showFileUpload: {
    type: Boolean,
    default: false
  },
  fileUploadMultiple: {
    type: Boolean,
    default: false
  },
  fileUploadAccept: {
    type: String,
    default: ''
  },
  fileUploadMaxSize: {
    type: Number,
    default: null
  },
  fileUploadVariant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'dashed'].includes(value)
  },
  totalItems: {
    type: Number,
    default: 0
  },
  itemLabel: {
    type: String,
    default: 'items'
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'minimal', 'bordered'].includes(value)
  },
  padding: {
    type: String,
    default: 'normal',
    validator: (value) => ['compact', 'normal', 'comfortable'].includes(value)
  }
})

const emit = defineEmits([
  'update:searchQuery',
  'update:selectedStatus',
  'update:dateFrom',
  'update:dateTo',
  'update:dateFilters',
  'update:selectFilters',
  'update:numberFilters',
  'update:multiSelectFilters',
  'export',
  'clear-filters',
  'files-selected',
  'file-removed'
])

// Local state
const showAdvancedFilters = ref(false)
const isFileUploadModalOpen = ref(false)


const openFileUploadModal = () => {
  isFileUploadModalOpen.value = true
}

const closeFileUploadModal = () => {
  isFileUploadModalOpen.value = false
}

const handleFilesSelected = (files) => {
  emit('files-selected', files)
  // Optionally close modal after upload completes
  // closeFileUploadModal()
}

const handleFileRemoved = (files) => {
  emit('file-removed', files)
}


// CVA Variants
const filtersVariants = cva('flex flex-wrap items-center gap-4', {
  variants: {
    variant: {
      default: 'bg-(--ui-bg) ui-border-strong shadow-sm',
      minimal: 'bg-transparent',
      bordered: 'ui-border-strong'
    },
    padding: {
      compact: 'px-4 py-3',
      normal: 'px-6 py-4',
      comfortable: 'px-8 py-6'
    }
  },
  defaultVariants: {
    variant: 'default',
    padding: 'normal'
  }
})

const inputVariants = cva('border ui-border-strong  rounded-lg focus:outline-none focus:ring-2 focus:ring-(--ui-primary) focus:border-transparent transition-all text-sm ui-surface ', {
  variants: {
    size: {
      sm: 'px-2 py-1.5',
      md: 'px-3 py-2.5',
      lg: 'px-4 py-3'
    }
  },
  defaultVariants: {
    size: 'md'
  }
})

const buttonVariants = cva('rounded-lg flex items-center font-medium transition-all', {
  variants: {
    variant: {
      default: 'ui-text hover:text-(--ui-text) border ui-border-strong  hover:brightness-105',
      primary: 'ui-text ui-primary-bg hover:bg-(--ui-primary-strong) border border-(--ui-primary) shadow-sm',
      success: 'ui-text ui-success-bg hover:bg-(--ui-success-strong) border border-(--ui-success) shadow-sm',
      ghost: 'ui-text hover:text-(--ui-text) hover:bg-(--ui-surface)'
    },
    size: {
      sm: 'px-2 py-1.5 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2.5 text-sm'
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'md'
  }
})

// Select Filter Methods
const updateSelectFilter = (key, value) => {
  const updatedFilters = props.selectFilters.map(filter =>
    filter.key === key ? { ...filter, value } : filter
  )
  emit('update:selectFilters', updatedFilters)
}

// Date Filter Methods
const hasDateFilterValues = (dateFilter) => {
  return !!(dateFilter.from || dateFilter.to)
}

const clearDateFilter = (key) => {
  const updatedFilters = props.dateFilters.map(f =>
    f.key === key ? { ...f, from: '', to: '' } : f
  )
  emit('update:dateFilters', updatedFilters)
}

const getDateFilterStatusClasses = (dateFilter) => {
  const hasValues = hasDateFilterValues(dateFilter)
  return `text-xs px-2 py-1 rounded ${hasValues ? 'ui-primary-soft ui-primary' : 'ui-surface-muted ui-text'
    }`
}

const updateDateFilter = (key, type, value) => {
  const updatedFilters = props.dateFilters.map(f =>
    f.key === key ? { ...f, [type]: value } : f
  )
  emit('update:dateFilters', updatedFilters)
}

// Number Filter Methods
const hasNumberFilterValues = (numberFilter) => {
  return !!(numberFilter.min || numberFilter.max)
}

const clearNumberFilter = (key) => {
  const updatedFilters = props.numberFilters.map(f =>
    f.key === key ? { ...f, min: '', max: '' } : f
  )
  emit('update:numberFilters', updatedFilters)
}

const getNumberFilterStatusClasses = (numberFilter) => {
  const hasValues = hasNumberFilterValues(numberFilter)
  return `text-xs px-2 py-1 rounded ${hasValues ? 'ui-primary-soft ui-primary' : 'ui-surface-muted ui-text'
    }`
}

const updateNumberFilter = (key, type, value) => {
  const updatedFilters = props.numberFilters.map(f =>
    f.key === key ? { ...f, [type]: value } : f
  )
  emit('update:numberFilters', updatedFilters)
}

// Multi-Select Filter Methods
const hasMultiSelectFilterValues = (multiFilter) => {
  return multiFilter.selected && multiFilter.selected.length > 0
}

const getMultiSelectFilterStatusClasses = (multiFilter) => {
  const hasValues = hasMultiSelectFilterValues(multiFilter)
  return `text-xs px-2 py-1 rounded ${hasValues ? 'ui-primary-soft ui-primary' : 'ui-surface-muted ui-text'
    }`
}

const toggleMultiSelectOption = (key, value) => {
  if (!value) return

  const updatedFilters = props.multiSelectFilters.map(filter => {
    if (filter.key === key) {
      const selected = filter.selected || []
      const isSelected = selected.includes(value)
      return {
        ...filter,
        selected: isSelected
          ? selected.filter(v => v !== value)
          : [...selected, value]
      }
    }
    return filter
  })
  emit('update:multiSelectFilters', updatedFilters)
}

const removeMultiSelectOption = (key, value) => {
  const updatedFilters = props.multiSelectFilters.map(filter => {
    if (filter.key === key) {
      return {
        ...filter,
        selected: filter.selected.filter(v => v !== value)
      }
    }
    return filter
  })
  emit('update:multiSelectFilters', updatedFilters)
}

const getMultiSelectOptionLabel = (multiFilter, value) => {
  const option = multiFilter.options.find(opt => opt.value === value)
  return option ? option.label : value
}

// General Methods
const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value
}

const hasAdvancedFilters = computed(() => {
  return props.numberFilters.length > 0 || props.multiSelectFilters.length > 0
})

// Computed Properties
const hasActiveFilters = computed(() => {
  const hasSearch = props.searchQuery
  const hasStatus = props.selectedStatus
  const hasLegacyDates = props.dateFrom || props.dateTo
  const hasSelectFilters = props.selectFilters.some(f => f.value)
  const hasDynamicDates = props.dateFilters.some(f => f.from || f.to)
  const hasNumberFilters = props.numberFilters.some(f => f.min || f.max)
  const hasMultiSelectFilters = props.multiSelectFilters.some(f => f.selected && f.selected.length > 0)

  return hasSearch || hasStatus || hasLegacyDates || hasSelectFilters ||
    hasDynamicDates || hasNumberFilters || hasMultiSelectFilters
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (props.searchQuery) count++
  if (props.selectedStatus) count++
  if (props.dateFrom || props.dateTo) count++
  count += props.selectFilters.filter(f => f.value).length
  count += props.dateFilters.filter(f => f.from || f.to).length
  count += props.numberFilters.filter(f => f.min || f.max).length
  count += props.multiSelectFilters.filter(f => f.selected && f.selected.length > 0).length
  return count
})

const activeFiltersDisplay = computed(() => {
  const filters = []

  // Search filter
  if (props.searchQuery && props.searchQuery.trim()) {
    filters.push({
      key: 'search',
      label: 'Search',
      value: `"${props.searchQuery}"`,
      icon: 'magnifying-glass'
    })
  }

  // Legacy status filter
  if (props.selectedStatus) {
    const statusOption = props.statusOptions.find(opt => opt.value === props.selectedStatus)
    filters.push({
      key: 'status',
      label: 'Status',
      value: statusOption?.label || props.selectedStatus,
      icon: 'filter'
    })
  }

  // Select filters
  props.selectFilters.forEach(filter => {
    if (filter.value) {
      const option = filter.options.find(opt => opt.value === filter.value)
      filters.push({
        key: `select-${filter.key}`,
        label: filter.label,
        value: option?.label || filter.value,
        icon: 'filter'
      })
    }
  })

  // Legacy date filter
  if (props.dateFrom || props.dateTo) {
    let dateValue = ''
    if (props.dateFrom && props.dateTo) {
      dateValue = `${props.dateFrom} to ${props.dateTo}`
    } else if (props.dateFrom) {
      dateValue = `From ${props.dateFrom}`
    } else if (props.dateTo) {
      dateValue = `Until ${props.dateTo}`
    }

    if (dateValue) {
      filters.push({
        key: 'date',
        label: 'Date Range',
        value: dateValue,
        icon: 'calendar'
      })
    }
  }

  // Dynamic date filters
  props.dateFilters.forEach(dateFilter => {
    if (dateFilter.from || dateFilter.to) {
      let dateValue = ''
      if (dateFilter.from && dateFilter.to) {
        dateValue = `${dateFilter.from} to ${dateFilter.to}`
      } else if (dateFilter.from) {
        dateValue = `From ${dateFilter.from}`
      } else if (dateFilter.to) {
        dateValue = `Until ${dateFilter.to}`
      }

      if (dateValue) {
        filters.push({
          key: `date-${dateFilter.key}`,
          label: dateFilter.label,
          value: dateValue,
          icon: 'calendar'
        })
      }
    }
  })

  // Number filters
  props.numberFilters.forEach(numberFilter => {
    if (numberFilter.min || numberFilter.max) {
      let numberValue = ''
      if (numberFilter.min && numberFilter.max) {
        numberValue = `${numberFilter.min} to ${numberFilter.max}`
      } else if (numberFilter.min) {
        numberValue = `Min ${numberFilter.min}`
      } else if (numberFilter.max) {
        numberValue = `Max ${numberFilter.max}`
      }

      if (numberValue) {
        filters.push({
          key: `number-${numberFilter.key}`,
          label: numberFilter.label,
          value: numberValue,
          icon: 'hashtag'
        })
      }
    }
  })

  // Multi-select filters
  props.multiSelectFilters.forEach(multiFilter => {
    if (multiFilter.selected && multiFilter.selected.length > 0) {
      const labels = multiFilter.selected.map(value => {
        const option = multiFilter.options.find(opt => opt.value === value)
        return option ? option.label : value
      })
      filters.push({
        key: `multi-${multiFilter.key}`,
        label: multiFilter.label,
        value: labels.join(', '),
        icon: 'list'
      })
    }
  })

  return filters
})

// Computed Classes
const filtersClasses = computed(() =>
  cn(filtersVariants({
    variant: props.variant,
    padding: props.padding
  }))
)

const searchIconClasses = computed(() =>
  'absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ui-text group-hover:text-(--ui-text) transition-colors'
)

const searchInputClasses = computed(() =>
  cn(
    inputVariants({ size: 'md' }),
    'w-full pl-10 pr-10 hover:border-(--ui-border-strong)'
  )
)

const clearSearchButtonClasses = computed(() =>
  'absolute right-3 top-1/2 transform -translate-y-1/2 ui-text hover:text-(--ui-text) p-1 hover:bg-(--ui-surface) rounded-full transition-all'
)

const selectClasses = computed(() =>
  cn(
    inputVariants({ size: 'md' }),
    'w-full pr-8 appearance-none hover:border-(--ui-border-strong)'
  )
)

const advancedFiltersToggleClasses = computed(() => {
  const isActive = showAdvancedFilters.value || hasActiveFilters.value
  return cn(
    buttonVariants({
      variant: isActive ? 'primary' : 'default',
      size: 'lg'
    }),
    'gap-2'
  )
})

const filterCountBadgeClasses = computed(() =>
  'ui-surface ui-primary text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center font-semibold'
)

const advancedFiltersContainerClasses = computed(() =>
  'px-6 py-4 border-t ui-border-strong ui-surface-muted'
)

const dateInputClasses = computed(() =>
  cn(inputVariants({ size: 'md' }), 'pl-10 pr-3')
)

const dateFilterLabelClasses = computed(() =>
  'text-sm font-semibold ui-text'
)

const dateRangeSeparatorClasses = computed(() =>
  'ui-text text-sm font-medium'
)

const clearDateFilterButtonClasses = computed(() =>
  'ui-text hover:text-(--ui-text) p-1.5 hover:bg-(--ui-bg) rounded-full transition-all'
)

const clearFiltersButtonClasses = computed(() =>
  cn(buttonVariants({ variant: 'ghost', size: 'md' }))
)

const exportButtonClasses = computed(() =>
  cn(buttonVariants({ variant: 'default', size: 'lg' }))
)

const activeFiltersContainerClasses = computed(() =>
  'px-6 py-3 ui-primary-soft border-t border-(--ui-primary-soft)'
)

const activeFiltersLabelClasses = computed(() =>
  'text-sm font-semibold ui-primary'
)

const activeFilterTagClasses = computed(() =>
  'flex items-center gap-1.5 ui-bg border border-(--ui-primary-soft) ui-text px-3 py-1.5 rounded-full text-sm font-medium'
)

const activeFilterRemoveButtonClasses = computed(() =>
  'ui-primary hover:text-(--ui-primary) ml-1 hover:bg-(--ui-primary-soft) rounded-full p-0.5 transition-all'
)

// Clear all filters
const clearFilters = () => {
  emit('update:searchQuery', '')
  emit('update:selectedStatus', '')
  emit('update:dateFrom', '')
  emit('update:dateTo', '')

  // Clear select filters
  const clearedSelectFilters = props.selectFilters.map(filter => ({
    ...filter,
    value: ''
  }))
  emit('update:selectFilters', clearedSelectFilters)

  // Clear date filters
  const clearedDateFilters = props.dateFilters.map(filter => ({
    ...filter,
    from: '',
    to: ''
  }))
  emit('update:dateFilters', clearedDateFilters)

  // Clear number filters
  const clearedNumberFilters = props.numberFilters.map(filter => ({
    ...filter,
    min: '',
    max: ''
  }))
  emit('update:numberFilters', clearedNumberFilters)

  // Clear multi-select filters
  const clearedMultiSelectFilters = props.multiSelectFilters.map(filter => ({
    ...filter,
    selected: []
  }))
  emit('update:multiSelectFilters', clearedMultiSelectFilters)

  emit('clear-filters')
}

// Remove individual filter
const removeFilter = (filterKey) => {
  switch (filterKey) {
    case 'search':
      emit('update:searchQuery', '')
      break
    case 'status':
      emit('update:selectedStatus', '')
      break
    case 'date':
      emit('update:dateFrom', '')
      emit('update:dateTo', '')
      break
    default:
      // Handle select filters
      if (filterKey.startsWith('select-')) {
        const selectKey = filterKey.replace('select-', '')
        const updatedFilters = props.selectFilters.map(filter =>
          filter.key === selectKey ? { ...filter, value: '' } : filter
        )
        emit('update:selectFilters', updatedFilters)
      }
      // Handle date filters
      else if (filterKey.startsWith('date-')) {
        const dateKey = filterKey.replace('date-', '')
        const updatedFilters = props.dateFilters.map(filter =>
          filter.key === dateKey ? { ...filter, from: '', to: '' } : filter
        )
        emit('update:dateFilters', updatedFilters)
      }
      // Handle number filters
      else if (filterKey.startsWith('number-')) {
        const numberKey = filterKey.replace('number-', '')
        const updatedFilters = props.numberFilters.map(filter =>
          filter.key === numberKey ? { ...filter, min: '', max: '' } : filter
        )
        emit('update:numberFilters', updatedFilters)
      }
      // Handle multi-select filters
      else if (filterKey.startsWith('multi-')) {
        const multiKey = filterKey.replace('multi-', '')
        const updatedFilters = props.multiSelectFilters.map(filter =>
          filter.key === multiKey ? { ...filter, selected: [] } : filter
        )
        emit('update:multiSelectFilters', updatedFilters)
      }
      break
  }
}
</script>
