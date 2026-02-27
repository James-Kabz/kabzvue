<script setup>
import { ref } from 'vue'
import { toast } from '../../lib/toast'
import Button from '../../components/Button.vue'
import Link from '../../components/Link.vue'

const email = ref('')
const password = ref('')
const companyCode = ref('')
const errors = ref({})
const isLoading = ref(false)

const onSubmit = async () => {
  errors.value = {}
  isLoading.value = true

  if (!email.value) {
    errors.value.email = 'Username is required'
  }
  if (!password.value) {
    errors.value.password = 'Password is required'
  }
  if (!companyCode.value) {
    errors.value.companyCode = 'Company code is required'
  }

  if (Object.keys(errors.value).length === 0) {
    console.log('Form submitted:', {
      email: email.value,
      password: password.value,
      companyCode: companyCode.value
    })

    await new Promise(resolve => setTimeout(resolve, 2000))

    toast.info('Sign in successful!', {
      description: `Welcome back ${email.value}`,
    })
  }

  isLoading.value = false
}
</script>

<template>
  <form
    class="space-y-4"
    @submit.prevent="onSubmit"
  >
    <div>
      <label
        for="auth-username"
        class="sr-only"
      >Username</label>
      <div class="flex">
        <span class="inline-flex h-10 w-10 items-center justify-center rounded-l-md border border-r-0 border-[#c4cad2] bg-[#d8dde3] text-[#333a41]">
          <font-awesome-icon icon="paper-plane" />
        </span>
        <input
          id="auth-username"
          v-model="email"
          type="text"
          placeholder="Username"
          :disabled="isLoading"
          class="h-10 w-full rounded-r-md border border-[#c4cad2] bg-[#f8fafb] px-3 text-[14px] text-[#3f4954] placeholder:text-[#7a8591] focus:border-[#9ca7b2] focus:outline-none"
        >
      </div>
      <p
        v-if="errors.email"
        class="mt-1 text-xs text-[#d73147]"
      >
        {{ errors.email }}
      </p>
    </div>

    <div>
      <label
        for="auth-password"
        class="sr-only"
      >Password</label>
      <div class="flex">
        <span class="inline-flex h-10 w-10 items-center justify-center rounded-l-md border border-r-0 border-[#c4cad2] bg-[#d8dde3] text-[#333a41]">
          <font-awesome-icon icon="lock" />
        </span>
        <input
          id="auth-password"
          v-model="password"
          :type="'password'"
          placeholder="Password"
          :disabled="isLoading"
          class="h-10 w-full rounded-r-md border border-[#c4cad2] bg-[#f8fafb] px-3 text-[14px] text-[#3f4954] placeholder:text-[#7a8591] focus:border-[#9ca7b2] focus:outline-none"
        >
      </div>
      <p
        v-if="errors.password"
        class="mt-1 text-xs text-[#d73147]"
      >
        {{ errors.password }}
      </p>
    </div>

    <div>
      <label
        for="auth-company"
        class="sr-only"
      >Company Code</label>
      <div class="flex">
        <span class="inline-flex h-10 w-10 items-center justify-center rounded-l-md border border-r-0 border-[#c4cad2] bg-[#d8dde3] text-[#333a41]">
          <font-awesome-icon icon="lock" />
        </span>
        <input
          id="auth-company"
          v-model="companyCode"
          type="text"
          placeholder="Company Code"
          :disabled="isLoading"
          class="h-10 w-full rounded-r-md border border-[#c4cad2] bg-[#f8fafb] px-3 text-[14px] text-[#3f4954] placeholder:text-[#7a8591] focus:border-[#9ca7b2] focus:outline-none"
        >
      </div>
      <p
        v-if="errors.companyCode"
        class="mt-1 text-xs text-[#d73147]"
      >
        {{ errors.companyCode }}
      </p>
    </div>

    <Button
      type="submit"
      class="h-10 w-full rounded-md border border-[#cd2e41] bg-[#de3247] text-[14px] font-semibold tracking-[0.16em] text-white shadow-[0_4px_10px_rgba(0,0,0,0.2)] transition hover:bg-[#c92d3f]"
      :disabled="isLoading"
      :loading="isLoading"
    >
      LOG IN
    </Button>

    <div class="pt-2 text-center">
      <Link
        href="/auth/forgot-password"
        class="text-[13px] font-medium text-[#de3247] hover:text-[#c92d3f]"
      >
        Forgot Password ?
      </Link>
    </div>
  </form>
</template>
