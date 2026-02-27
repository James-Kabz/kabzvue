<script setup>
import Slider from './Slider.vue'
import DatePicker from './DatePicker.vue'
import { ref, watch, computed, reactive } from 'vue'
import FormField from './FormField.vue'
import Input from './Input.vue'
import Textarea from './Textarea.vue'
import Select from './Select.vue'
import MultiSelect from './MultiSelect.vue'
import Button from './Button.vue'
import { toast } from '../lib/toast'
import Label from './Label.vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Form',
  },
  description: {
    type: String,
    default: '',
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
            'multifile',
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
  submitLabel: {
    type: String,
    default: 'Submit',
  },
  showReset: {
    type: Boolean,
    default: true,
  },
  showCancel: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['submit', 'reset', 'cancel'])

const isLoading = computed(() => props.loading)

const formData = ref({})
const errors = ref({})
const isInitialized = ref(false)

// Multi-file upload state
const uploadingFilesMap = ref({}) // { fieldName: [{ file, progress, id }] }
const dragOverFields = ref({}) // { fieldName: boolean }

const fileInputRefs = ref({})

const triggerFileInput = (fieldName) => {
  const input = fileInputRefs.value[fieldName]
  if (input) {
    input.click()
  }
}

const setFileInputRef = (fieldName, el) => {
  if (el) {
    fileInputRefs.value[fieldName] = el
  }
}

// Initialize form data based on fields
const initializeFormData = () => {
  const data = {}
  props.fields.forEach((field) => {
    if (field.type === 'checkbox' || field.type === 'switch') {
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
    } else {
      data[field.name] = ''
    }
  })
  return data
}

// Watch for initialData changes to populate form
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      const data = {}
      props.fields.forEach((field) => {
        if (field.type === 'checkbox' || field.type === 'switch') {
          data[field.name] = newData[field.name] ?? false
        } else if (field.type === 'number' || field.type === 'slider' || field.type === 'range') {
          data[field.name] = newData[field.name] ?? (field.min !== undefined ? field.min : 0)
        } else if (field.type === 'file') {
          data[field.name] = null
        } else if (field.type === 'multifile') {
          data[field.name] = Array.isArray(newData[field.name]) ? newData[field.name] : []
        } else if (field.type === 'multiselect') {
          data[field.name] = Array.isArray(newData[field.name]) ? newData[field.name] : []
        } else {
          data[field.name] = newData[field.name] ?? ''
        }
      })
      formData.value = data
      isInitialized.value = true
    } else {
      formData.value = initializeFormData()
      isInitialized.value = false
    }
  },
  { immediate: true, deep: true },
)

// Watch for initialData changes after initialization
watch(
  () => props.initialData,
  (newData) => {
    if (isInitialized.value && newData) {
      Object.keys(newData).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(formData.value, key) && newData[key] !== undefined && newData[key] !== null) {
          formData.value[key] = newData[key]
        }
      })
    }
  },
  { deep: true },
)

const validateForm = () => {
  errors.value = {}

  props.fields.forEach((field) => {
    if (field.required && !field.disabled && field.type !== 'hidden') {
      const value = formData.value[field.name]

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
      const customError = field.validate(formData.value[field.name], formData.value)
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
  formData.value[field.name] = value

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
  formData.value[field.name] = value

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

const handleFileChange = (field, event) => {
  const file = event.target.files?.[0] || null
  formData.value[field.name] = file

  if (field.onChange && typeof field.onChange === 'function') {
    try {
      field.onChange(file, formData.value)
    } catch (error) {
      console.error('Error in onChange handler:', error)
      toast.error('An error occurred while processing the file')
    }
  }
}

// Multi-file upload handlers
const handleMultiFileDrop = (field, event) => {
  event.preventDefault()
  dragOverFields.value[field.name] = false
  const droppedFiles = Array.from(event.dataTransfer?.files || [])
  addMultipleFiles(field, droppedFiles)
}

const handleMultiFileDragOver = (event) => {
  event.preventDefault()
}

const handleMultiFileDragEnter = (field, event) => {
  event.preventDefault()
  dragOverFields.value[field.name] = true
}

const handleMultiFileDragLeave = (field, event) => {
  event.preventDefault()
  dragOverFields.value[field.name] = false
}

const handleMultiFileSelect = (field, event) => {
  const selectedFiles = Array.from(event.target?.files || [])
  addMultipleFiles(field, selectedFiles)
  // Reset input so same file can be selected again
  event.target.value = ''
}

const addMultipleFiles = (field, newFiles) => {
  const currentFiles = formData.value[field.name] || []
  const maxFiles = field.maxFiles || Infinity
  const maxSize = field.maxSize || Infinity

  // Filter valid files
  const validFiles = newFiles.filter(file => {
    if (file.size > maxSize) {
      toast.error(`${file.name} exceeds maximum size of ${formatFileSize(maxSize)}`)
      return false
    }
    if (field.accept) {
      const acceptedTypes = field.accept.split(',').map(t => t.trim().toLowerCase())
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()
      const fileMime = file.type.toLowerCase()
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) return fileExt === type
        if (type.endsWith('/*')) return fileMime.startsWith(type.replace('/*', '/'))
        return fileMime === type
      })
      if (!isAccepted) {
        toast.error(`${file.name} is not an accepted file type`)
        return false
      }
    }
    return true
  })

  // Check max files limit
  const remainingSlots = maxFiles - currentFiles.length
  if (remainingSlots <= 0) {
    toast.error(`Maximum ${maxFiles} file(s) allowed`)
    return
  }
  const filesToAdd = validFiles.slice(0, remainingSlots)
  if (filesToAdd.length < validFiles.length) {
    toast.warning(`Only ${filesToAdd.length} file(s) added. Maximum ${maxFiles} file(s) allowed`)
  }

  // Initialize uploading map for this field if not exists
  if (!uploadingFilesMap.value[field.name]) {
    uploadingFilesMap.value[field.name] = []
  }

  // Add files with progress tracking
  filesToAdd.forEach(file => {
    const fileItem = reactive({
      file,
      progress: 0,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    })
    uploadingFilesMap.value[field.name].push(fileItem)

    // Simulate upload progress
    const duration = 1500 + Math.random() * 1500
    const intervalTime = 50
    const totalSteps = duration / intervalTime
    const increment = 100 / totalSteps

    const interval = setInterval(() => {
      fileItem.progress += increment
      if (fileItem.progress >= 100) {
        fileItem.progress = 100
        clearInterval(interval)

        // Move to completed files
        formData.value[field.name] = [...(formData.value[field.name] || []), file]

        // Remove from uploading
        const idx = uploadingFilesMap.value[field.name]?.findIndex(f => f.id === fileItem.id)
        if (idx > -1) {
          uploadingFilesMap.value[field.name].splice(idx, 1)
        }

        // Trigger onChange callback
        if (field.onChange && typeof field.onChange === 'function') {
          try {
            field.onChange(formData.value[field.name], formData.value)
          } catch (error) {
            console.error('Error in onChange handler:', error)
          }
        }
      }
    }, intervalTime)
  })
}

const removeMultiFile = (field, index) => {
  const files = [...(formData.value[field.name] || [])]
  files.splice(index, 1)
  formData.value[field.name] = files

  if (field.onFileRemoved && typeof field.onFileRemoved === 'function') {
    try {
      field.onFileRemoved(files, formData.value)
    } catch (error) {
      console.error('Error in onFileRemoved handler:', error)
    }
  }
}

const cancelUpload = (field, fileId) => {
  const idx = uploadingFilesMap.value[field.name]?.findIndex(f => f.id === fileId)
  if (idx > -1) {
    uploadingFilesMap.value[field.name].splice(idx, 1)
  }
}

// Utility functions
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (file) => {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image'
  if (['pdf'].includes(ext)) return 'file-text'
  if (['doc', 'docx'].includes(ext)) return 'file-text'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'table'
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive'
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'video'
  if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) return 'music'
  return 'file'
}

const getFileIconColor = (file) => {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'ui-accent ui-accent-soft'
  if (['pdf'].includes(ext)) return 'ui-danger ui-danger-soft'
  if (['doc', 'docx'].includes(ext)) return 'ui-primary ui-primary-soft'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'ui-success ui-success-soft'
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'ui-warning ui-warning-soft'
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'ui-danger ui-danger-soft'
  if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) return 'ui-warning ui-warning-soft'
  return 'ui-text ui-surface-muted'
}

const handleSubmit = async () => {
  try {
    // Check if any files are still uploading
    const hasUploadingFiles = Object.values(uploadingFilesMap.value).some(arr => arr.length > 0)
    if (hasUploadingFiles) {
      toast.error('Please wait for all files to finish uploading')
      return
    }

    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting')
      return
    }

    const preparedData = {}
    props.fields.forEach((field) => {
      const value = formData.value[field.name]

      if (field.type === 'number' || field.type === 'slider' || field.type === 'range') {
        preparedData[field.name] = Number(value)
      } else if (field.type === 'text' || field.type === 'textarea' || field.type === 'date' ||
        field.type === 'email' || field.type === 'url' || field.type === 'tel' ||
        field.type === 'search' || field.type === 'time' || field.type === 'datetime-local' ||
        field.type === 'month' || field.type === 'week') {
        preparedData[field.name] = typeof value === 'string' ? value.trim() : value
      } else if (field.type === 'password') {
        preparedData[field.name] = value
      } else if (field.type === 'file' || field.type === 'multifile') {
        preparedData[field.name] = value
      } else {
        preparedData[field.name] = value
      }
    })

    emit('submit', {
      formData: preparedData,
      originalData: props.initialData,
    })
  } catch (error) {
    console.error('Error during form submission:', error)
    toast.error('An error occurred during submission')
  }
}

const handleReset = () => {
  formData.value = initializeFormData()
  errors.value = {}
  uploadingFilesMap.value = {}
  isInitialized.value = false
  emit('reset')
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <div class="w-full p-2">
    <div
      v-if="title"
      class="mb-6"
    >
      <h2 class="text-xl font-semibold ui-text">
        {{ title }}
      </h2>
      <p
        v-if="description"
        class="text-sm ui-text mt-1"
      >
        {{ description }}
      </p>
    </div>

    <form
      class="space-y-6"
      @submit.prevent="handleSubmit"
    >
      <div
        v-for="field in fields"
        :key="field.name"
      >
        <!-- Hidden fields don't need FormField wrapper -->
        <template v-if="field.type === 'hidden'">
          <input
            v-model="formData[field.name]"
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
              v-model="formData[field.name]"
              :type="field.type"
              :placeholder="field.placeholder"
              :disabled="isLoading || field.disabled"
              :readonly="field.disabled"
              :class="hasError ? 'border-(--ui-danger)' : 'ui-border-strong '"
              :aria-describedby="ariaDescribedBy"
            />

            <!-- Textarea -->
            <Textarea
              v-else-if="field.type === 'textarea'"
              :id="fieldId"
              v-model="formData[field.name]"
              :placeholder="field.placeholder"
              :disabled="isLoading || field.disabled"
              :rows="field.rows || 3"
              :class="[
                'w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-(--ui-primary) ui-surface    border',
                hasError ? 'border-(--ui-danger)' : 'ui-border-strong ',
              ]"
              :aria-describedby="ariaDescribedBy"
            />

            <!-- Select Dropdown -->
            <div
              v-else-if="field.type === 'select'"
              class="flex w-full items-center gap-2"
            >
              <div class="flex-1 min-w-0">
                <Select
                  :id="fieldId"
                  :model-value="formData[field.name]"
                  :options="field.options"
                  :placeholder="field.placeholder || 'Select an option'"
                  :disabled="isLoading || field.disabled"
                  :has-error="hasError"
                  :aria-describedby="ariaDescribedBy"
                  @update:model-value="handleSelectChange(field, $event)"
                />
              </div>
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
              class="flex w-full items-center gap-2"
            >
              <div class="flex-1 min-w-0">
                <MultiSelect
                  :id="fieldId"
                  :model-value="formData[field.name]"
                  :options="field.options"
                  :disabled="isLoading || field.disabled"
                  :placeholder="field.placeholder || 'Select options'"
                  :has-error="hasError"
                  :aria-describedby="ariaDescribedBy"
                  @update:model-value="formData[field.name] = $event"
                />
              </div>
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
              class="flex w-full items-center gap-2"
            >
              <div class="flex-1 min-w-0">
                <Select
                  :id="fieldId"
                  :model-value="formData[field.name]"
                  :options="field.options"
                  :placeholder="field.placeholder || 'Select or type to add new'"
                  :disabled="isLoading || field.disabled"
                  :has-error="hasError"
                  :aria-describedby="ariaDescribedBy"
                  :allow-create="field.allowCreate"
                  @update:model-value="handleSelectChange(field, $event)"
                />
              </div>
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
                v-model="formData[field.name]"
                type="checkbox"
                :disabled="isLoading || field.disabled"
                class="h-4 w-4 ui-primary focus:ring-(--ui-primary) ui-border-strong  rounded"
                :aria-describedby="ariaDescribedBy"
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
                :aria-checked="formData[field.name]"
                :disabled="isLoading || field.disabled"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-(--ui-primary) focus:ring-offset-2',
                  formData[field.name] ? 'ui-primary-bg' : 'ui-bg',
                  (isLoading || field.disabled) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                ]"
                @click="formData[field.name] = !formData[field.name]"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full ui-surface  transition-transform',
                    formData[field.name] ? 'translate-x-6' : 'translate-x-1'
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
                  v-model="formData[field.name]"
                  type="radio"
                  :value="option.value"
                  :disabled="isLoading || field.disabled"
                  class="h-4 w-4 ui-primary focus:ring-(--ui-primary) ui-border-strong "
                  :aria-describedby="ariaDescribedBy"
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
              class="space-y-2"
            >
              <Input
                :id="fieldId"
                type="file"
                :accept="field.accept"
                :disabled="isLoading || field.disabled"
                :class="[
                  'w-full text-sm ui-text file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-(--ui-primary-soft) file:text-(--ui-primary) hover:file:bg-(--ui-primary-soft)',
                  hasError ? 'border-(--ui-danger)' : 'ui-border-strong '
                ]"
                :aria-describedby="ariaDescribedBy"
                @change="handleFileChange(field, $event)"
              />
              <p
                v-if="field.helpText"
                class="text-xs ui-text"
              >
                {{ field.helpText }}
              </p>
            </div>

            <!-- Multi-file Upload -->
            <div
              v-else-if="field.type === 'multifile'"
              class="space-y-3"
            >
              <!-- Dropzone -->
              <div
                :class="[
                  'border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200',
                  dragOverFields[field.name]
                    ? 'border-(--ui-primary) ui-primary-soft ring-2 ring-(--ui-primary)'
                    : hasError
                      ? 'border-(--ui-danger-soft) hover:border-(--ui-danger-soft) bg-[color:color-mix(in oklab, var(--ui-danger-soft), transparent 50%)]'
                      : 'ui-border  hover:border-(--ui-border-strong) hover:bg-(--ui-surface)',
                  (isLoading || field.disabled) ? 'opacity-50 cursor-not-allowed' : ''
                ]"
                @drop="handleMultiFileDrop(field, $event)"
                @dragover="handleMultiFileDragOver"
                @dragenter="handleMultiFileDragEnter(field, $event)"
                @dragleave="handleMultiFileDragLeave(field, $event)"
                @click="triggerFileInput(field.name)"
              >
                <!-- Use :ref with function to properly set refs in Vue 3 -->
                <input
                  :ref="(el) => setFileInputRef(field.name, el)"
                  type="file"
                  :multiple="field.multiple !== false"
                  :accept="field.accept"
                  class="hidden"
                  :disabled="isLoading || field.disabled"
                  @change="handleMultiFileSelect(field, $event)"
                >
                <div class="flex items-center justify-center px-4 py-4">
                  <div class="ui-surface-muted rounded-full p-2.5 mr-3">
                    <svg
                      class="h-6 w-6 ui-text"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                  </div>
                  <div class="flex flex-col">
                    <p class="text-sm font-medium ui-text">
                      <span class="ui-primary font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p class="text-xs ui-text">
                      {{ field.maxSize ? `Up to ${formatFileSize(field.maxSize)}` : 'No size limit' }}
                      <span
                        v-if="field.accept"
                        class="ml-1"
                      >• {{ field.accept }}</span>
                      <span
                        v-if="field.maxFiles"
                        class="ml-1"
                      >• Max {{ field.maxFiles }} files</span>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Help text -->
              <p
                v-if="field.helpText"
                class="text-xs ui-text"
              >
                {{ field.helpText }}
              </p>

              <!-- Uploading Files -->
              <div
                v-if="uploadingFilesMap[field.name]?.length > 0"
                class="space-y-2"
              >
                <div
                  v-for="fileItem in uploadingFilesMap[field.name]"
                  :key="fileItem.id"
                  class="flex items-center justify-between p-3 ui-surface  border ui-border-strong  rounded-lg"
                >
                  <div class="flex items-center space-x-3 flex-1 min-w-0">
                    <div class="relative h-10 w-10 shrink-0">
                      <svg
                        class="h-10 w-10 ui-text"
                        viewBox="0 0 36 36"
                      >
                        <circle
                          cx="18"
                          cy="18"
                          r="16"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="3"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="16"
                          fill="none"
                          stroke="#3B82F6"
                          stroke-width="3"
                          stroke-linecap="round"
                          :stroke-dasharray="`${fileItem.progress} 100`"
                          transform="rotate(-90 18 18)"
                        />
                      </svg>
                      <span class="absolute inset-0 flex items-center justify-center text-xs font-medium ui-text">
                        {{ Math.round(fileItem.progress) }}%
                      </span>
                    </div>
                    <div class="flex flex-col min-w-0">
                      <span class="text-sm font-medium ui-text truncate">{{ fileItem.file.name }}</span>
                      <span class="text-xs ui-text">Uploading...</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="ui-text hover:text-(--ui-danger) hover:bg-(--ui-danger-soft) rounded-full p-1 transition-colors ml-2"
                    @click.stop="cancelUpload(field, fileItem.id)"
                  >
                    <svg
                      class="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Uploaded Files -->
              <div
                v-if="formData[field.name]?.length > 0"
                class="space-y-2"
              >
                <div
                  v-for="(file, index) in formData[field.name]"
                  :key="`uploaded-${index}`"
                  class="flex items-center justify-between p-3 ui-surface  border ui-border-strong  rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div class="flex items-center space-x-3 flex-1 min-w-0">
                    <div
                      :class="[
                        'rounded-lg p-2 shrink-0',
                        getFileIconColor(file)
                      ]"
                    >
                      <svg
                        class="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                      >
                        <path
                          v-if="getFileIcon(file) === 'image'"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                        />
                        <path
                          v-else
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                    </div>
                    <div class="flex flex-col min-w-0">
                      <span class="text-sm font-medium ui-text truncate">{{ file.name }}</span>
                      <span class="text-xs ui-text">{{ formatFileSize(file.size) }}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="ui-text hover:text-(--ui-danger) hover:bg-(--ui-danger-soft) rounded-full p-1.5 transition-colors ml-2"
                    :disabled="isLoading || field.disabled"
                    @click.stop="removeMultiFile(field, index)"
                  >
                    <svg
                      class="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- File count summary -->
              <p
                v-if="formData[field.name]?.length > 0"
                class="text-xs ui-primary font-medium"
              >
                {{ formData[field.name].length }} file(s) uploaded
                <span v-if="field.maxFiles"> of {{ field.maxFiles }} max</span>
              </p>
            </div>

            <!-- Slider -->
            <Slider
              v-else-if="field.type === 'slider'"
              :model-value="formData[field.name]"
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
                  v-model="formData[field.name]"
                  type="range"
                  :min="field.min"
                  :max="field.max"
                  :step="field.step || 1"
                  :disabled="isLoading || field.disabled"
                  class="flex-1"
                  :aria-describedby="ariaDescribedBy"
                />
                <span class="text-sm font-medium ui-text min-w-12 text-right">
                  {{ formData[field.name] }}
                </span>
              </div>
            </div>

            <!-- Date Picker -->
            <DatePicker
              v-else-if="field.type === 'date'"
              :id="fieldId"
              v-model="formData[field.name]"
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
            />

            <!-- Time Input -->
            <Input
              v-else-if="field.type === 'time'"
              :id="fieldId"
              v-model="formData[field.name]"
              type="time"
              :disabled="isLoading || field.disabled"
              :class="hasError ? 'border-(--ui-danger)' : 'ui-border-strong '"
              :aria-describedby="ariaDescribedBy"
            />

            <!-- DateTime Local Input -->
            <Input
              v-else-if="field.type === 'datetime-local'"
              :id="fieldId"
              v-model="formData[field.name]"
              type="datetime-local"
              :disabled="isLoading || field.disabled"
              :class="hasError ? 'border-(--ui-danger)' : 'ui-border-strong '"
              :aria-describedby="ariaDescribedBy"
            />

            <!-- Month Input -->
            <Input
              v-else-if="field.type === 'month'"
              :id="fieldId"
              v-model="formData[field.name]"
              type="month"
              :disabled="isLoading || field.disabled"
              :class="hasError ? 'border-(--ui-danger)' : 'ui-border-strong '"
              :aria-describedby="ariaDescribedBy"
            />

            <!-- Week Input -->
            <Input
              v-else-if="field.type === 'week'"
              :id="fieldId"
              v-model="formData[field.name]"
              type="week"
              :disabled="isLoading || field.disabled"
              :class="hasError ? 'border-(--ui-danger)' : 'ui-border-strong '"
              :aria-describedby="ariaDescribedBy"
            />
          </template>
        </FormField>
      </div>

      <div class="flex justify-end gap-3 pt-6">
        <Button
          v-if="showReset"
          type="button"
          variant="outline"
          :disabled="isLoading"
          @click="handleReset"
        >
          Reset
        </Button>
        <Button
          v-if="showCancel"
          type="button"
          variant="outline"
          :disabled="isLoading"
          @click="handleCancel"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          :disabled="isLoading"
          :loading="isLoading"
          variant="default"
        >
          {{ submitLabel }}
        </Button>
      </div>
    </form>
  </div>
</template>
