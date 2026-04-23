<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import Icon from '../components/Icon.vue'
import Card from '../components/Card.vue'
import LineChart from '../components/charts/LineChart.vue'
import BarChart from '../components/charts/BarChart.vue'
import StackedBarChart from '../components/charts/StackedBarChart.vue'

// Layout reference
const layoutRef = ref(null)

// Inject layout context (if needed for nested components)
const layoutContext = inject('dashboardLayout', null)

const companySwitcherDemoData = [
  {
    company_id: 201,
    company_name: 'Savannah Holdings',
    company_role: 'Primary'
  },
  {
    company_id: 202,
    company_name: 'Rift Valley Energy',
    company_role: 'Subsidiary'
  },
  {
    company_id: 203,
    company_name: 'Coastal Trade Group',
    company_role: 'Partner'
  }
]

// Demo data
const stats = ref([
  {
    label: 'Total Users',
    value: '2,847',
    change: 12,
    trend: 'up',
    icon: 'users',
    bgColor: 'ui-primary-soft',
    iconColor: 'ui-primary'
  },
  {
    label: 'Revenue',
    value: '$45,231',
    change: 8,
    trend: 'up',
    icon: 'dollar-sign',
    bgColor: 'ui-success-soft',
    iconColor: 'ui-success'
  },
  {
    label: 'Orders',
    value: '1,423',
    change: 3,
    trend: 'down',
    icon: 'shopping-bag',
    bgColor: 'ui-warning-soft',
    iconColor: 'ui-warning'
  },
  {
    label: 'Conversion Rate',
    value: '3.24%',
    change: 15,
    trend: 'up',
    icon: 'percent',
    bgColor: 'ui-accent-soft',
    iconColor: 'ui-accent'
  }
])

const recentActivities = ref([
  {
    id: 1,
    user: { name: 'Alice Johnson', email: 'alice@example.com', initials: 'AJ' },
    action: 'Created new project',
    status: 'Completed',
    time: '2 minutes ago'
  },
  {
    id: 2,
    user: { name: 'Bob Smith', email: 'bob@example.com', initials: 'BS' },
    action: 'Updated user profile',
    status: 'In Progress',
    time: '15 minutes ago'
  },
  {
    id: 3,
    user: { name: 'Carol Davis', email: 'carol@example.com', initials: 'CD' },
    action: 'Deleted old files',
    status: 'Failed',
    time: '1 hour ago'
  },
  {
    id: 4,
    user: { name: 'David Wilson', email: 'david@example.com', initials: 'DW' },
    action: 'Exported data report',
    status: 'Completed',
    time: '2 hours ago'
  }
])

const revenueLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
const revenueData = [18, 24, 21, 29, 35, 42, 39, 47]

const userActivityLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const userActivityData = [120, 145, 132, 168, 176, 154, 162]
const riskStatusLabels = ['Risk']
const riskStatusData = [
  {
    open: 78,
    inProgress: 0,
    mitigated: 0
  }
]

// Computed properties to track layout state
const sidebarCollapsed = computed(() => layoutRef.value?.sidebarCollapsed || false)
const sidebarWidth = computed(() => layoutRef.value?.sidebarWidth || 256)
const currentSection = computed(() => layoutContext?.currentSection?.value || 'Dashboard')
const currentPage = computed(() => layoutContext?.currentPage?.value || 'Demo')

// Methods
const toggleSidebar = () => {
  if (layoutRef.value) {
    layoutRef.value.toggleSidebar()
  }
}

const refreshData = () => {
  // Simulate data refresh
  console.log('Refreshing data...')
  // You would typically make API calls here
}


const getStatusColor = (status) => {
  const colors = {
    'Completed': 'ui-success-soft ui-success',
    'In Progress': 'ui-warning-soft ui-warning',
    'Failed': 'ui-danger-soft ui-danger',
    'Pending': 'ui-surface-muted ui-text'
  }
  return colors[status] || 'ui-surface-muted ui-text'
}

onMounted(() => {
  if (typeof layoutContext?.setCompanySwitcherDemoData === 'function') {
    layoutContext.setCompanySwitcherDemoData({
      companies: companySwitcherDemoData,
      currentCompany: companySwitcherDemoData[0]
    })
  }
})
</script>

<template>
  <!-- <DashboardLayout
    ref="layoutRef"
    :user="user"
    initial-section="Dashboard"
    initial-page="Demo"
    @navigate="handleNavigation"
    @search="handleSearch"
    @profile-action="handleProfileAction"
    @logout="handleLogout"
    @sidebar-toggle="handleSidebarToggle"
  > -->
  <!-- Demo Content -->
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold ui-text">
          Dashboard Demo
        </h1>
        <p class="ui-text mt-1">
          Welcome to the Vue UI Dashboard demo page
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <button
          class="px-4 py-2 ui-primary-bg ui-text rounded-lg hover:bg-(--ui-primary-strong) transition-colors"
          @click="toggleSidebar"
        >
          {{ sidebarCollapsed ? 'Expand' : 'Collapse' }} Sidebar
        </button>
        <button
          class="px-4 py-2 ui-surface-muted ui-text rounded-lg hover:bg-(--ui-bg) transition-colors"
          @click="refreshData"
        >
          Refresh Data
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card
        v-for="stat in stats"
        :key="stat.label"
        variant="elevated"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium ui-text">
              {{ stat.label }}
            </p>
            <p class="text-2xl font-bold ui-text mt-1">
              {{ stat.value }}
            </p>
          </div>
          <div :class="`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bgColor}`">
            <Icon
              :icon="stat.icon"
              :class="`w-6 h-6 ${stat.iconColor}`"
            />
          </div>
        </div>
        <div class="flex items-center mt-4">
          <span :class="`text-sm font-medium ${stat.trend === 'up' ? 'ui-success' : 'ui-danger'}`">
            {{ stat.trend === 'up' ? '+' : '-' }}{{ stat.change }}%
          </span>
          <span class="text-sm ui-text ml-2">from last month</span>
        </div>
      </Card>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Chart 1 -->
      <Card variant="elevated">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold ui-text">
            Revenue Overview
          </h3>
          <select class="text-sm border ui-border-strong rounded-lg px-3 py-2">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
        <div class="h-64 ui-surface-muted rounded-lg flex items-center justify-center">
          <LineChart
            :data="revenueData"
            :labels="revenueLabels"
            :width="560"
            :height="260"
            line-color="var(--ui-primary)"
            value-suffix="%"
            x-axis-label="Month"
            y-axis-label="Revenue Growth %"
          />
        </div>
      </Card>

      <!-- Chart 2 -->
      <Card variant="elevated">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold ui-text">
            User Activity
          </h3>
          <div class="flex items-center space-x-2">
            <span class="inline-flex items-center w-3 h-3 ui-primary-bg rounded-full" />
            <span class="text-sm ui-text">Active Users</span>
          </div>
        </div>
        <div class="h-64 ui-surface-muted rounded-lg flex items-center justify-center">
          <BarChart
            :data="userActivityData"
            :labels="userActivityLabels"
            :width="560"
            :height="260"
            :colors="['#22c55e', '#34d399', '#4ade80', '#86efac', '#16a34a', '#15803d', '#166534']"
            series-label="Active Users"
            value-suffix=""
            x-axis-label="Day"
            y-axis-label="Users"
          />
        </div>
      </Card>
    </div>

    <!-- Zero value demonstration -->
    <Card variant="elevated">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold ui-text">
          Risk Status (0% Visibility Demo)
        </h3>
        <span class="text-sm ui-text">Only one status has value</span>
      </div>
      <div class="h-64 ui-surface-muted rounded-lg flex items-center justify-center p-2">
        <StackedBarChart
          :data="riskStatusData"
          :labels="riskStatusLabels"
          :width="560"
          :height="260"
          :colors="['#ef4444', '#f59e0b', '#22c55e']"
          :group-keys="['open', 'inProgress', 'mitigated']"
          :legend-labels="['Open', 'In Progress', 'Mitigated']"
          :max-value="100"
          value-suffix="%"
          y-axis-label="Percentage (%)"
        />
      </div>
    </Card>

    <!-- Recent Activity Table -->
    <Card variant="elevated">
      <div class="p-6 border-b ui-border-strong">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold ui-text">
            Recent Activity
          </h3>
          <button class="text-sm ui-primary hover:text-(--ui-primary)">
            View all
          </button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="ui-surface-muted">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium ui-text uppercase tracking-wider">
                User
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium ui-text uppercase tracking-wider">
                Action
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium ui-text uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium ui-text uppercase tracking-wider">
                Time
              </th>
            </tr>
          </thead>
          <tbody class="ui-surface divide-y divide-gray-200">
            <tr
              v-for="activity in recentActivities"
              :key="activity.id"
              class="hover:bg-(--ui-surface)"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-8 h-8 ui-bg rounded-full flex items-center justify-center">
                    <span class="text-xs font-medium ui-text">{{ activity.user.initials }}</span>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium ui-text">
                      {{ activity.user.name }}
                    </div>
                    <div class="text-sm ui-text">
                      {{ activity.user.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm ui-text">
                  {{ activity.action }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(activity.status)}`">
                  {{ activity.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm ui-text">
                {{ activity.time }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- Debug Info -->
    <Card variant="filled">
      <h4 class="font-medium ui-text mb-2">
        Layout Debug Info
      </h4>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="font-medium">Sidebar Collapsed:</span> {{ sidebarCollapsed }}
        </div>
        <div>
          <span class="font-medium">Sidebar Width:</span> {{ sidebarWidth }}px
        </div>
        <div>
          <span class="font-medium">Current Section:</span> {{ currentSection }}
        </div>
        <div>
          <span class="font-medium">Current Page:</span> {{ currentPage }}
        </div>
      </div>
    </Card>
  </div>
  <!-- </DashboardLayout> -->
</template>
