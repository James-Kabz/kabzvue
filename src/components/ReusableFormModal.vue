<script setup>
import Modal from './Modal.vue'
import Slider from './Slider.vue'
import DatePicker from './DatePicker.vue'
import { ref, watch, computed, } from 'vue'
import FormField from './FormField.vue'
import Input from './Input.vue'
import Textarea from './Textarea.vue'
import Select from './Select.vue'
import MultiSelect from './MultiSelect.vue'
import Button from './Button.vue'
import { toast } from '../lib/toast'
import Label from './Label.vue'
import FileUpload from './FileUpload.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  modalType: {
    type: String,
    required: true,
    validator: (value) => ['create', 'edit'].includes(value),
  },
  entityName: {
    type: String,
    default: 'Item',
  },
  fields: {
    type: Array,
    required: true,
    validator: (fields) => {
      return fields.every(
        (field) =>
          field.name &&
          field.label &&
          field.type &&
          [
            'text',
            'number',
            'password',
            'textarea',
            'select',
            'checkbox',
            'slider',
            'date',
            'color',
            'email',
            'tel',
            'url',
            'time',
            'datetime-local',
            'month',
            'week',
            'file',
            'multifile', // New multi-upload field type
            'radio',
            'switch',
            'range',
            'search',
            'hidden',
            'multiselect',
            'combobox',
          ].includes(field.type),
      )
    },
  },
  initialData: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  customValidation: {
    type: Function,
    default: null,
  },
  modalSize: {
    type: String,
    default: '4xl',
    validator: (value) => ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', 'full'].includes(value)
  },
  modalHeight: {
    type: String,
    default: 'auto',
  },
  modalResizable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'submit', 'close'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isLoading = computed(() => props.loading)

const formData = ref({})
const errors = ref({})
const isInitialized = ref(false)

// Multi-upload state management (for non-multifile types)
const uploadingFilesMap = ref({}) // Map of field.name -> uploading files array
const dragOverFields = ref({}) // Map of field.name -> isDragOver boolean

// Helper function to get nested value from object using dot notation
const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// Helper function to set nested value in object using dot notation
const setNestedValue = (obj, path, value) => {
  const keys = path.split('.')
  const lastKey = keys.pop()
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {}
    return current[key]
  }, obj)
  target[lastKey] = value
}

// Initialize form data based on fields
const initializeFormData = () => {
  const data = {}
  props.fields.forEach((field) => {
    // Handle nested fields (e.g., 'socials.facebook')
    if (field.name.includes('.')) {
      const [parent] = field.name.split('.')
      if (!data[parent]) {
        data[parent] = {}
      }
      setNestedValue(data, field.name, getDefaultValue(field))
    } else if (field.type === 'checkbox' || field.type === 'switch') {
      data[field.name] = false
    } else if (field.type === 'number' || field.type === 'slider' || field.type === 'range') {
      data[field.name] = field.min !== undefined ? field.min : 0
    } else if (field.type === 'file') {
      data[field.name] = null
    } else if (field.type === 'multifile') {
      data[field.name] = []
    } else if (field.type === 'radio') {
      data[field.name] = field.options?.[0]?.value || ''
    } else if (field.type === 'multiselect') {
      data[field.name] = []
    } else if (field.type === 'combobox') {
      data[field.name] = ''
    } else {
      data[field.name] = ''
    }
  })
  return data
}

// Get default value for a field
const getDefaultValue = (field) => {
  if (field.type === 'checkbox' || field.type === 'switch') return false
  if (field.type === 'number' || field.type === 'slider' || field.type === 'range') {
    return field.min !== undefined ? field.min : 0
  }
  if (field.type === 'file') return null
  if (field.type === 'multifile') return []
  if (field.type === 'radio') return field.options?.[0]?.value || ''
  if (field.type === 'multiselect') return []
  if (field.type === 'combobox') return ''
  return ''
}

// Populate form data from initialData
const populateFormData = (data) => {
  const formValues = {}

  props.fields.forEach((field) => {
    if (field.name.includes('.')) {
      // Handle nested fields
      const value = getNestedValue(data, field.name)
      if (!formValues[field.name.split('.')[0]]) {
        formValues[field.name.split('.')[0]] = {}
      }
      setNestedValue(formValues, field.name, value !== undefined ? value : getDefaultValue(field))
    } else {
      // Handle regular fields
      const value = data?.[field.name]

      if (field.type === 'checkbox' || field.type === 'switch') {
        formValues[field.name] = value ?? false
      } else if (field.type === 'number' || field.type === 'slider' || field.type === 'range') {
        formValues[field.name] = value ?? (field.min !== undefined ? field.min : 0)
      } else if (field.type === 'file') {
        formValues[field.name] = null
      } else if (field.type === 'multifile') {
        formValues[field.name] = Array.isArray(value) ? value : []
      } else if (field.type === 'multiselect') {
        formValues[field.name] = Array.isArray(value) ? value : []
      } else {
        formValues[field.name] = value ?? getDefaultValue(field)
      }
    }
  })

  return formValues
}

// Watch for initialData changes to populate form
watch(
  () => props.initialData,
  (newData) => {
    if (props.modalType === 'edit' && newData) {
      formData.value = populateFormData(newData)
      isInitialized.value = true
    } else if (props.modalType === 'create' && newData && !isInitialized.value) {
      formData.value = populateFormData(newData)
      isInitialized.value = true
    } else if (props.modalType === 'create' && !newData) {
      formData.value = initializeFormData()
      isInitialized.value = false
    }
  },
  { immediate: true, deep: true },
)

// Watch for modal open to reset form
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      errors.value = {}
      if (props.modalType === 'create') {
        isInitialized.value = false
        if (props.initialData) {
          formData.value = populateFormData(props.initialData)
        } else {
          formData.value = initializeFormData()
        }
        isInitialized.value = true
      }
    }
  },
)

// Watch for initialData changes after initialization
watch(
  () => props.initialData,
  (newData) => {
    if (isInitialized.value && newData) {
      formData.value = populateFormData(newData)
    }
  },
  { deep: true },
)

const validateForm = () => {
  errors.value = {}
  props.fields.forEach((field) => {
    if (field.required && !field.disabled && field.type !== 'hidden') {
      const value = field.name.includes('.')
        ? getNestedValue(formData.value, field.name)
        : formData.value[field.name]

      if (field.type === 'checkbox' || field.type === 'switch') {
        if (field.required && !value) {
          errors.value[field.name] = field.errorMessage || `${field.label} is required`
        }
      } else if (field.type === 'number' || field.type === 'slider' || field.type === 'range') {
        if (value === '' || value === null || value === undefined) {
          errors.value[field.name] = field.errorMessage || `${field.label} is required`
        } else if (field.min !== undefined && Number(value) < field.min) {
          errors.value[field.name] = `${field.label} must be at least ${field.min}`
        } else if (field.max !== undefined && Number(value) > field.max) {
          errors.value[field.name] = `${field.label} must be at most ${field.max}`
        }
      } else if (field.type === 'email') {
        if (!value || !value.trim()) {
          errors.value[field.name] = field.errorMessage || `${field.label} is required`
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.value[field.name] = 'Please enter a valid email address'
        }
      } else if (field.type === 'url') {
        if (!value || !value.trim()) {
          errors.value[field.name] = field.errorMessage || `${field.label} is required`
        } else if (!/^https?:\/\/.+/.test(value)) {
          errors.value[field.name] = 'Please enter a valid URL'
        }
      } else if (field.type === 'tel') {
        if (!value || !value.trim()) {
          errors.value[field.name] = field.errorMessage || `${field.label} is required`
        }
      } else if (field.type === 'file') {
        if (!value) {
          errors.value[field.name] = field.errorMessage || `${field.label} is required`
        }
      } else if (field.type === 'multifile') {
        if (!Array.isArray(value) || value.length === 0) {
          errors.value[field.name] = field.errorMessage || `${field.label} is required`
        } else if (field.minFiles && value.length < field.minFiles) {
          errors.value[field.name] = `Please upload at least ${field.minFiles} file(s)`
        } else if (field.maxFiles && value.length > field.maxFiles) {
          errors.value[field.name] = `Maximum ${field.maxFiles} file(s) allowed`
        }
      } else if (field.type === 'radio') {
        if (!value) {
          errors.value[field.name] = field.errorMessage || `${field.label} is required`
        }
      } else if (field.type === 'multiselect') {
        if (!Array.isArray(value) || value.length === 0) {
          errors.value[field.name] = field.errorMessage || `${field.label} is required`
        }
      } else if (field.type === 'combobox') {
        if (!value || (typeof value === 'string' && !value.trim())) {
          errors.value[field.name] = field.errorMessage || `${field.label} is required`
        }
      } else if (field.type === 'date' || field.type === 'time' || field.type === 'datetime-local' || field.type === 'month' || field.type === 'week') {
        if (!value || (typeof value === 'string' && !value.trim())) {
          errors.value[field.name] = field.errorMessage || `${field.label} is required`
        }
      } else if (field.type === 'password') {
        if (!value || (typeof value === 'string' && !value.trim())) {
          errors.value[field.name] = field.errorMessage || `${field.label} is required`
        }
      } else {
        if (!value || (typeof value === 'string' && !value.trim())) {
          errors.value[field.name] = field.errorMessage || `${field.label} is required`
        }
      }
    }

    if (field.validate && typeof field.validate === 'function') {
      const value = field.name.includes('.')
        ? getNestedValue(formData.value, field.name)
        : formData.value[field.name]
      const customError = field.validate(value, formData.value)
      if (customError) {
        errors.value[field.name] = customError
      }
    }
  })

  if (props.customValidation) {
    const customErrors = props.customValidation(formData.value)
    if (customErrors && Object.keys(customErrors).length > 0) {
      errors.value = { ...errors.value, ...customErrors }
    }
  }

  return Object.keys(errors.value).length === 0
}

const handleSelectChange = async (field, value) => {
  if (field.name.includes('.')) {
    setNestedValue(formData.value, field.name, value)
  } else {
    formData.value[field.name] = value
  }

  if (field.onChange && typeof field.onChange === 'function') {
    try {
      await field.onChange(value, formData.value)
    } catch (error) {
      console.error('Error in onChange handler:', error)
      toast.error('An error occurred while processing the change')
    }
  }
}

const handleSliderChange = (field, value) => {
  if (field.name.includes('.')) {
    setNestedValue(formData.value, field.name, value)
  } else {
    formData.value[field.name] = value
  }

  if (field.onChange && typeof field.onChange === 'function') {
    try {
      field.onChange(value, formData.value)
    } catch (error) {
      console.error('Error in onChange handler:', error)
      toast.error('An error occurred while processing the change')
    }
  }
}

const showFieldActionButton = (field) => {
  return !!field?.actionButton && field.actionButton.show !== false
}

const fieldActionDisabled = (field) => {
  if (!field?.actionButton) return true
  const actionDisabled =
    typeof field.actionButton.disabled === 'function'
      ? field.actionButton.disabled(formData.value, field)
      : field.actionButton.disabled
  return Boolean(isLoading.value || field.disabled || actionDisabled)
}

const fieldActionLoading = (field) => {
  if (!field?.actionButton) return false
  return typeof field.actionButton.loading === 'function'
    ? field.actionButton.loading(formData.value, field)
    : Boolean(field.actionButton.loading)
}

const handleFieldActionClick = (field) => {
  if (field?.actionButton?.onClick) {
    field.actionButton.onClick(formData.value, field)
  }
}



const handleSubmit = async () => {
  try {
    // Check if any files are still uploading
    const hasUploadingFiles = props.fields.some(field =>
      field.type !== 'multifile' &&
      uploadingFilesMap.value[field.name]?.length > 0
    )

    if (hasUploadingFiles) {
      toast.error('Please wait for all files to finish uploading')
      return
    }

    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting')
      return
    }

    const preparedData = {}
    let hasFiles = false

    props.fields.forEach((field) => {
      const value = field.name.includes('.')
        ? getNestedValue(formData.value, field.name)
        : formData.value[field.name]

      if (field.type === 'number' || field.type === 'slider' || field.type === 'range') {
        if (field.name.includes('.')) {
          setNestedValue(preparedData, field.name, Number(value))
        } else {
          preparedData[field.name] = Number(value)
        }
      } else if (field.type === 'file') {
        if (value instanceof File) {
          hasFiles = true
          preparedData[field.name] = value
        } else if (props.modalType === 'edit') {
          if (value) {
            preparedData[field.name] = value
          }
        }
      } else if (field.type === 'multifile') {
        // Check if array contains File objects
        if (Array.isArray(value) && value.some(v => v instanceof File)) {
          hasFiles = true
          preparedData[field.name] = value
        } else if (props.modalType === 'edit' && Array.isArray(value) && value.length > 0) {
          preparedData[field.name] = value
        }
      } else if (field.type === 'text' || field.type === 'textarea' || field.type === 'date' ||
        field.type === 'email' || field.type === 'url' || field.type === 'tel' ||
        field.type === 'search' || field.type === 'time' || field.type === 'datetime-local' ||
        field.type === 'month' || field.type === 'week') {
        const trimmedValue = typeof value === 'string' ? value.trim() : value
        if (field.name.includes('.')) {
          setNestedValue(preparedData, field.name, trimmedValue)
        } else {
          preparedData[field.name] = trimmedValue
        }
      } else if (field.type === 'password') {
        if (field.name.includes('.')) {
          setNestedValue(preparedData, field.name, value)
        } else {
          preparedData[field.name] = value
        }
      } else {
        if (field.name.includes('.')) {
          setNestedValue(preparedData, field.name, value)
        } else {
          preparedData[field.name] = value
        }
      }
    })

    let finalData = preparedData
    if (hasFiles) {
      finalData = convertToFormData(preparedData)

      if (props.modalType === 'edit') {
        finalData.append('_method', 'PUT')
      }
    }

    emit('submit', {
      formData: finalData,
      modalType: props.modalType,
      originalData: props.initialData,
      hasFiles: hasFiles,
    })
  } catch (error) {
    console.error('Error during form submission:', error)
    toast.error('An error occurred during submission')
  }
}

// Helper function to convert object to FormData
const convertToFormData = (data) => {
  const formData = new FormData()

  Object.keys(data).forEach(key => {
    const value = data[key]

    if (value === null || value === undefined) {
      return
    }

    if (value instanceof File) {
      formData.append(key, value)
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item instanceof File) {
          formData.append(`${key}[]`, item)
        } else {
          formData.append(`${key}[${index}]`, item)
        }
      })
    } else if (typeof value === 'object' && !(value instanceof Date)) {
      Object.keys(value).forEach(nestedKey => {
        formData.append(`${key}[${nestedKey}]`, value[nestedKey])
      })
    } else {
      // Regular value
      formData.append(key, value)
    }
  })

  return formData
}

const handleClose = () => {
  formData.value = initializeFormData()
  errors.value = {}
  isInitialized.value = false
  uploadingFilesMap.value = {}
  dragOverFields.value = {}
  emit('close')
}

// Helper to get field value (handles nested fields)
const getFieldValue = (fieldName) => {
  return fieldName.includes('.')
    ? getNestedValue(formData.value, fieldName)
    : formData.value[fieldName]
}

// Helper to set field value (handles nested fields)
const setFieldValue = (fieldName, value) => {
  if (fieldName.includes('.')) {
    setNestedValue(formData.value, fieldName, value)
  } else {
    formData.value[fieldName] = value
  }
}


// File upload handlers using FileUpload component
const handleFileSelected = (field, file) => {
  setFieldValue(field.name, file)
  if (field.onChange && typeof field.onChange === 'function') {
    try {
      field.onChange(file, formData.value)
    } catch (error) {
      console.error('Error in onChange handler:', error)
    }
  }
}

const handleFileRemoved = (field, file) => {
  setFieldValue(field.name, file)
  if (field.onChange && typeof field.onChange === 'function') {
    try {
      field.onChange(file, formData.value)
    } catch (error) {
      console.error('Error in onChange handler:', error)
    }
  }
}

// Multi-file upload handlers using FileUpload component
const handleMultiFileSelected = (field, files) => {
  setFieldValue(field.name, files)
  if (field.onChange && typeof field.onChange === 'function') {
    try {
      field.onChange(files, formData.value)
    } catch (error) {
      console.error('Error in onChange handler:', error)
    }
  }
}

const handleMultiFileRemoved = (field, files) => {
  setFieldValue(field.name, files)
  if (field.onChange && typeof field.onChange === 'function') {
    try {
      field.onChange(files, formData.value)
    } catch (error) {
      console.error('Error in onChange handler:', error)
    }
  }
}
</script>

<template>
  <Modal
    v-model="isOpen"
    :show-close="true"
    :close-on-backdrop="true"
    :size="modalSize"
    :class="modalHeight === 'auto' ? '' : modalHeight"
    :resizable="modalResizable"
    @close="handleClose"
  >
    <div class="mb-6">
      <h2 class="text-xl font-semibold ui-text">
        {{ modalType === 'create' ? `Add New ${entityName}` : `Edit ${entityName}` }}
      </h2>
      <p class="text-sm ui-text mt-1">
        {{
          modalType === 'create'
            ? `Fill in the details to create a new ${entityName.toLowerCase()}.`
            : `Update the ${entityName.toLowerCase()} information below.`
        }}
      </p>
    </div>

    <form
      class="overflow-y-auto"
      @submit.prevent="handleSubmit"
    >
      <div class="grid grid-cols-12 gap-6">
        <div
          v-for="field in fields"
          :key="field.name"
          :class="field.wrapperClass || 'col-span-12'"
        >
          <!-- Hidden fields don't need FormField wrapper -->
          <template v-if="field.type === 'hidden'">
            <input
              :value="getFieldValue(field.name)"
              type="hidden"
            >
          </template>

          <FormField
            v-else
            :id="`form-${entityName}-${field.name}-${Math.random().toString(36).slice(2, 5)}`"
            :label="field.label"
            :required="field.required && !field.disabled"
            :error="errors[field.name]"
            :error-message="errors[field.name]"
          >
            <template #default="{ fieldId, hasError, ariaDescribedBy }">
              <!-- Text/Number/Password/Color/Email/Tel/URL/Search Input -->
              <Input
                v-if="['text', 'number', 'password', 'color', 'email', 'tel', 'url', 'search'].includes(field.type)"
                :id="fieldId"
                :model-value="getFieldValue(field.name)"
                :type="field.type"
                :placeholder="field.placeholder"
                :disabled="isLoading || field.disabled"
                :readonly="field.disabled"
                :class="hasError ? 'border-(--ui-danger)' : 'ui-border-strong'"
                :aria-describedby="ariaDescribedBy"
                @update:model-value="setFieldValue(field.name, $event)"
              />

              <!-- Textarea -->
              <Textarea
                v-else-if="field.type === 'textarea'"
                :id="fieldId"
                :model-value="getFieldValue(field.name)"
                :placeholder="field.placeholder"
                :disabled="isLoading || field.disabled"
                :rows="field.rows || 3"
                :class="[
                  'w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-(--ui-primary) ui-surface   border',
                  hasError ? 'border-(--ui-danger)' : 'ui-border-strong',
                ]"
                :aria-describedby="ariaDescribedBy"
                @update:model-value="setFieldValue(field.name, $event)"
              />

              <!-- Select Dropdown -->
              <div
                v-else-if="field.type === 'select'"
                class="flex items-center gap-2"
              >
                <Select
                  :id="fieldId"
                  :model-value="getFieldValue(field.name)"
                  :options="field.options"
                  :placeholder="field.placeholder || 'Select an option'"
                  :disabled="isLoading || field.disabled"
                  :has-error="hasError"
                  :aria-describedby="ariaDescribedBy"
                  class="flex-1"
                  @update:model-value="handleSelectChange(field, $event)"
                />
                <Button
                  v-if="showFieldActionButton(field)"
                  type="button"
                  :variant="field.actionButton.variant || 'outline'"
                  :size="field.actionButton.size || 'icon'"
                  :class="field.actionButton.class || ''"
                  :title="field.actionButton.title || field.actionButton.label || 'Action'"
                  :disabled="fieldActionDisabled(field)"
                  :loading="fieldActionLoading(field)"
                  @click="handleFieldActionClick(field)"
                >
                  {{ field.actionButton.label || '+' }}
                </Button>
              </div>

              <!-- MultiSelect Dropdown -->
              <div
                v-else-if="field.type === 'multiselect'"
                class="flex items-center gap-2"
              >
                <MultiSelect
                  :id="fieldId"
                  :model-value="getFieldValue(field.name)"
                  :options="field.options"
                  :disabled="isLoading || field.disabled"
                  :placeholder="field.placeholder || 'Select options'"
                  :has-error="hasError"
                  :aria-describedby="ariaDescribedBy"
                  class="flex-1"
                  @update:model-value="setFieldValue(field.name, $event)"
                />
                <Button
                  v-if="showFieldActionButton(field)"
                  type="button"
                  :variant="field.actionButton.variant || 'outline'"
                  :size="field.actionButton.size || 'icon'"
                  :class="field.actionButton.class || ''"
                  :title="field.actionButton.title || field.actionButton.label || 'Action'"
                  :disabled="fieldActionDisabled(field)"
                  :loading="fieldActionLoading(field)"
                  @click="handleFieldActionClick(field)"
                >
                  {{ field.actionButton.label || '+' }}
                </Button>
              </div>

              <!-- Combobox -->
              <div
                v-else-if="field.type === 'combobox'"
                class="flex items-center gap-2"
              >
                <Select
                  :id="fieldId"
                  :model-value="getFieldValue(field.name)"
                  :options="field.options"
                  :placeholder="field.placeholder || 'Select or type to add new'"
                  :disabled="isLoading || field.disabled"
                  :has-error="hasError"
                  :aria-describedby="ariaDescribedBy"
                  :allow-create="field.allowCreate"
                  class="flex-1"
                  @update:model-value="handleSelectChange(field, $event)"
                />
                <Button
                  v-if="showFieldActionButton(field)"
                  type="button"
                  :variant="field.actionButton.variant || 'outline'"
                  :size="field.actionButton.size || 'icon'"
                  :class="field.actionButton.class || ''"
                  :title="field.actionButton.title || field.actionButton.label || 'Action'"
                  :disabled="fieldActionDisabled(field)"
                  :loading="fieldActionLoading(field)"
                  @click="handleFieldActionClick(field)"
                >
                  {{ field.actionButton.label || '+' }}
                </Button>
              </div>

              <!-- Checkbox -->
              <div
                v-else-if="field.type === 'checkbox'"
                class="flex items-center"
              >
                <Input
                  :id="fieldId"
                  :model-value="getFieldValue(field.name)"
                  type="checkbox"
                  :disabled="isLoading || field.disabled"
                  class="h-4 w-4 ui-primary focus:ring-(--ui-primary) ui-border-strong rounded"
                  :aria-describedby="ariaDescribedBy"
                  @update:model-value="setFieldValue(field.name, $event)"
                />
                <Label
                  :for="fieldId"
                  class="ml-2 text-sm ui-text"
                >
                  {{ field.checkboxLabel || field.label }}
                </Label>
              </div>

              <!-- Switch (styled checkbox) -->
              <div
                v-else-if="field.type === 'switch'"
                class="flex items-center"
              >
                <button
                  :id="fieldId"
                  type="button"
                  role="switch"
                  :aria-checked="getFieldValue(field.name)"
                  :disabled="isLoading || field.disabled"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-(--ui-primary) focus:ring-offset-2',
                    getFieldValue(field.name) ? 'ui-primary-bg' : 'ui-bg',
                    (isLoading || field.disabled) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  ]"
                  @click="setFieldValue(field.name, !getFieldValue(field.name))"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full ui-surface transition-transform',
                      getFieldValue(field.name) ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  />
                </button>
                <Label
                  :for="fieldId"
                  class="ml-3 text-sm ui-text"
                >
                  {{ field.checkboxLabel || field.label }}
                </Label>
              </div>

              <!-- Radio Buttons -->
              <div
                v-else-if="field.type === 'radio'"
                class="space-y-2"
              >
                <div
                  v-for="option in field.options"
                  :key="option.value"
                  class="flex items-center"
                >
                  <Input
                    :id="`${fieldId}-${option.value}`"
                    :model-value="getFieldValue(field.name)"
                    type="radio"
                    :value="option.value"
                    :disabled="isLoading || field.disabled"
                    class="h-4 w-4 ui-primary focus:ring-(--ui-primary) ui-border-strong"
                    :aria-describedby="ariaDescribedBy"
                    @update:model-value="setFieldValue(field.name, $event)"
                  />
                  <Label
                    :for="`${fieldId}-${option.value}`"
                    class="ml-2 text-sm ui-text"
                  >
                    {{ option.label }}
                  </Label>
                </div>
              </div>

              <!-- Single File Input -->
              <div
                v-else-if="field.type === 'file'"
                class="w-full"
              >
                <FileUpload
                  :multiple="false"
                  :accept="field.accept"
                  :max-size="field.maxSize"
                  :variant="field.variant || 'default'"
                  @files-selected="handleFileSelected(field, $event)"
                  @file-removed="handleFileRemoved(field, $event)"
                />
                <!-- Help text -->
                <p
                  v-if="field.helpText"
                  class="mt-2 text-xs ui-text"
                >
                  {{ field.helpText }}
                </p>
              </div>

              <!-- Multi-File Upload -->
              <div
                v-else-if="field.type === 'multifile'"
                class="w-full"
              >
                <FileUpload
                  :multiple="field.multiple !== false"
                  :accept="field.accept"
                  :max-size="field.maxSize"
                  :max-files="field.maxFiles"
                  :variant="field.variant || 'default'"
                  @files-selected="handleMultiFileSelected(field, $event)"
                  @file-removed="handleMultiFileRemoved(field, $event)"
                />
                <!-- Help text -->
                <p
                  v-if="field.helpText"
                  class="mt-2 text-xs ui-text"
                >
                  {{ field.helpText }}
                </p>
              </div>

              <!-- Slider -->
              <Slider
                v-else-if="field.type === 'slider'"
                :model-value="getFieldValue(field.name)"
                :min="field.min"
                :max="field.max"
                :step="field.step"
                :disabled="isLoading || field.disabled"
                @update:model-value="handleSliderChange(field, $event)"
              />

              <!-- Range (HTML5 native range input) -->
              <div
                v-else-if="field.type === 'range'"
                class="space-y-2"
              >
                <div class="flex items-center gap-4">
                  <Input
                    :id="fieldId"
                    :model-value="getFieldValue(field.name)"
                    type="range"
                    :min="field.min"
                    :max="field.max"
                    :step="field.step || 1"
                    :disabled="isLoading || field.disabled"
                    class="flex-1"
                    :aria-describedby="ariaDescribedBy"
                    @update:model-value="setFieldValue(field.name, $event)"
                  />
                  <span class="text-sm font-medium ui-text min-w-12 text-right">
                    {{ getFieldValue(field.name) }}
                  </span>
                </div>
              </div>

              <!-- Date Picker -->
              <DatePicker
                v-else-if="field.type === 'date'"
                :id="fieldId"
                :model-value="getFieldValue(field.name)"
                :disabled="isLoading || field.disabled"
                :required="field.required"
                :min="field.min"
                :max="field.max"
                :placeholder="field.placeholder || 'Select date'"
                :format="field.format || 'MM/DD/YYYY'"
                :clearable="field.clearable !== false"
                :show-today="field.showToday !== false"
                :calendar-position="field.calendarPosition || 'left-0 bottom-full'"
                :aria-describedby="ariaDescribedBy"
                @update:model-value="setFieldValue(field.name, $event)"
              />

              <!-- Time Input -->
              <Input
                v-else-if="field.type === 'time'"
                :id="fieldId"
                :model-value="getFieldValue(field.name)"
                type="time"
                :disabled="isLoading || field.disabled"
                :class="hasError ? 'border-(--ui-danger)' : 'ui-border-strong'"
                :aria-describedby="ariaDescribedBy"
                @update:model-value="setFieldValue(field.name, $event)"
              />

              <!-- DateTime Local Input -->
              <Input
                v-else-if="field.type === 'datetime-local'"
                :id="fieldId"
                :model-value="getFieldValue(field.name)"
                type="datetime-local"
                :disabled="isLoading || field.disabled"
                :class="hasError ? 'border-(--ui-danger)' : 'ui-border-strong'"
                :aria-describedby="ariaDescribedBy"
                @update:model-value="setFieldValue(field.name, $event)"
              />

              <!-- Month Input -->
              <Input
                v-else-if="field.type === 'month'"
                :id="fieldId"
                :model-value="getFieldValue(field.name)"
                type="month"
                :disabled="isLoading || field.disabled"
                :class="hasError ? 'border-(--ui-danger)' : 'ui-border-strong'"
                :aria-describedby="ariaDescribedBy"
                @update:model-value="setFieldValue(field.name, $event)"
              />

              <!-- Week Input -->
              <Input
                v-else-if="field.type === 'week'"
                :id="fieldId"
                :model-value="getFieldValue(field.name)"
                type="week"
                :disabled="isLoading || field.disabled"
                :class="hasError ? 'border-(--ui-danger)' : 'ui-border-strong'"
                :aria-describedby="ariaDescribedBy"
                @update:model-value="setFieldValue(field.name, $event)"
              />
            </template>
          </FormField>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-6">
        <Button
          type="button"
          variant="outline"
          :disabled="isLoading"
          @click="handleClose"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          :disabled="isLoading"
          :loading="isLoading"
          variant="info"
        >
          {{ modalType === 'create' ? `Create ${entityName}` : `Update ${entityName}` }}
        </Button>
      </div>
    </form>
  </Modal>
</template>
