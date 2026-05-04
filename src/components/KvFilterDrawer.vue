<template>
  <div v-if="open" class="fixed inset-0 z-[70]">
    <div class="absolute inset-0 bg-black/35" @click="$emit('close')" />
    <aside class="absolute right-0 top-0 h-full w-full sm:w-[520px] ui-surface border-l ui-border-strong shadow-2xl flex flex-col">
      <div class="px-5 py-4 flex items-center justify-between border-b ui-border-strong">
        <h2 class="text-xl font-semibold ui-text">Filter</h2>
        <button class="ui-primary font-semibold" @click="resetAll">Reset</button>
      </div>

      <div class="px-5 py-4 border-b ui-border-strong">
        <div class="flex items-center gap-3 ui-text">
          <Icon icon="search" class="w-4 h-4 ui-primary" />
          <input v-model="search" placeholder="Filter Search" class="w-full bg-transparent outline-none text-base placeholder:ui-text" />
        </div>
      </div>

      <div class="flex-1 overflow-auto">
        <div v-for="field in visibleFields" :key="field.key" class="border-b ui-border-strong">
          <button class="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-(--ui-surface-muted)" @click="toggleField(field.key)">
            <span class="text-base ui-text font-medium flex items-center gap-2">
              {{ field.label }}
              <span v-if="fieldRuleCount(field.key) > 0" class="inline-flex items-center justify-center min-w-5 h-5 rounded-full text-xs ui-primary-bg text-white px-1">
                {{ fieldRuleCount(field.key) }}
              </span>
            </span>
            <span class="flex items-center gap-2">
              <button
                v-if="fieldRuleCount(field.key) > 0"
                class="h-5 min-w-7 px-1 rounded-full border ui-border-strong inline-flex items-center justify-center ui-text/80 hover:ui-primary hover:border-(--ui-primary)"
                @click.stop="clearFieldRules(field.key)"
                title="Clear filter"
              >
                <Icon icon="xmark" class="w-2.5 h-2.5" />
              </button>
              <Icon icon="chevron-right" class="w-4 h-4 ui-primary" />
            </span>
          </button>

          <div v-if="expandedField === field.key" class="ui-surface-muted px-5 pb-5">
            <div class="flex items-center gap-3 py-3">
              <span class="text-sm font-semibold ui-text">{{ field.label }}</span>
              <select v-model="operator" class="ml-auto rounded-md ui-surface border ui-border-strong px-3 py-2 text-sm ui-text">
                <option value="equals">Is</option>
                <option value="not_equals">Is not</option>
                <option value="contains">Contains</option>
              </select>
            </div>

            <div class="flex items-center gap-3 border-b border-(--ui-primary) pb-2 mb-3">
              <Icon icon="search" class="w-4 h-4 ui-primary" />
              <input v-model="valueSearch" placeholder="Search" class="w-full bg-transparent outline-none text-sm ui-text" />
            </div>

            <div v-if="field.type === 'date'" class="space-y-3">
              <label v-for="option in filteredFieldOptions(field)" :key="String(option.value)" class="flex items-center gap-2 text-sm ui-text cursor-pointer">
                <input type="radio" :name="`field-${field.key}`" :value="option.value" @change="addRule(field, option.value)">
                <span>{{ option.label }}</span>
              </label>

              <div class="grid grid-cols-2 gap-2">
                <input v-model="dateFrom" type="date" class="w-full ui-surface border ui-border-strong rounded-md px-2 py-1 text-sm ui-text">
                <input v-model="dateTo" type="date" class="w-full ui-surface border ui-border-strong rounded-md px-2 py-1 text-sm ui-text">
              </div>
              <button class="px-3 py-1.5 rounded-md ui-primary-bg text-white text-sm" @click="addDateRangeRule(field)">Apply Date Range</button>
            </div>

            <div v-else class="space-y-2 max-h-56 overflow-auto">
              <label v-for="option in filteredFieldOptions(field)" :key="String(option.value)" class="flex items-center gap-2 text-sm ui-text cursor-pointer">
                <input type="radio" :name="`field-${field.key}`" :value="option.value" @change="addRule(field, option.value)">
                <span>{{ option.label }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="px-5 py-4 border-t ui-border-strong">
        <div class="flex gap-6 text-sm mb-4 ui-text">
          <button class="flex items-center gap-2" @click="setLogic('any')">
            <span class="w-4 h-4 rounded-full border-2" :class="logic === 'any' ? 'border-(--ui-primary)' : 'ui-border-strong'" /> Any of these
          </button>
          <button class="flex items-center gap-2" @click="setLogic('all')">
            <span class="w-4 h-4 rounded-full border-2" :class="logic === 'all' ? 'border-(--ui-primary)' : 'ui-border-strong'" /> All of these
          </button>
        </div>
        <div class="flex gap-3">
          <button class="px-5 py-2 rounded-lg ui-primary-bg text-white text-sm" @click="apply">Find</button>
          <button class="px-5 py-2 rounded-lg border border-(--ui-primary) ui-primary text-sm" @click="$emit('close')">Cancel</button>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  fields: { type: Array, default: () => [] },
  modelValue: { type: Object, default: () => ({ logic: 'all', rules: [] }) }
})

const emit = defineEmits(['close', 'update:modelValue', 'apply'])
const search = ref('')
const expandedField = ref('')
const operator = ref('equals')
const valueSearch = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const logic = ref('all')
const localRules = ref([])

watch(() => props.modelValue, (v) => {
  logic.value = v?.logic || 'all'
  localRules.value = Array.isArray(v?.rules) ? [...v.rules] : []
}, { immediate: true, deep: true })

const visibleFields = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.fields
  return props.fields.filter(f => String(f.label).toLowerCase().includes(q))
})

const fieldRuleCount = (fieldKey) => localRules.value.filter(r => r.field === fieldKey).length
const clearFieldRules = (fieldKey) => {
  localRules.value = localRules.value.filter(r => r.field !== fieldKey)
}

const filteredFieldOptions = (field) => {
  const fallbackDateOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'today_overdue', label: 'Today + Overdue' }
  ]
  const options = Array.isArray(field.options) && field.options.length > 0
    ? field.options
    : (field.type === 'date' ? fallbackDateOptions : [])

  const q = valueSearch.value.trim().toLowerCase()
  if (!q) return options
  return options.filter(o => String(o.label).toLowerCase().includes(q))
}

const toggleField = (key) => { expandedField.value = expandedField.value === key ? '' : key }
const setLogic = (v) => { logic.value = v }

const addRule = (field, value) => {
  localRules.value = localRules.value.filter(r => r.field !== field.key)
  localRules.value.push({
    id: `${field.key}-${Date.now()}`,
    field: field.key,
    label: field.label,
    operator: operator.value,
    value
  })
}

const addDateRangeRule = (field) => {
  if (!dateFrom.value && !dateTo.value) return
  localRules.value = localRules.value.filter(r => r.field !== field.key)
  localRules.value.push({
    id: `${field.key}-${Date.now()}`,
    field: field.key,
    label: field.label,
    operator: 'between',
    value: { from: dateFrom.value, to: dateTo.value }
  })
}

const apply = () => {
  const payload = { logic: logic.value, rules: localRules.value }
  emit('update:modelValue', payload)
  emit('apply', payload)
  emit('close')
}

const resetAll = () => {
  localRules.value = []
  logic.value = 'all'
  dateFrom.value = ''
  dateTo.value = ''
  emit('update:modelValue', { logic: 'all', rules: [] })
}
</script>
