<template>
  <span :class="cn(badgeVariants({ variant, size, shape }), $attrs.class)">
    <!-- Icon -->
    <component
      :is="icon"
      v-if="icon"
      :class="iconClasses"
    />

    <!-- Default slot -->
    <slot />

    <!-- Dismiss button -->
    <button
      v-if="dismissible"
      class="ml-1 hover:bg-[color:color-mix(in oklab, var(--ui-bg), transparent 90%)] rounded-full p-0.5 transition-colors"
      :aria-label="dismissLabel"
      @click="handleDismiss"
    >
      <Icon
        icon="circle-xmark"
        class="w-3 h-3"
      />
    </button>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/cn.js'
import Icon from './Icon.vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) =>
      ['default', 'secondary', 'danger', 'primary', 'outline', 'success', 'warning', 'info', 'ghost', 'link', 'subtle', 'dark', 'light', 'primaryOutline', 'dangerOutline', 'successOutline', 'gradient'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  shape: {
    type: String,
    default: 'rounded',
    validator: (value) => ['rounded', 'pill', 'square'].includes(value)
  },
  icon: {
    type: [String, Object],
    default: null
  },
  dismissible: {
    type: Boolean,
    default: false
  },
  dismissLabel: {
    type: String,
    default: 'Dismiss'
  }
})

const emit = defineEmits(['dismiss'])
const handleDismiss = () => emit('dismiss')

// cva-powered class variants
const badgeVariants = cva(
  'inline-flex items-center font-medium border transition-all duration-200',
  {
    variants: {
      variant: {
        default:
          'border border-[var(--ui-primary-soft)] ui-primary-soft ui-primary hover:bg-[var(--ui-primary-soft)] dark:border-[var(--ui-primary-soft)] dark:bg-[var(--ui-primary-soft)] dark:text-[var(--ui-primary)]',
        secondary:
          'border ui-border-strong ui-surface-muted ui-text hover:bg-[var(--ui-surface)] dark:border-[var(--ui-border-strong)] dark:bg-[var(--ui-surface)] dark:text-[var(--ui-text)]',
        danger:
          'border border-[var(--ui-danger-soft)] ui-danger-soft ui-danger hover:bg-[var(--ui-danger-soft)] dark:border-[var(--ui-danger-soft)] dark:bg-[var(--ui-danger-soft)] dark:text-[var(--ui-danger)]',
        primary:
          'border border-[var(--ui-primary-soft)] ui-primary-soft ui-primary hover:bg-[var(--ui-primary-soft)] dark:border-[var(--ui-primary-soft)] dark:bg-[var(--ui-primary-soft)] dark:text-[var(--ui-primary)]',
        outline: 'ui-text border',
        success:
          'border border-[var(--ui-success-soft)] ui-success-soft ui-success dark:border-[var(--ui-success-soft)] dark:bg-[var(--ui-success-soft)] dark:text-[var(--ui-success)]',
        warning:
          'border border-[var(--ui-warning-soft)] ui-warning-soft ui-warning hover:bg-[var(--ui-warning-soft)] dark:border-[var(--ui-warning-soft)] dark:bg-[var(--ui-warning-soft)] dark:text-[var(--ui-warning)]',
        info:
          'border border-[var(--ui-primary-soft)] ui-primary-soft ui-primary hover:bg-[var(--ui-primary-soft)] dark:border-[var(--ui-primary-soft)] dark:bg-[var(--ui-primary-soft)] dark:text-[var(--ui-primary)]',
        ghost:
          'bg-transparent ui-text hover:bg-[var(--ui-surface)]',
        link:
          'ui-primary hover:underline',
        subtle:
          'ui-surface-muted ui-text hover:bg-[var(--ui-bg)]',
        dark:
          'ui-bg ui-text hover:bg-[var(--ui-bg)]',
        light:
          'ui-surface-muted ui-text border ui-border-strong hover:bg-[var(--ui-surface)]',
        primaryOutline:
          'border border-[var(--ui-primary)] ui-primary bg-transparent hover:bg-[var(--ui-primary-soft)]',
        dangerOutline:
          'border border-[var(--ui-danger)] ui-danger bg-transparent hover:bg-[var(--ui-danger-soft)]',
        successOutline:
          'border border-[var(--ui-success)] ui-success bg-transparent hover:bg-[var(--ui-success-soft)]',
        gradient:
          'bg-linear-to-r from-[var(--ui-primary-soft)] to-[var(--ui-accent)] ui-text hover:from-[var(--ui-primary)] hover:to-[var(--ui-accent)]',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base'
      },
      shape: {
        rounded: 'rounded-md',
        pill: 'rounded-full',
        square: 'rounded-none'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      shape: 'rounded'
    }
  }
)

// Computed icon sizing
const iconClasses = computed(() => {
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }
  return ['mr-1', iconSizes[props.size]]
})
</script>
