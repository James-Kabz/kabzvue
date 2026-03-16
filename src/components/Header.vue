<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { cn } from '../utils/cn.js'
import Icon from './Icon.vue'

const props = defineProps({
  sidebarWidth: { type: Number, default: 256 },
  currentSection: { type: String, default: 'Dashboard' },
  currentPage: { type: String, default: 'Overview' },
  currentRoute: { type: String, default: '' },
  user: { type: Object, required: true },
  notifications: { type: Array, default: () => [] },
  profileMenuItems: { type: Array, required: true },
  mobileOpen: { type: Boolean, default: false },
  currentCompany: { type: Object, default: null },
  companyLogo: { type: String, default: '' },
  currentCompanyLogo: { type: String, default: '' },
  companyLogos: { type: Object, default: () => ({}) },
  companies: { type: Array, default: () => [] },
  activeRoles: { type: Array, default: () => [] },
  showSearch: { type: Boolean, default: true },
  showNotifications: { type: Boolean, default: true },
  showBreadcrumb: { type: Boolean, default: true },
  showCompanyInfo: { type: Boolean, default: true },
  showUserDetails: { type: Boolean, default: true },
  showHeaderLogo: { type: Boolean, default: true },
  headerLogo: { type: String, default: 'dist/logo.png' },
  searchPlaceholder: { type: String, default: 'Search...' },
  notificationsTitle: { type: String, default: 'Notifications' },
  companySwitcherTitle: { type: String, default: 'Switch Company' },
  companySwitcherDescription: { type: String, default: 'Select a company to view its data' },
  entityLabel: { type: String, default: 'Company' },
  entityFieldMap: { type: Object, default: () => ({}) },
  settingsMenuItems: { type: Array, default: () => [] },
  showSettings: { type: Boolean, default: true },
  settingsTitle: { type: String, default: 'Settings' },
  settingsBadgeCount: { type: Number, default: 0 },
  userInitialsOverride: { type: String, default: '' },
  userRoleDisplayOverride: { type: String, default: '' }
})

const emit = defineEmits([
  'search',
  'profile-action',
  'logout',
  'navigate',
  'toggle-mobile-sidebar',
  'company-change',
  'notification-click',
  'view-all-notifications',
  'settings-action'
])

const searchQuery = ref('')
const showNotificationsDropdown = ref(false)
const showProfile = ref(false)
const showMobileSearch = ref(false)
const isMobile = ref(false)
const showCompanyDropdown = ref(false)
const showSettingsDropdown = ref(false)

const notificationCount = computed(() => props.notifications.filter(n => !n.read).length)

const resolvedSettingsBadge = computed(() => {
  if (props.settingsBadgeCount > 0) return props.settingsBadgeCount
  return props.settingsMenuItems.filter(item => item?.route).length
})

const userInitials = computed(() => {
  if (props.userInitialsOverride) return props.userInitialsOverride
  const name = props.user?.name || 'Guest'
  return name.split(' ').map(n => n[0] || '').join('').toUpperCase()
})

const entityLabelLower = computed(() => String(props.entityLabel || 'Company').toLowerCase())
const resolvedShowCompanyInfo = computed(() => props.showCompanyInfo)
const resolvedSwitcherTitle = computed(() => props.companySwitcherTitle || `Switch ${props.entityLabel || 'Company'}`)
const resolvedSwitcherDescription = computed(() => {
  return props.companySwitcherDescription || `Select a ${(props.entityLabel || 'Company').toLowerCase()} to view its data`
})

const resolvedFieldMap = computed(() => ({
  id: props.entityFieldMap?.id || '',
  name: props.entityFieldMap?.name || '',
  role: props.entityFieldMap?.role || '',
  type: props.entityFieldMap?.type || '',
  typeName: props.entityFieldMap?.typeName || ''
}))

const companyIdAliases = ['company_id', 'companyId', 'id']
const companyNameAliases = ['company_name', 'companyName', 'name']
const companyRoleAliases = ['company_role', 'companyRole', 'role']
const companyTypeAliases = ['company_type', 'companyType', 'type']
const companyTypeNameAliases = ['name', 'label', 'title', 'company_type_name', 'companyTypeName']

const getFieldValue = (obj, preferredKey, aliases = []) => {
  if (!obj || typeof obj !== 'object') return null
  if (preferredKey && obj[preferredKey] != null) return obj[preferredKey]
  for (const key of aliases) {
    if (obj[key] != null) return obj[key]
  }
  return null
}

const getCompanyTypeName = (company) => {
  if (!company || typeof company !== 'object') return ''

  const typeValue = getFieldValue(company, resolvedFieldMap.value.type, companyTypeAliases)
  if (typeof typeValue === 'string') return typeValue

  if (typeValue && typeof typeValue === 'object') {
    const nestedTypeName = getFieldValue(typeValue, resolvedFieldMap.value.typeName, companyTypeNameAliases)
    if (nestedTypeName != null) return String(nestedTypeName)
  }

  const directTypeName = getFieldValue(company, resolvedFieldMap.value.typeName, companyTypeNameAliases)
  if (directTypeName != null) return String(directTypeName)
  return ''
}

const normalizeCompany = (company) => {
  if (!company || typeof company !== 'object') return null

  const id = getFieldValue(company, resolvedFieldMap.value.id, companyIdAliases)
  const name = getFieldValue(company, resolvedFieldMap.value.name, companyNameAliases)
  const role = getFieldValue(company, resolvedFieldMap.value.role, companyRoleAliases)

  return {
    ...company,
    __id: id,
    __name: name != null ? String(name) : 'Unknown',
    __role: role != null ? String(role) : '',
    __typeName: getCompanyTypeName(company),
    __raw: company
  }
}

const sourceCurrentCompany = computed(() => props.currentCompany)
const sourceCompanies = computed(() => (Array.isArray(props.companies) ? props.companies : []))
const normalizedCurrentCompany = computed(() => normalizeCompany(sourceCurrentCompany.value))
const normalizedCompanies = computed(() => sourceCompanies.value.map(normalizeCompany).filter(Boolean))

const userRoleNames = computed(() => {
  if (props.userRoleDisplayOverride) return props.userRoleDisplayOverride

  const roles = []

  if (props.activeRoles?.length > 0) {
    roles.push(...props.activeRoles.map(role => (typeof role === 'string' ? role : role.name)))
  }

  if (roles.length === 0 && props.user?.roles?.length > 0) {
    roles.push(...props.user.roles.map(role => (typeof role === 'string' ? role : role.name)))
  }

  if (roles.length === 0 && normalizedCurrentCompany.value?.__role) {
    roles.push(normalizedCurrentCompany.value.__role)
  }

  if (roles.length === 0) return 'Member'

  return roles
    .map(role => role.charAt(0).toUpperCase() + role.slice(1).replace(/-/g, ' '))
    .join(', ')
})

const formattedActiveRoles = computed(() => {
  if (!props.activeRoles || props.activeRoles.length === 0) return ''
  return props.activeRoles
    .map(role => (typeof role === 'string' ? role : role.name))
    .map(role => role.charAt(0).toUpperCase() + role.slice(1).replace(/-/g, ' '))
    .join(', ')
})

const toggleNotifications = () => {
  showNotificationsDropdown.value = !showNotificationsDropdown.value
  showProfile.value = false
  showSettingsDropdown.value = false
}

const toggleProfile = () => {
  showProfile.value = !showProfile.value
  showNotificationsDropdown.value = false
  showCompanyDropdown.value = false
  showSettingsDropdown.value = false
}

const toggleCompanyDropdown = () => {
  showCompanyDropdown.value = !showCompanyDropdown.value
  showProfile.value = false
  showNotificationsDropdown.value = false
  showSettingsDropdown.value = false
}

const toggleSettingsDropdown = () => {
  showSettingsDropdown.value = !showSettingsDropdown.value
  showProfile.value = false
  showNotificationsDropdown.value = false
  showCompanyDropdown.value = false
}

const handleNavigation = (item) => {
  emit('navigate', item)
  showProfile.value = false
  showSettingsDropdown.value = false
}

const isItemActive = (item) => {
  if (!item.route) return false
  if (props.currentRoute === item.route) return true
  if (props.currentRoute.startsWith(item.route + '/')) return true
  return false
}

const handleProfileAction = (item) => {
  emit('profile-action', item)
  showProfile.value = false
}

const handleLogout = () => {
  emit('logout')
  showProfile.value = false
}

const handleCompanyChange = (company) => {
  const selectedCompany = company?.__raw || company
  emit('company-change', selectedCompany)
  showCompanyDropdown.value = false
}

const handleNotificationClick = (notification) => {
  emit('notification-click', notification)
}

const handleViewAllNotifications = () => {
  emit('view-all-notifications')
  showNotificationsDropdown.value = false
}

const handleSettingsAction = (item) => {
  emit('settings-action', item)
  showSettingsDropdown.value = false
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.absolute') && !event.target.closest('button')) {
    showNotificationsDropdown.value = false
    showProfile.value = false
    showCompanyDropdown.value = false
    showSettingsDropdown.value = false
  }
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

const getNotificationTypeClass = (notification) => {
  if (notification.title.includes('Overdue')) return 'ui-danger-soft ui-danger'
  if (notification.title.includes('Due in 0')) return 'ui-warning-soft ui-warning'

  const classes = {
    due_date_reminder: 'ui-warning-soft ui-warning',
    info: 'ui-primary-soft ui-primary',
    success: 'ui-success-soft ui-success',
    warning: 'ui-warning-soft ui-warning',
    error: 'ui-danger-soft ui-danger'
  }

  return classes[notification.type] || classes.info
}

const formatModelName = (model) => {
  if (!model) return ''
  const parts = model.split('\\')
  const modelName = parts[parts.length - 1]
  return modelName
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const formatDueDate = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueDate = new Date(date)
  dueDate.setHours(0, 0, 0, 0)

  const diffTime = dueDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Due Today'
  if (diffDays === 1) return 'Due Tomorrow'
  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
  if (diffDays <= 7) return `Due in ${diffDays} days`

  return date.toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  })
}

const getCompanyLogoUrl = (company) => {
  const companyId = company?.__id ?? getFieldValue(company, resolvedFieldMap.value.id, companyIdAliases)
  if (companyId == null) return null
  return props.companyLogos[companyId] || null
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', checkMobile)
})

watch(searchQuery, (newValue) => emit('search', newValue))
</script>

<template>
  <header
    :class="cn(
      'fixed top-0 z-50 w-full border-b ui-border-strong bg-[color:color-mix(in oklab, var(--ui-surface), transparent 8%)] backdrop-blur-md transition-all duration-300 ease-out'
    )"
    :style="{ left: '0' }"
  >
    <div class="flex items-center justify-between h-16 sm:h-18 px-3 sm:px-4 md:px-6">
      <!-- Left side - Company & Page Info -->
      <div class="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
        <!-- Mobile Sidebar Toggle - Moved to far left -->
        <button
          v-if="isMobile"
          class="p-2 ui-text rounded-lg hover:bg-(--ui-surface-muted) transition-colors shrink-0"
          @click="emit('toggle-mobile-sidebar')"
        >
          <Icon
            icon="bars"
            class="w-5 h-5"
          />
        </button>

        <!-- Company Logo (Software Provider) -->
        <div
          v-if="companyLogo && showHeaderLogo"
          class="shrink-0 hidden sm:block"
        >
          <img
            :src="companyLogo"
            alt="Company logo"
            class="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-lg shadow-sm"
          >
        </div>

        <!-- Divider -->
        <div
          v-if="companyLogo && resolvedShowCompanyInfo && normalizedCurrentCompany"
          class="h-6 sm:h-8 w-px ui-border-strong-bg shrink-0 hidden sm:block"
        />

        <!-- Company Info Card - Simplified for mobile -->
        <div
          v-if="resolvedShowCompanyInfo && normalizedCurrentCompany"
          class="shrink-0 ui-surface border ui-border-strong px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl shadow-sm flex items-center gap-2 relative hover:bg-(--ui-surface-muted) transition-colors max-w-44 sm:max-w-md"
        >
          <!-- Company Logo - Smaller on all screens -->
          <div
            v-if="currentCompanyLogo"
            class="shrink-0"
          >
            <div class="relative">
              <img
                :src="currentCompanyLogo"
                :alt="`${normalizedCurrentCompany.__name} ${entityLabelLower} logo`"
                class="w-6 h-6 sm:w-8 sm:h-8 object-contain rounded-md ui-bg p-0.5 border border-(--ui-primary-soft) shadow-sm"
              >
              <!-- Online indicator - smaller -->
              <div class="absolute -bottom-0.5 -right-0.5 w-2 h-2 ui-success-bg border ui-border-surface rounded-full" />
            </div>
          </div>

          <!-- Company Details with Switcher -->
          <button
            v-if="normalizedCompanies.length > 1"
            class="flex items-center gap-2 sm:gap-3 w-52 sm:w-60 cursor-pointer hover:bg-[color:color-mix(in oklab, var(--ui-surface-muted), transparent 35%)] rounded-md px-1.5 py-1 transition-all group"
            @click="toggleCompanyDropdown"
          >
            <div class="flex-1 min-w-0">
              <p
                class="text-sm font-semibold ui-text truncate group-hover:text-(--ui-primary) leading-tight"
              >
                {{ normalizedCurrentCompany.__name }}
              </p>
              <div class="flex items-center gap-1.5">
                <Icon
                  icon="user"
                  class="w-3.5 h-3.5 ui-primary shrink-0"
                />
                <p
                  v-if="formattedActiveRoles"
                  class="text-xs sm:text-sm ui-primary truncate font-medium leading-tight"
                >
                  {{ formattedActiveRoles }}
                </p>
              </div>
            </div>
            <Icon
              icon="chevron-down"
              class="w-4 h-4 ui-primary shrink-0 group-hover:text-(--ui-primary) transition-transform"
              :class="{ 'rotate-180': showCompanyDropdown }"
            />
          </button>

          <!-- Static display when only one company -->
          <div
            v-else
            class="min-w-0 flex-1"
          >
            <p class="text-xs font-bold ui-primary truncate max-w-[100px] sm:max-w-40 leading-tight">
              {{ normalizedCurrentCompany.__name }}
            </p>
            <div class="flex items-center gap-1 mt-0.5">
              <Icon
                icon="user"
                class="w-2.5 h-2.5 ui-primary shrink-0"
              />
              <p
                v-if="formattedActiveRoles"
                class="text-[10px] sm:text-xs ui-primary truncate font-medium leading-tight"
              >
                {{ formattedActiveRoles }}
              </p>
            </div>
          </div>

          <!-- Company Dropdown - Same as before but positioned better -->
          <transition
            enter-active-class="transition-all duration-200 ease-out"
            leave-active-class="transition-all duration-200 ease-in"
            enter-from-class="opacity-0 translate-y-2 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 translate-y-2 scale-95"
          >
            <div
              v-if="showCompanyDropdown"
              class="ui-surface absolute top-full left-0 right-0 sm:left-0 sm:right-auto mt-2 w-72 sm:w-80 rounded-2xl border ui-border-strong shadow-2xl z-50 max-h-96 overflow-hidden"
            >
              <div class="p-3 sm:p-4 border-b ui-border-strong ui-surface-muted">
                <h3 class="text-sm sm:text-base font-semibold ui-text flex items-center gap-2">
                  <Icon
                    icon="list"
                    class="w-4 h-4 ui-primary"
                  />
                  {{ resolvedSwitcherTitle }}
                </h3>
                <p class="text-xs ui-text mt-1">
                  {{ resolvedSwitcherDescription }}
                </p>
              </div>
              <div class="py-2 max-h-80 overflow-y-auto">
                <button
                  v-for="company in normalizedCompanies"
                  :key="company.__id || company.__name"
                  :class="cn(
                    'flex items-center w-full px-3 sm:px-4 py-2.5 text-sm transition-all group',
                    company.__id === normalizedCurrentCompany?.__id
                      ? 'bg-[color:color-mix(in oklab, var(--ui-primary-soft), transparent 30%)] ui-primary border-l-4 border-(--ui-primary)'
                      : 'ui-text hover:bg-(--ui-surface-muted) border-l-4 border-transparent'
                  )"
                  @click="handleCompanyChange(company)"
                >
                  <div
                    v-if="getCompanyLogoUrl(company)"
                    class="shrink-0 mr-2 sm:mr-3"
                  >
                    <img
                      :src="getCompanyLogoUrl(company)"
                      :alt="`${company.__name} ${entityLabelLower} logo`"
                      class="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-lg ui-surface p-0.5 sm:p-1 border ui-border-strong group-hover:border-(--ui-primary-soft) transition-colors"
                    >
                  </div>
                  <div
                    v-else
                    class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-linear-to-br from-(--ui-bg) to-(--ui-bg) flex items-center justify-center mr-2 sm:mr-3 shrink-0"
                  >
                    <Icon
                      icon="building"
                      class="w-3.5 h-3.5 sm:w-4 sm:h-4 ui-text"
                    />
                  </div>
                  <div class="flex-1 text-left min-w-0">
                    <p class="font-semibold truncate text-md">
                      {{ company.__name }}
                    </p>
                    <p
                      v-if="company.__typeName"
                      class="text-xs ui-text truncate"
                    >
                      {{ company.__typeName }}
                    </p>
                  </div>
                  <Icon
                    v-if="company.__id === normalizedCurrentCompany?.__id"
                    icon="check-circle"
                    class="w-4 h-4 sm:w-5 sm:h-5 ui-primary shrink-0 ml-2"
                  />
                </button>
              </div>
            </div>
          </transition>
        </div>

        <!-- Breadcrumb - Hidden on mobile -->
        <nav
          v-if="showBreadcrumb"
          class="hidden lg:flex items-center gap-2 text-sm truncate"
        >
          <span class="ui-text-muted truncate">{{ currentSection }}</span>
          <Icon
            icon="chevron-right"
            class="w-3.5 h-3.5 ui-text-soft shrink-0"
          />
          <span class="ui-text font-semibold truncate">{{ currentPage }}</span>
        </nav>
      </div>

      <!-- Right side - Actions -->
      <div class="flex items-center gap-1 sm:gap-2 md:gap-3 pl-2">
        <!-- Search - Mobile optimized -->
        <div
          v-if="showSearch && (!isMobile || showMobileSearch)"
          class="relative"
        >
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon
              icon="search"
              class="w-4 h-4 ui-text-soft"
            />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="searchPlaceholder"
            class="w-40 sm:w-52 md:w-64 rounded-xl border ui-border-strong ui-surface pl-9 sm:pl-10 pr-9 sm:pr-4 py-2 text-sm ui-text focus:ring-2 focus:ring-(--ui-primary) focus:border-(--ui-primary) outline-none transition-all"
          >
          <button
            v-if="isMobile"
            class="absolute right-2 top-1/2 -translate-y-1/2 ui-text hover:text-(--ui-text) p-1"
            @click="showMobileSearch = false"
          >
            <Icon
              icon="times"
              class="w-4 h-4"
            />
          </button>
        </div>
        <button
          v-else-if="showSearch && isMobile"
          class="p-2 ui-text rounded-xl hover:bg-(--ui-surface-muted) transition-colors"
          @click="showMobileSearch = true"
        >
          <Icon
            icon="search"
            class="w-5 h-5"
          />
        </button>

        <!-- Notifications -->
        <button
          v-if="showNotifications"
          class="relative p-2 ui-text rounded-xl hover:bg-(--ui-surface-muted) transition-colors"
          @click="toggleNotifications"
        >
          <Icon
            icon="bell"
            class="w-5 h-5"
          />
          <span
            v-if="notificationCount > 0"
            class="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 min-w-4 h-4 sm:min-w-[18px] sm:h-[18px] ui-danger-bg ui-text-inverse text-[10px] sm:text-xs rounded-full flex items-center justify-center font-semibold px-0.5 sm:px-1"
          >
            {{ notificationCount > 9 ? '9+' : notificationCount }}
          </span>
        </button>

        <!-- Notifications Dropdown - Mobile optimized -->
        <transition
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-300 ease-in"
          enter-from-class="opacity-0 translate-y-2 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-from-class="opacity-100 translate-y-0 scale-100"
          leave-to-class="opacity-0 translate-y-2 scale-95"
        >
          <div
            v-if="showNotificationsDropdown"
            class="ui-surface absolute right-2 sm:right-4 md:right-6 top-14 sm:top-16 mt-2 w-[calc(100vw-1rem)] max-w-sm sm:w-80 md:w-96 rounded-2xl border ui-border-strong shadow-2xl z-9999 overflow-hidden"
          >
            <div class="p-3 sm:p-4 border-b ui-border-strong ui-surface-muted">
              <h3 class="text-sm sm:text-base font-semibold ui-text">
                {{ notificationsTitle }}
              </h3>
              <p
                v-if="notificationCount > 0"
                class="text-xs ui-text mt-1"
              >
                You have {{ notificationCount }} unread notification{{ notificationCount > 1 ? 's' : '' }}
              </p>
            </div>

            <div class="max-h-[60vh] sm:max-h-96 overflow-y-auto">
              <div
                v-if="notifications.length === 0"
                class="p-6 sm:p-8 text-center"
              >
                <Icon
                  icon="bell"
                  class="w-10 h-10 sm:w-12 sm:h-12 mx-auto ui-text mb-2"
                />
                <p class="text-md ui-text">
                  No notifications
                </p>
              </div>

              <div
                v-for="notification in notifications"
                v-else
                :key="notification.id"
                :class="[
                  'p-3 sm:p-4 border-b ui-border-strong hover:bg-(--ui-surface-muted) cursor-pointer transition-colors',
                  notification.read ? 'opacity-60' : ''
                ]"
                @click="handleNotificationClick(notification)"
              >
                <div class="flex items-start space-x-2 sm:space-x-3">
                  <!-- Notification Type Icon -->
                  <div
                    :class="[
                      'shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center',
                      getNotificationTypeClass(notification)
                    ]"
                  >
                    <Icon
                      v-if="notification.title.includes('Overdue')"
                      icon="exclamation-triangle"
                      class="w-4 h-4 sm:w-5 sm:h-5"
                    />
                    <Icon
                      v-else-if="notification.type === 'due_date_reminder'"
                      icon="clock"
                      class="w-4 h-4 sm:w-5 sm:h-5"
                    />
                    <Icon
                      v-else
                      icon="bell"
                      class="w-4 h-4 sm:w-5 sm:h-5"
                    />
                  </div>

                  <div class="flex-1 min-w-0">
                    <!-- Notification Title -->
                    <div class="flex items-start justify-between gap-2">
                      <p class="text-xs sm:text-md font-semibold ui-text flex-1 leading-tight">
                        {{ notification.title }}
                      </p>
                      <!-- Unread indicator -->
                      <div
                        v-if="!notification.read"
                        class="shrink-0 w-2 h-2 mt-1 ui-primary-bg rounded-full"
                      />
                    </div>

                    <div
                      v-if="notification.source"
                      class="flex items-center gap-1 sm:gap-1.5 mt-1.5 flex-wrap"
                    >
                      <span
                        class="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold ui-accent-soft ui-accent border border-(--ui-accent-soft)"
                      >
                        <Icon
                          icon="tag"
                          class="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1"
                        />
                        {{ notification.source.body_code }}
                      </span>
                      <Icon
                        icon="chevron-right"
                        class="w-2.5 h-2.5 sm:w-3 sm:h-3 ui-text hidden xs:block"
                      />
                      <span
                        class="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium ui-surface-muted ui-text border ui-border-strong"
                      >
                        {{ notification.source.code }}
                      </span>
                    </div>

                    <!-- Model & Due Date Badges -->
                    <div class="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 flex-wrap">
                      <span
                        v-if="notification.model"
                        class="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium ui-primary-soft ui-primary"
                      >
                        <Icon
                          icon="file"
                          class="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1"
                        />
                        <span class="truncate max-w-[100px] sm:max-w-none">{{ formatModelName(notification.model)
                        }}</span>
                      </span>

                      <!-- Due Date Badge -->
                      <span
                        v-if="notification.due_date"
                        :class="[
                          'inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium whitespace-nowrap',
                          notification.title.includes('Overdue')
                            ? 'ui-danger-soft ui-danger border border-(--ui-danger-soft)'
                            : notification.title.includes('Due in 0')
                              ? 'ui-warning-soft ui-warning border border-(--ui-warning-soft)'
                              : 'ui-warning-soft ui-warning border border-(--ui-warning-soft)'
                        ]"
                      >
                        <Icon
                          icon="calendar"
                          class="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 shrink-0"
                        />
                        {{ formatDueDate(notification.due_date) }}
                      </span>
                    </div>

                    <!-- Time -->
                    <p class="text-[10px] sm:text-xs ui-text mt-1.5 sm:mt-2 flex items-center">
                      <Icon
                        icon="clock"
                        class="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1"
                      />
                      {{ notification.time }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="notifications.length > 0"
              class="p-2 sm:p-3 text-center border-t ui-border-strong ui-surface-muted"
            >
              <button
                class="text-sm font-semibold ui-primary hover:text-(--ui-primary-strong) transition-colors"
                @click="handleViewAllNotifications"
              >
                View all notifications →
              </button>
            </div>
          </div>
        </transition>

        <!-- Settings Dropdown -->
        <div
          v-if="showSettings && settingsMenuItems.length > 0"
          class="relative"
        >
          <button
            class="relative p-2 ui-text rounded-xl hover:bg-(--ui-surface-muted) transition-colors"
            @click="toggleSettingsDropdown"
          >
            <Icon
              icon="cog"
              class="w-5 h-5"
            />
            <span
              v-if="resolvedSettingsBadge > 0"
              class="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 min-w-4 h-4 sm:min-w-[18px] sm:h-[18px] bg-amber-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center font-semibold px-0.5 sm:px-1"
            >
              {{ resolvedSettingsBadge > 99 ? '99+' : resolvedSettingsBadge }}
            </span>
          </button>

          <transition
            enter-active-class="transition-all duration-200 ease-out"
            leave-active-class="transition-all duration-200 ease-in"
            enter-from-class="opacity-0 translate-y-2 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 translate-y-2 scale-95"
          >
            <div
              v-if="showSettingsDropdown"
              class="ui-surface absolute right-0 mt-2 w-64 rounded-xl border ui-border-strong shadow-xl z-50 overflow-hidden"
            >
              <div class="px-4 py-3 border-b ui-border-strong ui-surface-muted">
                <p class="text-sm font-semibold ui-text">
                  {{ settingsTitle }}
                </p>
              </div>

              <div class="py-2">
                <template
                  v-for="item in settingsMenuItems"
                  :key="item.name || item.label"
                >
                  <div
                    v-if="item.type === 'section'"
                    class="px-4 py-1 text-[11px] font-semibold uppercase tracking-wider ui-text-muted"
                  >
                    {{ item.label }}
                  </div>

                  <router-link
                    v-else-if="item.route"
                    :to="item.route"
                    :class="cn(
                      'mx-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      isItemActive(item)
                        ? 'bg-[color:color-mix(in oklab, var(--ui-primary-soft), transparent 22%)] ui-primary'
                        : 'ui-text hover:bg-(--ui-surface-muted)'
                    )"
                    @click="handleNavigation(item)"
                  >
                    <Icon
                      :icon="item.icon || 'cog'"
                      class="w-4 h-4 shrink-0"
                    />
                    <span class="truncate">{{ item.label }}</span>
                  </router-link>

                  <button
                    v-else
                    class="mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ui-text hover:bg-(--ui-surface-muted) transition-colors"
                    @click="handleSettingsAction(item)"
                  >
                    <Icon
                      :icon="item.icon || 'cog'"
                      class="w-4 h-4 shrink-0"
                    />
                    <span class="truncate">{{ item.label }}</span>
                  </button>
                </template>
              </div>
            </div>
          </transition>
        </div>

        <!-- Profile Dropdown -->
        <div class="relative">
          <button
            class="shrink-0 ui-surface border ui-border-strong px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl shadow-sm flex items-center gap-2 sm:gap-3 relative hover:bg-(--ui-surface-muted) transition-colors max-w-44 sm:max-w-md"
            @click="toggleProfile"
          >
            <div
              class="w-7 h-7 sm:w-8 sm:h-8 bg-linear-to-br from-(--ui-primary-soft) to-(--ui-accent-soft) rounded-full flex items-center justify-center transition-colors shadow-sm"
            >
              <span class="ui-primary text-xs sm:text-sm font-semibold">{{ userInitials }}</span>
            </div>
            <!-- Hide details on mobile or when showUserDetails is false -->
            <div
              v-if="showUserDetails"
              class="hidden md:block text-left max-w-40 min-w-0"
            >
              <p class="text-sm font-bold ui-text truncate leading-tight">
                {{ user.name }}
              </p>
              <p class="text-sm ui-primary font-bold truncate leading-tight">
                {{ userRoleNames }}
              </p>
            </div>
            <Icon
              icon="chevron-down"
              class="w-3.5 h-3.5 ui-text-soft mt-0.5"
            />
          </button>

          <!-- Dropdown - Mobile optimized -->
          <transition
            enter-active-class="transition-all duration-200 ease-out"
            leave-active-class="transition-all duration-200 ease-in"
            enter-from-class="opacity-0 translate-y-2 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 translate-y-2 scale-95"
          >
            <div
              v-if="showProfile"
              class="ui-surface absolute right-0 mt-2 w-56 sm:w-60 rounded-xl border ui-border-strong shadow-xl z-50 overflow-hidden"
            >
              <div class="p-3 sm:p-4 border-b ui-border-strong">
                <p class="text-sm font-semibold ui-text truncate">
                  {{ user.name }}
                </p>
                <p class="text-xs ui-text truncate">
                  {{ user.email }}
                </p>
              </div>
              <div class="py-2">
                <template
                  v-for="item in profileMenuItems"
                  :key="item.name"
                >
                  <router-link
                    v-if="item.route"
                    :to="item.route"
                    :class="cn(
                      'flex items-center px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative',
                      isItemActive(item)
                        ? 'bg-linear-to-br from-(--ui-primary-soft) to-(--ui-primary-soft) ui-primary shadow-sm border border-(--ui-primary-soft)'
                        : 'ui-text hover:bg-(--ui-surface-muted) hover:text-(--ui-text) border border-transparent'
                    )"
                    @click="handleNavigation(item)"
                  >
                    <!-- Active indicator bar -->
                    <div
                      v-if="isItemActive(item)"
                      class="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 sm:h-8 bg-linear-to-b from-(--ui-primary) to-(--ui-primary) rounded-r-full"
                    />
                    <div
                      :class="cn(
                        'flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg mr-2 sm:mr-3 shrink-0 transition-colors ml-1 sm:ml-2',
                        isItemActive(item)
                          ? 'bg-linear-to-br from-(--ui-primary) to-(--ui-primary) ui-text shadow-md'
                          : 'ui-surface-muted ui-text group-hover:bg-(--ui-bg)'
                      )"
                    >
                      <Icon
                        v-if="item.icon"
                        :icon="item.icon"
                        class="w-3.5 h-3.5 sm:w-4 sm:h-4"
                      />
                    </div>
                    <span
                      :class="cn(
                        'flex-1 truncate font-semibold text-xs sm:text-md',
                        isItemActive(item) ? 'ui-primary' : 'ui-text'
                      )"
                    >
                      {{ item.label }}
                    </span>
                  </router-link>
                  <button
                    v-else
                    class="flex items-center w-full px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ui-text hover:bg-(--ui-surface-muted) hover:text-(--ui-text) border border-transparent"
                    @click="handleProfileAction(item)"
                  >
                    <div
                      class="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg mr-2 sm:mr-3 shrink-0 transition-colors ml-1 sm:ml-2 ui-surface-muted ui-text group-hover:bg-(--ui-bg)"
                    >
                      <Icon
                        v-if="item.icon"
                        :icon="item.icon"
                        class="w-3.5 h-3.5 sm:w-4 sm:h-4"
                      />
                    </div>
                    <span class="flex-1 truncate font-semibold ui-text text-xs sm:text-md">
                      {{ item.label }}
                    </span>
                  </button>
                </template>
              </div>
              <div class="border-t ui-border-strong py-2">
                <button
                  class="flex items-center w-full px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ui-danger hover:bg-(--ui-danger-soft) border border-transparent"
                  @click="handleLogout"
                >
                  <div
                    class="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg mr-1 sm:mr-1 shrink-0 transition-colors ml-1 sm:ml-2 ui-danger-soft ui-danger group-hover:bg-(--ui-danger-soft)"
                  >
                    <Icon
                      icon="sign-out-alt"
                      class="w-3.5 h-3.5 sm:w-4 sm:h-4"
                    />
                  </div>
                  <span class="truncate font-semibold ui-danger text-xs sm:text-md">
                    Sign out
                  </span>
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </header>
</template>
