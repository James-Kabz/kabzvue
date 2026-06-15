import { defineComponent } from 'vue'
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DataTableFilters from '../components/DataTableFilters.vue'

const IconStub = defineComponent({
  props: ['icon'],
  template: '<span :data-icon="icon" />',
})

describe('DataTableFilters', () => {
  it('uses the legacy toolbar UI when legacy filter props are provided', async () => {
    const wrapper = mount(DataTableFilters, {
      props: {
        showSearch: true,
        searchQuery: 'alice',
        selectedStatus: 'active',
        statusOptions: [{ label: 'Active', value: 'active' }],
        showDateFilter: true,
        dateFrom: '2026-06-01',
        dateTo: '2026-06-10',
      },
      global: {
        stubs: {
          Icon: IconStub,
          Button: true,
          FileUpload: true,
          FilterDrawer: {
            props: ['open'],
            template: '<div data-testid="filter-drawer" :data-open="String(open)" />',
          },
          Select: {
            props: ['modelValue'],
            template: '<select><slot /></select>',
          },
        },
      },
    })

    expect(wrapper.find('input[type="date"]').exists()).toBe(false)

    await wrapper.findAll('button').find((button) => button.text().includes('Filter')).trigger('click')

    expect(wrapper.find('input[type="date"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="filter-drawer"]').attributes('data-open')).toBe('false')
  })

  it('uses the drawer UI by default for drilldown filters', () => {
    const wrapper = mount(DataTableFilters, {
      props: {
        selectFilters: [
          {
            key: 'status',
            label: 'Status',
            value: '',
            options: [{ label: 'Active', value: 'active' }],
          },
        ],
      },
      global: {
        stubs: {
          Icon: IconStub,
          Button: true,
          FileUpload: true,
          FilterDrawer: {
            props: ['open'],
            template: '<div data-testid="filter-drawer" :data-open="String(open)" />',
          },
          Select: true,
        },
      },
    })

    expect(wrapper.find('[data-testid="filter-drawer"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('All Status')
  })
})
