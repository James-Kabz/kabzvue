<script>
import {
  formatDateToISO,
  getTodayISO,
  getMonthCalendarDays,
  getWeekDays,
  getWeekBounds,
  formatEventDate,
  getTimeSlots,
  isSameDay,
  getMonthName,
  getYear
} from '../helpers/calendarHelper.js'

export default {
  name: 'EventsCalendar',
  props: {
    events: {
      type: Array,
      default: () => []
    },
    size: {
      type: String,
      default: 'default',
      validator: (value) => ['xs', 'compact', 'default', 'large', 'full'].includes(value)
    }
  },
  emits: ['select-date', 'select-event'],
  data() {
    return {
      currentDate: new Date(),
      selectedDate: null,
      viewMode: 'month',
      selectedEvent: null,
      weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      weekDaysShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      timeSlots: getTimeSlots(0, 23, 60),
      monthNames: ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December']
    }
  },
  computed: {
    sizePreset() {
      const presets = {
        xs: {
          rootTextClass: 'text-[11px]',
          toolbarPaddingClass: 'px-2.5 py-1.5',
          titleClass: 'text-xs min-w-[100px]',
          controlButtonClass: 'px-2 py-0.5 text-[10px]',
          iconButtonClass: 'w-5 h-5',
          viewButtonClass: 'px-2 py-0.5 text-[10px]',
          monthDayCellClass: 'min-h-[60px]',
          sidebarWidthClass: 'w-48'
        },
        compact: {
          rootTextClass: 'text-xs',
          toolbarPaddingClass: 'px-3 py-2',
          titleClass: 'text-sm min-w-[120px]',
          controlButtonClass: 'px-2 py-1 text-[11px]',
          iconButtonClass: 'w-6 h-6',
          viewButtonClass: 'px-2 py-0.5 text-[11px]',
          monthDayCellClass: 'min-h-[72px]',
          sidebarWidthClass: 'w-56'
        },
        default: {
          rootTextClass: 'text-sm',
          toolbarPaddingClass: 'px-4 py-2.5',
          titleClass: 'text-base min-w-[150px]',
          controlButtonClass: 'px-3 py-1.5 text-xs',
          iconButtonClass: 'w-7 h-7',
          viewButtonClass: 'px-3 py-1 text-xs',
          monthDayCellClass: 'min-h-[92px]',
          sidebarWidthClass: 'w-64'
        },
        large: {
          rootTextClass: 'text-base',
          toolbarPaddingClass: 'px-5 py-3',
          titleClass: 'text-lg min-w-[180px]',
          controlButtonClass: 'px-3.5 py-2 text-sm',
          iconButtonClass: 'w-8 h-8',
          viewButtonClass: 'px-3.5 py-1.5 text-sm',
          monthDayCellClass: 'min-h-[108px]',
          sidebarWidthClass: 'w-72'
        },
        full: {
          rootTextClass: 'text-base',
          toolbarPaddingClass: 'px-5 py-3',
          titleClass: 'text-lg min-w-[180px]',
          controlButtonClass: 'px-3.5 py-2 text-sm',
          iconButtonClass: 'w-8 h-8',
          viewButtonClass: 'px-3.5 py-1.5 text-sm',
          monthDayCellClass: 'min-h-[116px]',
          sidebarWidthClass: 'w-80'
        }
      }
      return presets[this.size] || presets.default
    },
    displayTitle() {
      if (this.viewMode === 'year') {
        return getYear(this.currentDate)
      } else if (this.viewMode === 'day') {
        return formatEventDate(this.currentDate, 'full')
      } else if (this.viewMode === 'week') {
        const { startDate, endDate } = getWeekBounds(this.currentDate)
        const startMonth = getMonthName(startDate, 'short')
        const endMonth = getMonthName(endDate, 'short')
        const year = getYear(this.currentDate)
        if (startDate.getMonth() === endDate.getMonth()) {
          return `${startMonth} ${startDate.getDate()} – ${endDate.getDate()}, ${year}`
        } else {
          return `${startMonth} ${startDate.getDate()} – ${endMonth} ${endDate.getDate()}, ${year}`
        }
      } else {
        return `${getMonthName(this.currentDate)} ${getYear(this.currentDate)}`
      }
    },
    calendarDays() {
      const days = getMonthCalendarDays(this.currentDate)
      return days.map(day => ({
        ...day,
        events: this.getEventsForDate(day.date)
      }))
    },
    weekViewDays() {
      const days = getWeekDays(this.currentDate)
      return days.map(dateObj => {
        const date = formatDateToISO(dateObj)
        return {
          dateObj,
          date,
          dayNumber: dateObj.getDate(),
          dayName: this.weekDays[dateObj.getDay()],
          isToday: isSameDay(dateObj, getTodayISO()),
          events: this.getEventsForDate(date)
        }
      })
    },
    dayViewDate() {
      const date = formatDateToISO(this.currentDate)
      return {
        dateObj: this.currentDate,
        date,
        dayNumber: this.currentDate.getDate(),
        dayName: this.weekDays[this.currentDate.getDay()],
        isToday: isSameDay(this.currentDate, getTodayISO()),
        events: this.getEventsForDate(date)
      }
    },
    yearViewMonths() {
      const year = this.currentDate.getFullYear()
      return this.monthNames.map((monthName, index) => {
        const monthDate = new Date(year, index, 1)
        const days = getMonthCalendarDays(monthDate)
        return {
          name: monthName,
          index,
          days: days.map(day => ({
            ...day,
            events: this.getEventsForDate(day.date)
          }))
        }
      })
    }
  },
  methods: {
    formatEventDate,
    getEventsForDate(date) {
      return this.events.filter(event => event.date === date)
    },
    previousPeriod() {
      if (this.viewMode === 'year') {
        this.currentDate = new Date(this.currentDate.getFullYear() - 1, 0, 1)
      } else if (this.viewMode === 'day') {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), this.currentDate.getDate() - 1)
      } else if (this.viewMode === 'week') {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), this.currentDate.getDate() - 7)
      } else {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1)
      }
    },
    nextPeriod() {
      if (this.viewMode === 'year') {
        this.currentDate = new Date(this.currentDate.getFullYear() + 1, 0, 1)
      } else if (this.viewMode === 'day') {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), this.currentDate.getDate() + 1)
      } else if (this.viewMode === 'week') {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), this.currentDate.getDate() + 7)
      } else {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1)
      }
    },
    goToToday() {
      this.currentDate = new Date()
      this.selectedDate = getTodayISO()
      this.$emit('select-date', { date: this.selectedDate, events: this.getEventsForDate(this.selectedDate) })
    },
    selectDay(day) {
      this.selectedDate = day.date
      const [year, month, dayNum] = day.date.split('-').map(Number)
      this.currentDate = new Date(year, month - 1, dayNum)
      this.$emit('select-date', { date: day.date, events: day.events })
    },
    selectEvent(event, day) {
      this.selectedEvent = event
      this.selectedDate = day.date
      const [year, month, dayNum] = day.date.split('-').map(Number)
      this.currentDate = new Date(year, month - 1, dayNum)
      this.$emit('select-event', event)
    },
    closeEvent() {
      this.selectedEvent = null
    },
    getEventColorClass(color) {
      const colorMap = {
        blue: 'bg-(--ui-primary-soft) text-(--ui-primary-strong) border-l-2 border-(--ui-primary)',
        red: 'bg-(--ui-danger-soft) text-(--ui-danger-strong) border-l-2 border-(--ui-danger)',
        green: 'bg-(--ui-success-soft) text-(--ui-success-strong) border-l-2 border-(--ui-success)',
        purple: 'bg-(--ui-accent-soft) text-(--ui-accent-strong) border-l-2 border-(--ui-accent)',
        orange: 'bg-(--ui-warning-soft) text-(--ui-warning-strong) border-l-2 border-(--ui-warning)',
      }
      return colorMap[color] || 'ui-surface-soft ui-text-muted border-l-2 border-(--ui-border-strong)'
    },
    getColorStripClass(color) {
      const colorMap = {
        blue: 'bg-(--ui-primary)',
        red: 'bg-(--ui-danger)',
        green: 'bg-(--ui-success)',
        purple: 'bg-(--ui-accent)',
        orange: 'bg-(--ui-warning)',
      }
      return colorMap[color] || 'bg-(--ui-border-strong)'
    },
    getEventsAtTime(events, timeSlot) {
      return events.filter(event => {
        if (!event.time) return false
        if (!/^\d{1,2}:\d{2}/.test(event.time)) return false
        const eventTime = event.time.split(':')[0].padStart(2, '0')
        return timeSlot.time.startsWith(eventTime)
      })
    },
    getAllDayEvents(events) {
      return events.filter(event => {
        if (!event.time) return true
        return !/^\d{1,2}:\d{2}/.test(event.time)
      })
    },
    selectMonthFromYear(monthIndex) {
      this.currentDate = new Date(this.currentDate.getFullYear(), monthIndex, 1)
      this.viewMode = 'month'
    }
  }
}
</script>

<template>
  <div :class="['flex flex-col h-full ui-surface border ui-border rounded-xl overflow-hidden shadow-sm', sizePreset.rootTextClass]">
    <!-- ── Toolbar ── -->
    <div :class="['flex items-center justify-between border-b ui-border ui-surface shrink-0', sizePreset.toolbarPaddingClass]">
      <div class="flex items-center gap-2">
        <button
          :class="['font-medium border ui-border-strong rounded-md ui-text hover:bg-(--ui-surface-muted) transition-colors', sizePreset.controlButtonClass]"
          @click="goToToday"
        >
          Today
        </button>
        <div class="flex">
          <button
            :class="['flex items-center justify-center rounded-md ui-text-muted hover:bg-(--ui-surface-soft) transition-colors', sizePreset.iconButtonClass]"
            @click="previousPeriod"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            :class="['flex items-center justify-center rounded-md ui-text-muted hover:bg-(--ui-surface-soft) transition-colors', sizePreset.iconButtonClass]"
            @click="nextPeriod"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        <h2 :class="['font-semibold ui-text', sizePreset.titleClass]">
          {{ displayTitle }}
        </h2>
      </div>

      <!-- View switcher — segmented pill -->
      <div class="flex gap-0.5 ui-surface-muted rounded-lg p-0.5">
        <button
          v-for="v in ['year', 'month', 'week', 'day']"
          :key="v"
          :class="[
            'font-medium rounded-md transition-colors capitalize',
            sizePreset.viewButtonClass,
            viewMode === v ? 'ui-surface ui-text shadow-sm' : 'ui-text-muted hover:text-(--ui-text)'
          ]"
          @click="viewMode = v"
        >
          {{ v }}
        </button>
      </div>
    </div>

    <!-- ── Body ── -->
    <div class="flex flex-1 overflow-hidden">
      <div class="flex flex-col flex-1 overflow-hidden min-w-0">
        <!-- ══ Year view ══ -->
        <div
          v-if="viewMode === 'year'"
          class="flex-1 overflow-y-auto p-4"
        >
          <div class="grid grid-cols-3 gap-4">
            <div
              v-for="month in yearViewMonths"
              :key="month.index"
              class="border ui-border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              @click="selectMonthFromYear(month.index)"
            >
              <div class="px-3 py-2 bg-(--ui-surface-muted) border-b ui-border">
                <h3 class="text-xs font-semibold ui-text">
                  {{ month.name }}
                </h3>
              </div>
              <div class="p-2 ui-surface">
                <div class="grid grid-cols-7 mb-1">
                  <span
                    v-for="d in weekDaysShort"
                    :key="d"
                    class="text-center text-[9px] font-semibold ui-text-soft uppercase"
                  >{{ d }}</span>
                </div>
                <div class="grid grid-cols-7 gap-px">
                  <div
                    v-for="(day, idx) in month.days"
                    :key="idx"
                    class="relative aspect-square flex items-center justify-center text-[10px] rounded-full"
                    :class="[
                      !day.isCurrentMonth ? 'ui-text-soft opacity-60' : 'ui-text-muted',
                      day.isToday ? 'bg-(--ui-primary) text-(--ui-text-inverse) font-semibold' : '',
                      day.events.length > 0 && day.isCurrentMonth && !day.isToday ? 'font-semibold ui-text' : ''
                    ]"
                  >
                    {{ day.dayNumber }}
                    <span
                      v-if="day.events.length > 0 && day.isCurrentMonth && !day.isToday"
                      class="absolute bottom-px left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-(--ui-primary)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ══ Month view ══ -->
        <template v-if="viewMode === 'month'">
          <div class="grid grid-cols-7 border-b ui-border shrink-0 ui-surface">
            <div
              v-for="day in weekDays"
              :key="day"
              class="py-2 text-center text-[11px] font-semibold ui-text-soft uppercase tracking-wider"
            >
              {{ day }}
            </div>
          </div>
          <div class="grid grid-cols-7 flex-1 overflow-y-auto border-l border-t ui-border">
            <div
              v-for="(day, index) in calendarDays"
              :key="index"
              :class="[
                'border-r border-b ui-border p-1.5 cursor-pointer transition-colors',
                sizePreset.monthDayCellClass,
                !day.isCurrentMonth ? 'bg-(--ui-surface-muted)' : 'ui-surface hover:bg-(--ui-surface-muted)',
                day.isToday ? 'bg-(--ui-primary-soft) hover:bg-(--ui-primary-soft)' : '',
                selectedDate === day.date ? 'ring-2 ring-inset ring-(--ui-primary)' : ''
              ]"
              @click="selectDay(day)"
            >
              <div
                class="w-6 h-6 flex items-center justify-center rounded-full text-xs mb-1"
                :class="[
                  day.isToday ? 'bg-(--ui-primary) text-(--ui-text-inverse) font-semibold' : '',
                  !day.isToday && day.isCurrentMonth ? 'ui-text' : 'ui-text-soft opacity-60'
                ]"
              >
                {{ day.dayNumber }}
              </div>
              <div class="flex flex-col gap-0.5">
                <div
                  v-for="(event, ei) in day.events.slice(0, 3)"
                  :key="ei"
                  class="text-[11px] px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-75 transition-opacity"
                  :class="getEventColorClass(event.color)"
                  @click.stop="selectEvent(event, day)"
                >
                  {{ event.title }}
                </div>
                <div
                  v-if="day.events.length > 3"
                  class="text-[10px] ui-text-soft pl-1"
                >
                  +{{ day.events.length - 3 }} more
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ══ Week view ══ -->
        <template v-if="viewMode === 'week'">
          <div
            class="grid border-b ui-border shrink-0 ui-surface"
            style="grid-template-columns: 52px repeat(7, 1fr)"
          >
            <div class="border-r ui-border" />
            <div
              v-for="day in weekViewDays"
              :key="day.date"
              class="py-2 text-center border-r ui-border last:border-r-0"
              :class="day.isToday ? 'bg-(--ui-primary-soft)' : ''"
            >
              <div class="text-[10px] font-semibold ui-text-soft uppercase tracking-wider">
                {{ day.dayName }}
              </div>
              <div
                class="mx-auto mt-1 w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium"
                :class="day.isToday ? 'bg-(--ui-primary) text-(--ui-text-inverse)' : 'ui-text'"
              >
                {{ day.dayNumber }}
              </div>
            </div>
          </div>

          <div
            class="grid border-b ui-border bg-(--ui-surface-muted) shrink-0"
            style="grid-template-columns: 52px repeat(7, 1fr)"
          >
            <div class="border-r ui-border px-1 py-1 text-[10px] ui-text-soft text-right flex items-center justify-end">
              All day
            </div>
            <div
              v-for="day in weekViewDays"
              :key="'ad-' + day.date"
              class="p-1 border-r ui-border last:border-r-0 flex flex-col gap-0.5 min-h-8"
            >
              <div
                v-for="event in getAllDayEvents(day.events)"
                :key="event.id"
                class="text-[11px] px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-75 transition-opacity"
                :class="getEventColorClass(event.color)"
                @click="selectEvent(event, day)"
              >
                {{ event.title }}
              </div>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto">
            <div
              class="grid"
              style="grid-template-columns: 52px repeat(7, 1fr)"
            >
              <template
                v-for="slot in timeSlots"
                :key="slot.time"
              >
                <div class="h-14 border-b border-r border-(--ui-border) px-1.5 pt-1 text-[10px] ui-text-soft text-right leading-none">
                  {{ slot.display }}
                </div>
                <div
                  v-for="day in weekViewDays"
                  :key="day.date + slot.time"
                  class="h-14 border-b border-r border-(--ui-border) last:border-r-0 p-0.5"
                  :class="day.isToday ? 'bg-(--ui-primary-soft)' : ''"
                >
                  <div
                    v-for="event in getEventsAtTime(day.events, slot)"
                    :key="event.id"
                    class="text-[11px] px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-75 transition-opacity"
                    :class="getEventColorClass(event.color)"
                    @click="selectEvent(event, day)"
                  >
                    <span class="font-semibold opacity-70 mr-1">{{ event.time }}</span>{{ event.title }}
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>

        <!-- ══ Day view ══ -->
        <template v-if="viewMode === 'day'">
          <div
            class="flex items-center justify-center gap-3 px-4 py-3 border-b ui-border shrink-0"
            :class="dayViewDate.isToday ? 'bg-(--ui-primary-soft)' : 'ui-surface'"
          >
            <span class="text-xs font-semibold uppercase tracking-wider ui-text-soft">{{ dayViewDate.dayName }}</span>
            <span
              class="text-2xl font-light"
              :class="dayViewDate.isToday ? 'ui-primary' : 'ui-text'"
            >
              {{ dayViewDate.dayNumber }}
            </span>
          </div>

          <div
            v-if="getAllDayEvents(dayViewDate.events).length"
            class="flex border-b ui-border bg-(--ui-surface-muted) shrink-0"
          >
            <div class="w-[52px] border-r ui-border px-1.5 py-1 text-[10px] ui-text-soft text-right flex items-center justify-end shrink-0">
              All day
            </div>
            <div class="flex-1 p-1 flex flex-col gap-0.5">
              <div
                v-for="event in getAllDayEvents(dayViewDate.events)"
                :key="event.id"
                class="text-[11px] px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-75 transition-opacity"
                :class="getEventColorClass(event.color)"
                @click="selectEvent(event, dayViewDate)"
              >
                {{ event.title }}
              </div>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto">
            <div
              class="grid"
              style="grid-template-columns: 52px 1fr"
            >
              <template
                v-for="slot in timeSlots"
                :key="slot.time"
              >
                <div class="h-14 border-b border-r border-(--ui-border) px-1.5 pt-1 text-[10px] ui-text-soft text-right leading-none">
                  {{ slot.display }}
                </div>
                <div
                  class="h-14 border-b border-(--ui-border) p-0.5"
                  :class="dayViewDate.isToday ? 'bg-(--ui-primary-soft)' : ''"
                >
                  <div
                    v-for="event in getEventsAtTime(dayViewDate.events, slot)"
                    :key="event.id"
                    class="text-xs px-2 py-1 rounded cursor-pointer hover:opacity-75 transition-opacity"
                    :class="getEventColorClass(event.color)"
                    @click="selectEvent(event, dayViewDate)"
                  >
                    <span class="font-semibold mr-1">{{ event.time }}</span>{{ event.title }}
                    <div
                      v-if="event.description"
                      class="text-[10px] opacity-75 mt-0.5 truncate"
                    >
                      {{ event.description }}
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>

      <!-- ── Sidebar ── -->
      <slot
        name="sidebar"
        :selected-event="selectedEvent"
        :close-event="closeEvent"
      >
        <transition
          enter-active-class="transition-all duration-200 ease-out"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="opacity-0 translate-x-4"
          leave-to-class="opacity-0 translate-x-4"
        >
          <div
            v-if="selectedEvent"
            :class="[sizePreset.sidebarWidthClass, 'shrink-0 border-l ui-border bg-(--ui-surface-muted) flex flex-col overflow-hidden']"
          >
            <div class="flex items-center justify-between px-4 py-3 border-b ui-border">
              <span class="text-[11px] font-semibold uppercase tracking-wider ui-text-soft">Event details</span>
              <button
                class="w-6 h-6 flex items-center justify-center rounded ui-text-soft hover:bg-(--ui-surface-soft) hover:text-(--ui-text) transition-colors"
                @click="closeEvent"
              >
                <svg
                  class="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div class="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              <div
                class="h-0.5 w-full rounded-full"
                :class="getColorStripClass(selectedEvent.color)"
              />

              <h3 class="text-sm font-semibold ui-text leading-snug">
                {{ selectedEvent.title }}
              </h3>

              <div v-if="selectedEvent.status">
                <span
                  class="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full"
                  :class="selectedEvent.status === 'complied' ? 'ui-success-soft ui-success' : 'ui-warning-soft ui-warning'"
                >
                  {{ selectedEvent.status === 'complied' ? '✓ Complied' : '⏱ Pending' }}
                </span>
              </div>

              <div class="flex flex-col gap-1.5">
                <div class="flex items-center gap-2 text-xs ui-text-muted">
                  <svg
                    class="w-3.5 h-3.5 shrink-0 opacity-60"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                    /><line
                      x1="16"
                      y1="2"
                      x2="16"
                      y2="6"
                    /><line
                      x1="8"
                      y1="2"
                      x2="8"
                      y2="6"
                    /><line
                      x1="3"
                      y1="10"
                      x2="21"
                      y2="10"
                    />
                  </svg>
                  {{ formatEventDate(selectedEvent.date, 'full') }}
                </div>
                <div class="flex items-center gap-2 text-xs ui-text-muted">
                  <svg
                    class="w-3.5 h-3.5 shrink-0 opacity-60"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                    /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  {{ selectedEvent.time }}
                </div>
              </div>

              <div
                v-if="selectedEvent.description"
                class="pt-3 border-t ui-border"
              >
                <p class="text-[11px] font-semibold uppercase tracking-wider ui-text-soft mb-1.5">
                  Description
                </p>
                <p class="text-xs ui-text-muted leading-relaxed">
                  {{ selectedEvent.description }}
                </p>
              </div>

              <div
                v-if="selectedEvent.compliance"
                class="pt-3 border-t ui-border flex flex-col gap-2"
              >
                <p class="text-[11px] font-semibold uppercase tracking-wider ui-text-soft">
                  Compliance
                </p>
                <p
                  v-if="selectedEvent.compliance.remarks"
                  class="text-xs ui-text-muted"
                >
                  {{ selectedEvent.compliance.remarks }}
                </p>
                <p
                  v-if="selectedEvent.compliance.compliance_documents?.length"
                  class="text-xs ui-text-muted"
                >
                  {{ selectedEvent.compliance.compliance_documents.length }} document(s) attached
                </p>
              </div>
            </div>
          </div>
        </transition>
      </slot>
    </div>
  </div>
</template>
