<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'
import Typography from '../components/Typography.vue'
import Divider from '../components/Divider.vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Login to your account:'
  },
  subtitle: {
    type: String,
    default: null
  },
  logoUrl: {
    type: String,
    default: '/applogo.png'
  },
  quote: {
    type: String,
    default: 'MANAGEMENT IS DOING THINGS RIGHT, BUT LEADERSHIP IS DOING RIGHT THINGS'
  },
  backgroundImage: {
    type: String,
    default: '/stlbacklogo.jpeg'
  },
  backgroundOpacity: {
    type: Number,
    default: 1
  },
  appName: {
    type: String,
    default: 'applogo'
  },
  appVersion: {
    type: String,
    default: '0.0.1'
  },
  copyright: {
    type: String,
    default: 'Software Technologies Limited'
  },
  showFooter: {
    type: Boolean,
    default: true
  }
})

const currentYear = computed(() => new Date().getFullYear())

onMounted(() => {
  document.documentElement.classList.add('auth-page')
  document.body.classList.add('auth-page')
})

onBeforeUnmount(() => {
  document.documentElement.classList.remove('auth-page')
  document.body.classList.remove('auth-page')
})
</script>

<template>
  <div class="relative min-h-screen overflow-hidden">
    <div
      class="absolute inset-0 bg-cover bg-center"
      :style="{
        backgroundImage: `url('${backgroundImage}')`,
      }"
    />
    <div class="absolute inset-0 " />

    <div class="relative z-10 mx-auto flex min-h-screen w-full max-w-[1400px] items-center px-4 py-4 sm:px-8 sm:py-6 lg:px-14">
      <section class="hidden w-full max-w-4xl pr-10 lg:block">
        <Typography
          v-if="quote"
          variant="body-xl"
          class="max-w-3xl text-2xl leading-[1.4] font-light tracking-wide text-white/90 xl:text-[38px]"
        >
          "{{ quote }}"
        </Typography>
      </section>

      <section class="ml-auto w-full max-w-[390px]">
        <div class="overflow-hidden rounded-sm ui-surface">
          <div class="px-1 sm:pt-2">
            <div class="flex items-start justify-between gap-2">
              <img
                :src="logoUrl"
                alt="App logo"
                class="h-12 w-auto max-w-[180px] object-contain sm:h-32"
              >
              <img
                src="/logo.png"
                alt="Software logo"
                class="h-8 w-auto object-contain sm:h-32"
              >
            </div>

            <div
              v-if="$slots['card-header'] || title"
            >
              <slot name="card-header">
                <Typography
                  variant="text-xl"
                  align="center"
                  class="font-normal leading-tight text-[#1f2328] text-center"
                >
                  {{ title }}
                </Typography>
                <Typography
                  v-if="subtitle"
                  variant="body-sm"
                  class="mt-1 text-xs leading-normal text-[#5f6a74]"
                >
                  {{ subtitle }}
                </Typography>
              </slot>
            </div>
          </div>

          <Divider
            size="sm"
            class="my-0 bg-[#c7ccd2]"
          />

          <div class="px-5 py-4 sm:px-6 sm:py-2">
            <div class="space-y-4">
              <router-view />
            </div>
          </div>

          <div
            v-if="$slots['card-footer']"
            class="px-6 pb-6 sm:px-8 sm:pb-8"
          >
            <slot name="card-footer" />
          </div>
        </div>

        <div
          v-if="showFooter"
          class="mt-5 text-center text-white"
        >
          <Typography
            variant="body-md"
            class="text-xs font-light leading-none text-white sm:text-[14px]"
          >
            {{ appVersion }}
          </Typography>
          <Typography
            variant="body-md"
            class="mt-2 text-sm font-light leading-none text-white sm:text-[16px]"
          >
            &copy; {{ copyright }}
          </Typography>
          <Typography
            variant="body-sm"
            class="mt-1 text-sm font-light leading-none text-white sm:text-[14px]"
          >
            (2011 - {{ currentYear }})
          </Typography>
        </div>

        <div
          v-if="$slots.links"
          class="mt-4 text-center"
        >
          <slot name="links" />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
:global(html.auth-page),
:global(body.auth-page) {
  background-color: #1e1a18;
  overscroll-behavior-y: none;
}
</style>
