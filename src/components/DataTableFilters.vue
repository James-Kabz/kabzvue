<script setup>
import Button from './Button.vue'
import FileUpload from './FileUpload.vue'
import { computed, ref } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'
import Icon from './Icon.vue'
import KvFilterDrawer from './KvFilterDrawer.vue'

const props = defineProps({
  drawerOpen: {
    type: Boolean,
    default: undefined
  },
  showFilterButton: {
    type: Boolean,
    default: true
  },
  searchQuery: { type: String, default: '' },
  showSearch: { type: Boolean, default: false },
  searchPlaceholder: { type: String, default: 'Search...' },
  drilldownFilters: {
    type: Object,
    default: () => ({ logic: 'all', rules: [] })
  },
  selectedStatus: { type: String, default: '' },
  statusOptions: { type: Array, default: () => [] },
  showDateFilter: { type: Boolean, default: false },
  dateFrom: { type: String, default: '' },
  dateTo: { type: String, default: '' },
  selectFilters: { type: Array, default: () => [] },
  dateFilters: { type: Array, default: () => [] },
  numberFilters: { type: Array, default: () => [] },
  multiSelectFilters: { type: Array, default: () => [] },
  showExport: { type: Boolean, default: false },
  showTableInfo: { type: Boolean, default: true },
  showFilters: { type: Boolean, default: true },
  showFileUpload: { type: Boolean, default: false },
  fileUploadMultiple: { type: Boolean, default: false },
  fileUploadAccept: { type: String, default: '' },
  fileUploadMaxSize: { type: Number, default: null },
  fileUploadVariant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'dashed'].includes(value)
  },
  totalItems: { type: Number, default: 0 },
  itemLabel: { type: String, default: 'items' },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'minimal', 'bordered'].includes(value)
  },
  padding: {
    type: String,
    default: 'normal',
    validator: (value) => ['compact', 'normal', 'comfortable'].includes(value)
  },
  themeScope: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'module'].includes(value)
  }
})

const emit = defineEmits([
  'update:selectedStatus',
  'update:dateFrom',
  'update:dateTo',
  'update:dateFilters',
  'update:selectFilters',
  'update:numberFilters',
  'update:multiSelectFilters',
  'update:drilldownFilters',
  'update:drawerOpen',
  'export',
  'clear-filters',
  'files-selected',
  'file-removed'
])

const isFileUploadModalOpen = ref(false)
const showDrilldownPanel = ref(false)
const isDrawerOpen = computed(() =>
  typeof props.drawerOpen === 'boolean' ? props.drawerOpen : showDrilldownPanel.value
)

const openFileUploadModal = () => { isFileUploadModalOpen.value = true }
const closeFileUploadModal = () => { isFileUploadModalOpen.value = false }
const handleFilesSelected = (files) => { emit('files-selected', files) }
const handleFileRemoved = (files) => { emit('file-removed', files) }

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
  defaultVariants: { variant: 'default', padding: 'normal' }
})

const buttonVariants = cva('rounded-lg flex items-center font-medium transition-all', {
  variants: {
    variant: {
      default: 'ui-text hover:text-(--ui-text) border ui-border-strong hover:brightness-105',
      ghost: 'ui-text hover:text-(--ui-text) hover:bg-(--ui-surface)'
    },
    size: {
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2.5 text-sm'
    }
  },
  defaultVariants: { variant: 'default', size: 'md' }
})

const drilldownFields = computed(() => {
  const selectFields = props.selectFilters.map(filter => ({ key: filter.key, label: filter.label, type: 'select', options: filter.options || [] }))
  const dateFields = props.dateFilters.map(filter => ({ key: filter.key, label: filter.label, type: 'date', options: filter.options || [] }))
  const numberFields = props.numberFilters.map(filter => ({ key: filter.key, label: filter.label, type: 'number', options: filter.options || [] }))
  const multiFields = props.multiSelectFilters.map(filter => ({ key: filter.key, label: filter.label, type: 'multi', options: filter.options || [] }))
  return [...selectFields, ...dateFields, ...numberFields, ...multiFields]
})

const drilldownRules = computed(() => Array.isArray(props.drilldownFilters?.rules) ? props.drilldownFilters.rules : [])

const hasActiveFilters = computed(() => {
  const hasStatus = props.selectedStatus
  const hasLegacyDates = props.dateFrom || props.dateTo
  const hasSelectFilters = props.selectFilters.some(f => f.value)
  const hasDynamicDates = props.dateFilters.some(f => f.from || f.to)
  const hasNumberFilters = props.numberFilters.some(f => f.min || f.max)
  const hasMultiSelectFilters = props.multiSelectFilters.some(f => f.selected && f.selected.length > 0)
  return hasStatus || hasLegacyDates || hasSelectFilters || hasDynamicDates || hasNumberFilters || hasMultiSelectFilters || drilldownRules.value.length > 0
})

const activeFiltersDisplay = computed(() => {
  const filters = []

  props.selectFilters.forEach(filter => {
    if (filter.value) {
      const option = filter.options.find(opt => opt.value === filter.value)
      filters.push({ key: `select-${filter.key}`, label: filter.label, value: option?.label || filter.value, icon: 'filter' })
    }
  })

  props.dateFilters.forEach(dateFilter => {
    if (dateFilter.from || dateFilter.to) {
      const value = dateFilter.from && dateFilter.to ? `${dateFilter.from} to ${dateFilter.to}` : (dateFilter.from ? `From ${dateFilter.from}` : `Until ${dateFilter.to}`)
      filters.push({ key: `date-${dateFilter.key}`, label: dateFilter.label, value, icon: 'calendar' })
    }
  })

  props.numberFilters.forEach(numberFilter => {
    if (numberFilter.min || numberFilter.max) {
      const value = numberFilter.min && numberFilter.max ? `${numberFilter.min} to ${numberFilter.max}` : (numberFilter.min ? `Min ${numberFilter.min}` : `Max ${numberFilter.max}`)
      filters.push({ key: `number-${numberFilter.key}`, label: numberFilter.label, value, icon: 'hashtag' })
    }
  })

  props.multiSelectFilters.forEach(multiFilter => {
    if (multiFilter.selected && multiFilter.selected.length > 0) {
      const labels = multiFilter.selected.map(value => multiFilter.options.find(opt => opt.value === value)?.label || value)
      filters.push({ key: `multi-${multiFilter.key}`, label: multiFilter.label, value: labels.join(', '), icon: 'list' })
    }
  })

  return filters
})

const filtersClasses = computed(() => cn(filtersVariants({ variant: props.variant, padding: props.padding })))
const rootContainerClasses = computed(() => cn('border ui-border rounded-2xl mb-2 ui-surface overflow-hidden', props.themeScope === 'module' && 'kv-module-themed-filters'))
const filterButtonClasses = computed(() => cn(buttonVariants({ variant: hasActiveFilters.value ? 'default' : 'default', size: 'lg' }), 'gap-2'))
const clearFiltersButtonClasses = computed(() => cn(buttonVariants({ variant: 'ghost', size: 'md' })))
const exportButtonClasses = computed(() => cn(buttonVariants({ variant: 'default', size: 'lg' })))
const filterCountBadgeClasses = computed(() => 'ui-surface ui-primary text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center font-semibold')
const activeFiltersContainerClasses = computed(() => 'px-6 py-3 ui-primary-soft border-t border-(--ui-primary-soft)')
const activeFiltersLabelClasses = computed(() => 'text-sm font-semibold ui-primary')
const activeFilterTagClasses = computed(() => 'flex items-center gap-1.5 ui-bg border border-(--ui-primary-soft) ui-text px-3 py-1.5 rounded-full text-sm font-medium')
const activeFilterRemoveButtonClasses = computed(() => 'ui-primary hover:text-(--ui-primary) ml-1 hover:bg-(--ui-primary-soft) rounded-full p-0.5 transition-all')

const clearFilters = () => {
  emit('update:selectedStatus', '')
  emit('update:dateFrom', '')
  emit('update:dateTo', '')
  emit('update:selectFilters', props.selectFilters.map(filter => ({ ...filter, value: '' })))
  emit('update:dateFilters', props.dateFilters.map(filter => ({ ...filter, from: '', to: '' })))
  emit('update:numberFilters', props.numberFilters.map(filter => ({ ...filter, min: '', max: '' })))
  emit('update:multiSelectFilters', props.multiSelectFilters.map(filter => ({ ...filter, selected: [] })))
  emit('update:drilldownFilters', { logic: 'all', rules: [] })
  emit('clear-filters')
}

const toggleDrilldownPanel = () => {
  const next = !isDrawerOpen.value
  showDrilldownPanel.value = next
  emit('update:drawerOpen', next)
}
const closeDrilldownPanel = () => {
  showDrilldownPanel.value = false
  emit('update:drawerOpen', false)
}

const syncLegacyFiltersFromRules = (payload) => {
  const rules = Array.isArray(payload?.rules) ? payload.rules : []

  const nextSelect = props.selectFilters.map((f) => ({ ...f, value: '' }))
  const nextDate = props.dateFilters.map((f) => ({ ...f, from: '', to: '' }))
  const nextNumber = props.numberFilters.map((f) => ({ ...f, min: '', max: '' }))
  const nextMulti = props.multiSelectFilters.map((f) => ({ ...f, selected: [] }))

  for (const rule of rules) {
    const selectMatch = nextSelect.find((f) => f.key === rule.field)
    if (selectMatch && (rule.operator === 'equals' || rule.operator === 'contains')) {
      selectMatch.value = rule.value ?? ''
      continue
    }

    const dateMatch = nextDate.find((f) => f.key === rule.field)
    if (dateMatch) {
      if (rule.operator === 'between' && rule.value && typeof rule.value === 'object') {
        dateMatch.from = rule.value.from || ''
        dateMatch.to = rule.value.to || ''
      }
      continue
    }

    const numberMatch = nextNumber.find((f) => f.key === rule.field)
    if (numberMatch) {
      if (rule.operator === 'between' && rule.value && typeof rule.value === 'object') {
        numberMatch.min = rule.value.from ?? ''
        numberMatch.max = rule.value.to ?? ''
      } else if (rule.operator === 'equals') {
        numberMatch.min = rule.value ?? ''
        numberMatch.max = rule.value ?? ''
      }
      continue
    }

    const multiMatch = nextMulti.find((f) => f.key === rule.field)
    if (multiMatch) {
      multiMatch.selected = Array.isArray(rule.value)
        ? rule.value
        : (rule.value == null ? [] : [rule.value])
    }
  }

  emit('update:selectFilters', nextSelect)
  emit('update:dateFilters', nextDate)
  emit('update:numberFilters', nextNumber)
  emit('update:multiSelectFilters', nextMulti)
}

const handleDrilldownModelUpdate = (payload) => {
  emit('update:drilldownFilters', payload)
  syncLegacyFiltersFromRules(payload)
}

const removeFilter = (filterKey) => {
  if (filterKey.startsWith('select-')) {
    const key = filterKey.replace('select-', '')
    emit('update:selectFilters', props.selectFilters.map(filter => filter.key === key ? { ...filter, value: '' } : filter))
  } else if (filterKey.startsWith('date-')) {
    const key = filterKey.replace('date-', '')
    emit('update:dateFilters', props.dateFilters.map(filter => filter.key === key ? { ...filter, from: '', to: '' } : filter))
  } else if (filterKey.startsWith('number-')) {
    const key = filterKey.replace('number-', '')
    emit('update:numberFilters', props.numberFilters.map(filter => filter.key === key ? { ...filter, min: '', max: '' } : filter))
  } else if (filterKey.startsWith('multi-')) {
    const key = filterKey.replace('multi-', '')
    emit('update:multiSelectFilters', props.multiSelectFilters.map(filter => filter.key === key ? { ...filter, selected: [] } : filter))
  }
}
</script>

<template>
  <div :class="rootContainerClasses">
    <div :class="filtersClasses">
      <button v-if="showFilters && showFilterButton" :class="filterButtonClasses" @click="toggleDrilldownPanel">
        <Icon icon="filter" class="w-4 h-4" />
        Filter
        <span v-if="drilldownRules.length > 0" :class="filterCountBadgeClasses">{{ drilldownRules.length }}</span>
        <Icon :icon="isDrawerOpen ? 'chevron-up' : 'chevron-down'" class="w-4 h-4 ml-1" />
      </button>

      <div class="flex items-center gap-3 ml-auto">
        <div v-if="showFileUpload">
          <Button variant="default" size="lg" @click="openFileUploadModal">
            <Icon icon="upload" class="w-4 h-4 mr-2" />
            Upload Files
          </Button>
        </div>

        <Button v-if="hasActiveFilters" :class="clearFiltersButtonClasses" @click="clearFilters">
          <Icon icon="rotate-left" class="w-4 h-4 mr-2" />
          Clear All
        </Button>

        <Button v-if="showExport" :class="exportButtonClasses" @click="$emit('export')">
          <Icon icon="download" class="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>
    </div>

    <KvFilterDrawer
      :open="showFilters && isDrawerOpen"
      :fields="drilldownFields"
      :model-value="drilldownFilters"
      @update:modelValue="handleDrilldownModelUpdate"
      @close="closeDrilldownPanel"
    />

    <div v-if="showFilters && activeFiltersDisplay.length > 0" :class="activeFiltersContainerClasses">
      <div class="flex items-center gap-3 flex-wrap">
        <span :class="activeFiltersLabelClasses">Active filters:</span>
        <div v-for="filter in activeFiltersDisplay" :key="filter.key" :class="activeFilterTagClasses">
          <Icon :icon="filter.icon" class="w-3 h-3" />
          <span>{{ filter.label }}: {{ filter.value }}</span>
          <button :class="activeFilterRemoveButtonClasses" @click="removeFilter(filter.key)">
            <Icon icon="circle-xmark" class="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  </div>

  <div
    v-if="showFileUpload && isFileUploadModalOpen"
    class="fixed inset-0 ui-bg backdrop-blur-3xl z-50 flex items-center justify-center p-4"
    @click.self="closeFileUploadModal"
  >
    <div class="rounded-xl shadow-2xl max-w-2xl w-full p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold ui-text">Upload Files</h3>
        <button class="ui-text hover:text-(--ui-text) p-2 hover:bg-(--ui-surface) rounded-full transition-all" @click="closeFileUploadModal">
          <Icon icon="circle-xmark" class="w-5 h-5" />
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
        <Button variant="default" @click="closeFileUploadModal">Close</Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kv-module-themed-filters {
  border-color: var(--module-border, var(--ui-border-strong));
  background: color-mix(in oklab, var(--module-soft-alt, transparent) 65%, var(--ui-bg) 35%);
}

.kv-module-themed-filters :deep(button) {
  border-color: var(--module-border, var(--ui-border-strong));
}
</style>
