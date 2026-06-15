import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DataTable from '../components/DataTable.vue'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status' },
  { key: 'age', label: 'Age' },
  { key: 'created_at', label: 'Created At' },
]

const data = [
  { id: 1, name: 'Alice', status: 'active', age: 30, created_at: '2026-06-10' },
  { id: 2, name: 'Bob', status: 'inactive', age: 22, created_at: '2026-06-12' },
  { id: 3, name: 'Carol', status: 'active', age: 41, created_at: '2026-06-01' },
]

const mountTable = (filterRules) => mount(DataTable, {
  props: {
    data,
    columns,
    filterRules,
    showPagination: false,
  },
  global: {
    stubs: {
      'font-awesome-icon': true,
      DataTableHeader: true,
      DataTablePagination: true,
      Loader: true,
      Checkbox: true,
      Button: true,
      Tooltip: true,
      Modal: true,
      Icon: true,
      DataTableRow: {
        props: ['item'],
        template: '<tr class="stub-row"><td>{{ item.name }}</td></tr>',
      },
    },
  },
})

describe('DataTable', () => {
  it('filters rows using equality rules from the built-in drawer model', () => {
    const wrapper = mountTable({
      logic: 'all',
      rules: [
        { field: 'status', label: 'Status', operator: 'equals', value: 'active' },
      ],
    })

    const rows = wrapper.findAll('.stub-row')
    expect(rows).toHaveLength(2)
    expect(rows[0].text()).toContain('Alice')
    expect(rows[1].text()).toContain('Carol')
  })

  it('supports backward-compatible range and multi-value rule shapes', () => {
    const wrapper = mountTable({
      logic: 'all',
      rules: [
        { key: 'age', label: 'Age', operator: 'between', min: 25, max: 35 },
        { column: 'status', label: 'Status', operator: 'in', selected: ['active'] },
      ],
    })

    const rows = wrapper.findAll('.stub-row')
    expect(rows).toHaveLength(1)
    expect(rows[0].text()).toContain('Alice')
  })
})
