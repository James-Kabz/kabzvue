<script setup>
import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'

const props = defineProps({
  value: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'success', 'warning', 'danger'].includes(value)
  },
  showLabel: Boolean,
  class: String
})

const clampedValue = computed(() => {
  const safeMax = props.max > 0 ? props.max : 100
  const percentage = (props.value / safeMax) * 100
  return Math.min(Math.max(percentage, 0), 100)
})

const containerVariants = cva(
  'relative w-full overflow-hidden rounded-full ui-surface-muted border ui-border-strong',
  {
    variants: {
      size: {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4'
      }
    }
  }
)

const progressVariants = cva(
  'h-full w-full flex-1 transition-[width,background-color] duration-300 ease-in-out'
)

const containerClasses = computed(() =>
  cn(containerVariants({ size: props.size }), props.class)
)

const progressClasses = computed(() =>
  progressVariants()
)

const labelClasses = computed(() =>
  'absolute inset-0 flex items-center justify-center text-xs font-medium ui-text'
)

const variantColorTokens = {
  default: {
    soft: '--ui-primary-soft',
    strong: '--ui-primary-strong'
  },
  success: {
    soft: '--ui-success-soft',
    strong: '--ui-success-strong'
  },
  warning: {
    soft: '--ui-warning-soft',
    strong: '--ui-warning-strong'
  },
  danger: {
    soft: '--ui-danger-soft',
    strong: '--ui-danger-strong'
  }
}

const getScaledVariantColor = (variant, percentage) => {
  const tokens = variantColorTokens[variant] || variantColorTokens.default
  const strongWeight = Math.round(20 + (percentage / 100) * 80)
  const softWeight = 100 - strongWeight

  return `color-mix(in oklab, var(${tokens.strong}) ${strongWeight}%, var(${tokens.soft}) ${softWeight}%)`
}

const getDefaultAdaptiveColor = (percentage) => {
  if (percentage <= 50) {
    const warningWeight = Math.round((percentage / 50) * 100)
    const dangerWeight = 100 - warningWeight
    return `color-mix(in oklab, var(--ui-warning-strong) ${warningWeight}%, var(--ui-danger-strong) ${dangerWeight}%)`
  }

  const successWeight = Math.round(((percentage - 50) / 50) * 100)
  const warningWeight = 100 - successWeight
  return `color-mix(in oklab, var(--ui-success-strong) ${successWeight}%, var(--ui-warning-strong) ${warningWeight}%)`
}

const progressColor = computed(() => {
  if (props.variant === 'default') {
    return getDefaultAdaptiveColor(clampedValue.value)
  }

  return getScaledVariantColor(props.variant, clampedValue.value)
})

const progressStyle = computed(() => ({
  width: `${clampedValue.value}%`,
  backgroundColor: progressColor.value
}))
</script>

<template>
  <div :class="containerClasses">
    <div :class="progressClasses" :style="progressStyle" role="progressbar" :aria-valuenow="clampedValue"
      :aria-valuemin="0" :aria-valuemax="100" />
    <span v-if="showLabel" :class="labelClasses">
      {{ clampedValue }}%
    </span>
  </div>
</template>

