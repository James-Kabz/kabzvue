<script setup>
import { computed } from 'vue'

// Define component props
const props = defineProps({
  loading: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    default: 'spin',
    validator: (value) => [
      'spin', 'pulse', 'bounce', 'ripple',
      'bars', 'dots', 'ring', 'spinner-text'
    ].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large', 'xl'].includes(value)
  },
  color: {
    type: String,
    default: 'var(--ui-primary)'
  },
  backgroundColor: {
    type: String,
    default: 'color-mix(in oklab, var(--ui-surface), transparent 8%)'
  },
  blur: {
    type: [Number, String],
    default: 0
  },
  text: {
    type: String,
    default: ''
  },
  textPosition: {
    type: String,
    default: 'bottom',
    validator: (value) => ['top', 'bottom'].includes(value)
  },
  overlay: {
    type: Boolean,
    default: false
  },
  fullscreen: {
    type: Boolean,
    default: false
  }
})

const blurValue = computed(() => {
  if (props.blur === null || props.blur === undefined || props.blur === '') return '0px'
  if (typeof props.blur === 'number') return `${props.blur}px`

  const value = props.blur.trim()
  if (!value) return '0px'
  if (/^-?\d*\.?\d+$/.test(value)) return `${value}px`

  return value
})
</script>

<template>
  <div
    v-if="loading"
    :class="[
      'loader',
      `loader--${type}`,
      `loader--${size}`,
      overlay ? 'loader--overlay' : '',
      fullscreen ? 'loader--fullscreen' : ''
    ]"
    :style="{
      '--loader-color': color,
      '--loader-bg': backgroundColor,
      '--loader-blur': blurValue
    }"
  >
    <!-- Optional backdrop -->
    <div
      v-if="overlay"
      class="loader__backdrop"
    />

    <!-- Loader container -->
    <div class="loader__container">
      <!-- Text above loader -->
      <div
        v-if="text && textPosition === 'top'"
        class="loader__text loader__text--top"
      >
        {{ text }}
      </div>

      <!-- Spin Loader -->
      <div
        v-if="type === 'spin'"
        class="loader__spin"
      />

      <!-- Pulse Loader -->
      <div
        v-else-if="type === 'pulse'"
        class="loader__pulse"
      />

      <!-- Bounce Loader -->
      <div
        v-else-if="type === 'bounce'"
        class="loader__bounce"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="loader__bounce-dot"
          :style="{ animationDelay: `${(i - 1) * 0.1}s` }"
        />
      </div>

      <!-- Ripple Loader -->
      <div
        v-else-if="type === 'ripple'"
        class="loader__ripple"
      >
        <div
          v-for="i in 2"
          :key="i"
          class="loader__ripple-ring"
          :style="{ animationDelay: `${(i - 1) * 0.5}s` }"
        />
      </div>

      <!-- Bars Loader -->
      <div
        v-else-if="type === 'bars'"
        class="loader__bars"
      >
        <div
          v-for="i in 5"
          :key="i"
          class="loader__bar"
          :style="{ animationDelay: `${(i - 1) * 0.1}s` }"
        />
      </div>

      <!-- Dots Loader -->
      <div
        v-else-if="type === 'dots'"
        class="loader__dots"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="loader__dot"
          :style="{ animationDelay: `${(i - 1) * 0.16}s` }"
        />
      </div>

      <!-- Ring Loader -->
      <div
        v-else-if="type === 'ring'"
        class="loader__ring"
      >
        <div class="loader__ring-track" />
        <div class="loader__ring-fill" />
      </div>

      <!-- Spinner with text -->
      <div
        v-else-if="type === 'spinner-text'"
        class="loader__spinner-text"
      >
        <div class="loader__spinner" />
      </div>

      <!-- Text below loader -->
      <div
        v-if="text && textPosition === 'bottom'"
        class="loader__text loader__text--bottom"
      >
        {{ text }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.loader {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 100%;
}

.loader--overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

.loader--fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background-color: var(--loader-bg);
  backdrop-filter: blur(var(--loader-blur));
  -webkit-backdrop-filter: blur(var(--loader-blur));
}

.loader__backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--loader-bg);
  backdrop-filter: blur(var(--loader-blur));
  -webkit-backdrop-filter: blur(var(--loader-blur));
}

.loader__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: min(calc(100vw - 24px), 360px);
  padding-inline: 12px;
  box-sizing: border-box;
}

.loader__text {
  font-size: 14px;
  color: var(--ui-text);
  font-weight: 500;
  text-align: center;
  line-height: 1.4;
  word-break: break-word;
}

.loader__text--top {
  margin-bottom: 8px;
}

.loader__text--bottom {
  margin-top: 8px;
}

/* Size variants */
.loader--small .loader__container {
  gap: 8px;
}

.loader--medium .loader__container {
  gap: 12px;
}

.loader--large .loader__container {
  gap: 16px;
}

.loader--xl .loader__container {
  gap: 20px;
}

.loader--small .loader__text {
  font-size: 12px;
}

.loader--medium .loader__text {
  font-size: 14px;
}

.loader--large .loader__text {
  font-size: 16px;
}

.loader--xl .loader__text {
  font-size: 18px;
}

/* Spin Loader */
.loader__spin {
  border: 4px solid var(--ui-border-strong);
  border-top: 4px solid var(--loader-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loader--small .loader__spin {
  width: 24px;
  height: 24px;
  border-width: 3px;
}

.loader--medium .loader__spin {
  width: 40px;
  height: 40px;
  border-width: 4px;
}

.loader--large .loader__spin {
  width: 56px;
  height: 56px;
  border-width: 5px;
}

.loader--xl .loader__spin {
  width: 72px;
  height: 72px;
  border-width: 6px;
}

/* Pulse Loader */
.loader__pulse {
  background-color: var(--loader-color);
  border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.loader--small .loader__pulse {
  width: 24px;
  height: 24px;
}

.loader--medium .loader__pulse {
  width: 40px;
  height: 40px;
}

.loader--large .loader__pulse {
  width: 56px;
  height: 56px;
}

.loader--xl .loader__pulse {
  width: 72px;
  height: 72px;
}

/* Bounce Loader */
.loader__bounce {
  display: flex;
  gap: 4px;
  align-items: flex-end;
}

.loader__bounce-dot {
  background-color: var(--loader-color);
  border-radius: 50%;
  animation: bounce 1.4s ease-in-out infinite both;
}

.loader--small .loader__bounce-dot {
  width: 8px;
  height: 8px;
}

.loader--medium .loader__bounce-dot {
  width: 12px;
  height: 12px;
}

.loader--large .loader__bounce-dot {
  width: 16px;
  height: 16px;
}

.loader--xl .loader__bounce-dot {
  width: 20px;
  height: 20px;
}

/* Ripple Loader */
.loader__ripple {
  position: relative;
}

.loader__ripple-ring {
  position: absolute;
  border: 4px solid var(--loader-color);
  border-radius: 50%;
  animation: ripple 1s linear infinite;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.loader--small .loader__ripple {
  width: 40px;
  height: 40px;
}

.loader--medium .loader__ripple {
  width: 60px;
  height: 60px;
}

.loader--large .loader__ripple {
  width: 80px;
  height: 80px;
}

.loader--xl .loader__ripple {
  width: 100px;
  height: 100px;
}

.loader--small .loader__ripple-ring {
  width: 40px;
  height: 40px;
  border-width: 2px;
}

.loader--medium .loader__ripple-ring {
  width: 60px;
  height: 60px;
  border-width: 3px;
}

.loader--large .loader__ripple-ring {
  width: 80px;
  height: 80px;
  border-width: 4px;
}

.loader--xl .loader__ripple-ring {
  width: 100px;
  height: 100px;
  border-width: 5px;
}

/* Bars Loader */
.loader__bars {
  display: flex;
  gap: 3px;
  align-items: flex-end;
}

.loader__bar {
  background-color: var(--loader-color);
  border-radius: 2px;
  animation: bar-scale 1s ease-in-out infinite;
}

.loader--small .loader__bar {
  width: 3px;
  height: 16px;
}

.loader--medium .loader__bar {
  width: 4px;
  height: 24px;
}

.loader--large .loader__bar {
  width: 5px;
  height: 32px;
}

.loader--xl .loader__bar {
  width: 6px;
  height: 40px;
}

/* Dots Loader */
.loader__dots {
  display: flex;
  gap: 6px;
}

.loader__dot {
  background-color: var(--loader-color);
  border-radius: 50%;
  animation: dot-bounce 1.4s ease-in-out infinite both;
}

.loader--small .loader__dot {
  width: 8px;
  height: 8px;
}

.loader--medium .loader__dot {
  width: 12px;
  height: 12px;
}

.loader--large .loader__dot {
  width: 16px;
  height: 16px;
}

.loader--xl .loader__dot {
  width: 20px;
  height: 20px;
}

/* Ring Loader */
.loader__ring {
  position: relative;
}

.loader__ring-track {
  border: 4px solid var(--ui-border-strong);
  border-radius: 50%;
}

.loader__ring-fill {
  position: absolute;
  top: 0;
  left: 0;
  border: 4px solid transparent;
  border-top: 4px solid var(--loader-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loader--small .loader__ring-track,
.loader--small .loader__ring-fill {
  width: 24px;
  height: 24px;
  border-width: 3px;
}

.loader--medium .loader__ring-track,
.loader--medium .loader__ring-fill {
  width: 40px;
  height: 40px;
  border-width: 4px;
}

.loader--large .loader__ring-track,
.loader--large .loader__ring-fill {
  width: 56px;
  height: 56px;
  border-width: 5px;
}

.loader--xl .loader__ring-track,
.loader--xl .loader__ring-fill {
  width: 72px;
  height: 72px;
  border-width: 6px;
}

/* Spinner with text */
.loader__spinner-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loader__spinner {
  border: 3px solid var(--ui-border-strong);
  border-top: 3px solid var(--loader-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loader--small .loader__spinner {
  width: 20px;
  height: 20px;
}

.loader--medium .loader__spinner {
  width: 32px;
  height: 32px;
}

.loader--large .loader__spinner {
  width: 44px;
  height: 44px;
}

.loader--xl .loader__spinner {
  width: 56px;
  height: 56px;
}

@media (max-width: 640px) {
  .loader--overlay,
  .loader--fullscreen {
    padding: 16px;
    box-sizing: border-box;
  }

  .loader__container {
    max-width: min(calc(100vw - 24px), 300px);
    gap: 10px;
    padding-inline: 8px;
  }

  .loader--large .loader__container {
    transform: scale(0.9);
    transform-origin: center;
  }

  .loader--xl .loader__container {
    transform: scale(0.8);
    transform-origin: center;
  }

  .loader__text {
    font-size: 13px;
  }
}

/* Animations */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

@keyframes bounce {

  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes ripple {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }

  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

@keyframes bar-scale {

  0%,
  40%,
  100% {
    transform: scaleY(0.4);
  }

  20% {
    transform: scaleY(1);
  }
}

@keyframes dot-bounce {

  0%,
  80%,
  100% {
    transform: scale(0);
  }

  40% {
    transform: scale(1);
  }
}
</style>
