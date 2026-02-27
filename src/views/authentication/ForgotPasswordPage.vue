<script setup>
import { ref, computed } from 'vue'
import Typography from '../../components/Typography.vue'
import Button from '../../components/Button.vue'
import FormField from '../../components/FormField.vue'
import Input from '../../components/Input.vue'
import Link from '../../components/Link.vue'

const email = ref('')
const companyCode = ref('')
const isLoading = ref(false)
const isSubmitted = ref(false)
const errors = ref({})

const onSubmit = async () => {
  errors.value = {} // reset
  isLoading.value = true

  // Validation
  if (!email.value) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = 'Please enter a valid email address'
  }

  if (!companyCode.value) {
    errors.value.companyCode = 'Company code is required'
  }

  if (Object.keys(errors.value).length === 0) {
    try {
      console.log('Password reset requested:', {
        email: email.value,
        companyCode: companyCode.value
      })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Mark as submitted
      isSubmitted.value = true

      // Call your API here
      // await resetPassword({ email: email.value, companyCode: companyCode.value })

    } catch (error) {
      console.error('Password reset failed:', error)
      // Handle API errors here
      errors.value.email = 'Failed to send reset email. Please try again.'
    }
  }

  isLoading.value = false
}

const isFormValid = computed(() => {
  return Object.keys(errors.value).length === 0 && email.value && companyCode.value
})

const handleTryAgain = () => {
  isSubmitted.value = false
  errors.value = {}
}
</script>

<template>
  <div class="w-full max-w-sm space-y-6">
    <!-- Header -->
    <div class="text-center space-y-2">
      <Typography
        variant="display-sm"
        class="ui-text"
      >
        Forgot Password?
      </Typography>
      <Typography
        variant="body-sm"
        class="ui-text"
      >
        Enter your email and company code to receive a password reset link.
      </Typography>
    </div>

    <!-- Success Message -->
    <div
      v-if="isSubmitted"
      class="text-center space-y-4"
    >
      <div class="mx-auto w-12 h-12 ui-success-soft rounded-full flex items-center justify-center">
        <svg
          class="w-6 h-6 ui-success"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <div class="space-y-2">
        <Typography
          variant="text-sm"
          class="ui-text font-semibold"
        >
          Reset Link Sent!
        </Typography>
        <Typography
          variant="body-sm"
          class="ui-text"
        >
          We've sent a password reset link to {{ email }}. Please check your email and follow the instructions.
        </Typography>
      </div>

      <div class="pt-4 space-y-3">
        <Typography
          variant="body-sm"
          class="ui-text"
        >
          Didn't receive the email? Check your spam folder or try again.
        </Typography>

        <Button
          variant="default"
          size="sm"
          class="mx-auto"
          @click="handleTryAgain"
        >
          Try Again
        </Button>
      </div>
    </div>

    <!-- Form -->
    <form
      v-else
      class="space-y-6"
      @submit.prevent="onSubmit"
    >
      <!-- Email -->
      <FormField
        label="Email"
        :error="errors.email"
        required
      >
        <template #default="{ fieldId, hasError, ariaDescribedBy }">
          <Input
            :id="fieldId"
            v-model="email"
            placeholder="Enter your email address"
            type="email"
            :class="hasError ? 'border-(--ui-danger)' : 'ui-border-strong'"
            :aria-describedby="ariaDescribedBy"
            :disabled="isLoading"
          />
        </template>
      </FormField>

      <!-- Company Code -->
      <FormField
        label="Company Code"
        :error="errors.companyCode"
        required
      >
        <template #default="{ fieldId, hasError, ariaDescribedBy }">
          <Input
            :id="fieldId"
            v-model="companyCode"
            placeholder="Enter your company code"
            type="text"
            :class="hasError ? 'border-(--ui-danger)' : 'ui-border-strong'"
            :aria-describedby="ariaDescribedBy"
            :disabled="isLoading"
          />
        </template>
      </FormField>

      <!-- Submit Button -->
      <Button
        type="submit"
        :disabled="!isFormValid"
        :loading="isLoading"
        loading-text="Sending..."
        variant="default"
        size="default"
        class="w-full"
      >
        Send Reset Link
      </Button>
    </form>

    <!-- Back to Login -->
    <div class="text-center">
      <Typography
        variant="body-sm"
        class="ui-text"
      >
        Remember your password?
        <Link
          href="/auth/login"
          class="ui-primary hover:text-(--ui-primary) font-medium ml-1"
        >
          Back to Sign In
        </Link>
      </Typography>
    </div>
  </div>
</template>
