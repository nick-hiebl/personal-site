import type { CollectionEntry } from 'astro:content'
import { useMemo, useState } from 'react'

import { GridPuzzle } from '../GridPuzzle'

import './Page.css'

type Day = CollectionEntry<'gridGameDaily'>

type Props = {
    days: Day[]
    year: string
    month: string
}

export const DailyMonthPage = ({ days, year, month }: Props) => {
    // Persisting the current date as we don't want the page to bug out over midnight
    const date = useMemo(() => new Date(), [])

    const isCurrentMonth = date.getFullYear().toString() === year && (date.getMonth() + 1).toString() === month

    const [dayOfMonth, setDayOfMonth] = useState(() => {
        if (isCurrentMonth) {
            return (days.find(({ data: { day } }) => day === date.getDate()) ?? days[0]).data.day
        }

        return days[0].data.day
    })


    const activeDay = days.find(({ data: { day } }) => day === dayOfMonth)

    if (!activeDay) {
        return (
            <div>
                We couldn't find the day you selected...
                <MonthDayPicker
                    days={days}
                    dayOfMonth={dayOfMonth}
                    onDayChange={setDayOfMonth}
                    isCurrentMonth={isCurrentMonth}
                />
            </div>
        )
    }

    return (
        <div>
            <MonthDayPicker
                days={days}
                dayOfMonth={dayOfMonth}
                onDayChange={setDayOfMonth}
                isCurrentMonth={isCurrentMonth}
            />
            <ul>
                {activeDay.data.puzzles.map((puzzle, index) => (
                    <GridPuzzle key={`${activeDay.id}-${index}`} schema={puzzle.schema} isCentered />
                ))}
            </ul>
        </div>
    )
}

type MonthlyDayPickerProps = {
    days: Day[]
    onDayChange: (dayOfMonth: number) => void
    dayOfMonth: number
    isCurrentMonth: boolean
}

const MonthDayPicker = ({ days, dayOfMonth, onDayChange, isCurrentMonth }: MonthlyDayPickerProps) => {
    const date = new Date()
    const today = date.getDate()

    return (
        <select
            id="day-picker"
            value={dayOfMonth}
            onChange={event => {
                const dayValue = event.currentTarget.value

                onDayChange(parseInt(dayValue, 10))
            }}
        >
            {days.map(({ id, data: { year, month, day } }) => (
                <option key={id} value={day}>
                    {year}/{month}/{day} {isCurrentMonth && day === today && ' - Today'}
                </option>
            ))}
        </select>
    )
}
