<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Sidebar from '../components/Sidebar.vue'
import Header from '../components/Header.vue'

const router = useRouter()
const route = useRoute()

// Props
const props = defineProps({
  user: {
    type: Object,
    default: () => ({
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Administrator'
    })
  },
  initialSection: {
    type: String,
    default: 'Dashboard'
  },
  initialPage: {
    type: String,
    default: 'Overview'
  }
})

// State
const sidebarRef = ref(null)
const currentSection = ref(props.initialSection)
const currentPage = ref(props.initialPage)
const currentRoute = ref(route.path)
const mobileOpen = ref(false)

// Management settings items
const managementSettingsItems = [
  {
    name: 'system-settings',
    label: 'System Settings',
    route: '/management/system-settings',
    icon: 'cog'
  },
  {
    name: 'user-management',
    label: 'User Management',
    route: '/management/user-management',
    icon: 'users'
  },
  {
    name: 'permissions',
    label: 'Permissions',
    route: '/management/permissions',
    icon: 'shield'
  },
  {
    name: 'audit-logs',
    label: 'Audit Logs',
    route: '/management/audit-logs',
    icon: 'clipboard-list'
  },
  {
    name: 'backup',
    label: 'Backup & Restore',
    route: '/management/backup',
    icon: 'database'
  }
]

// Emits
const emit = defineEmits([
  'navigate',
  'search',
  'profile-action',
  'logout',
  'organisation-change'
])

const profileMenuItems = [
  {
    name: 'profile',
    label: 'Profile',
    route: 'profile',
    icon: 'user'
  },
  {
    name: 'settings',
    label: 'Settings',
    route: 'settings',
    icon: 'cog'
  },
]

// Navigation items configuration
const navigationItems = [
  {
    type: 'section',
    label: 'Dashboard'
  },
  {
    type: 'link',
    name: 'dashboard',
    label: 'Dashboard',
    route: '/dashboard',
    icon: 'home'
  },
  {
    type: 'link',
    name: 'analytics',
    label: 'Analytics',
    route: '/analytics',
    icon: 'user',
    badge: '2'
  },
  {
    type: 'section',
    label: 'Management'
  },
  {
    type: 'link',
    name: 'users',
    label: 'User Management',
    icon: 'users',
    subItems: [
      {
        name: 'all-users',
        label: 'All Users',
        route: '/users',
        icon: 'user'
      },
      {
        name: 'roles',
        label: 'Roles & Permissions',
        route: '/users/roles',
        icon: 'shield'
      },
      {
        name: 'activity',
        label: 'User Activity',
        route: '/users/activity',
        icon: 'activity'
      }
    ]
  },
  {
    type: 'link',
    name: 'roles',
    label: 'Roles & Permissions',
    route: '/roles',
    icon: 'cogs'
  },
]

// Computed
const sidebarWidth = computed(() => 130)

const isManagementSettingsActive = computed(() => {
  return route.path.startsWith('/management')
})

// Methods
const handleMobileSidebarToggle = () => {
  mobileOpen.value = !mobileOpen.value
}

const handleMobileToggle = (value) => {
  mobileOpen.value = value
}

const handleNavigation = (item) => {
  if (item.route) {
    router.push(item.route)
  }
  emit('navigate', item)
}

const updateBreadcrumbFromRoute = (routePath) => {
  const sectionMap = {
    '/dashboard': { section: 'Dashboard', page: 'Overview' },
    '/analytics': { section: 'Dashboard', page: 'Analytics' },
    '/users': { section: 'Management', page: 'Users' },
    '/roles': { section: 'Management', page: 'Roles & Permissions' },
    '/management': { section: 'Management', page: 'Settings' },
    '/management/system-settings': { section: 'Management', page: 'System Settings' },
    '/management/user-management': { section: 'Management', page: 'User Management' },
    '/management/permissions': { section: 'Management', page: 'Permissions' },
    '/management/audit-logs': { section: 'Management', page: 'Audit Logs' },
    '/management/backup': { section: 'Management', page: 'Backup & Restore' }
  }

  const breadcrumb = sectionMap[routePath] || { section: 'Dashboard', page: 'Overview' }
  currentSection.value = breadcrumb.section
  currentPage.value = breadcrumb.page
}

const handleSearch = (query) => {
  emit('search', query)
}

const handleProfileAction = (action) => {
  emit('profile-action', action)
}

const handleLogout = () => {
  emit('logout')
}

const handleOrganisationChange = (organisation) => {
  emit('organisation-change', organisation)
}

// Watch for route changes
watch(() => route.path, (newPath) => {
  currentRoute.value = newPath
  updateBreadcrumbFromRoute(newPath)
}, { immediate: true })

// Expose methods for parent components
defineExpose({
  navigate: handleNavigation,
  updateCurrentPage: (section, page) => {
    currentSection.value = section
    currentPage.value = page
  }
})
</script>

<template>
  <div class="min-h-screen ui-surface-muted">
    <!-- Sidebar -->
    <Sidebar
      ref="sidebarRef"
      :sidebar-width="sidebarWidth"
      :header="{ title: 'Risk & Compliance' }"
      :navigation-items="navigationItems"
      :management-settings="managementSettingsItems"
      :show-management-settings="true"
      :mobile-open="mobileOpen"
      :is-management-settings-active="isManagementSettingsActive"
      :current-path="currentRoute"
      @navigate="handleNavigation"
      @update:mobile-open="handleMobileToggle"
    />

    <!-- Header -->
    <Header
      :sidebar-width="sidebarWidth"
      :current-section="currentSection"
      :current-page="currentPage"
      :current-route="currentRoute"
      :user="user"
      :notifications="[]"
      :profile-menu-items="profileMenuItems"
      :mobile-open="mobileOpen"
      :current-organisation="user?.currentOrganisation || user?.organisations?.[0]"
      :company-logo="user?.companyLogo || ''"
      :organisation-logo="user?.currentOrganisation?.logo || user?.organisations?.[0]?.logo || ''"
      :organisations="user?.organisations || []"
      :show-search="false"
      :settings-menu-items="managementSettingsItems"
      :settings-badge-count="managementSettingsItems.length"
      @search="handleSearch"
      @profile-action="handleProfileAction"
      @logout="handleLogout"
      @settings-action="handleProfileAction"
      @navigate="handleNavigation"
      @toggle-mobile-sidebar="handleMobileSidebarToggle"
      @organisation-change="handleOrganisationChange"
    />

    <!-- Main Content -->
    <main
      class="transition-all duration-300 ease-in-out pt-16 min-h-screen"
      :style="{ marginLeft: sidebarRef?.contentMarginLeft + 'px' }"
    >
      <div class="p-6">
        <router-view />
      </div>
    </main>
  </div>
</template>
