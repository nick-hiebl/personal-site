import type { CollectionEntry } from 'astro:content'
import { useEffect, useMemo, useState } from 'react'

import type { PuzzleSchema } from '../schema/types'
import { GridPuzzle } from '../GridPuzzle'

import '../GridPuzzle.css'
import './Page.css'

type Day = CollectionEntry<'gridGameDaily'>

type Props = {
    days: Day[]
    year: string
    month: string
}

export const DailyPage = ({ days, year, month }: Props) => {
    const date = useMemo(() => new Date(), [])

    const isCurrentMonth = date.getFullYear().toString() === year && (date.getMonth() + 1).toString() === month

    if (!isCurrentMonth) {
        return <LoadingDailyPage />
    }

    const activeDay = days.find(day => day.data.day === date.getDate()) ??
        days[days.length - 1]

    if (!activeDay) {
        return <ErrorPage />
    }

    return <RootPage day={activeDay} />
}

type MonthlyData = {
    year: number
    month: number
    days: {
        year: number
        month: number
        day: number
        puzzles: {
            schema: PuzzleSchema
        }[]
    }[]
}

const LoadingDailyPage = () => {
    const date = useMemo(() => new Date(), [])

    const [monthlyData, setMonthlyData] = useState<MonthlyData | undefined>(undefined)
    const [hasError, setError] = useState(false)

    useEffect(() => {
        const loadData = async () => {
            const response = await fetch(`./${date.getFullYear()}-${date.getMonth() + 1}.json`)

            if (!response.ok) {
                setError(true)
                return
            }

            const data: MonthlyData = await response.json()

            setMonthlyData(data)
        }

        loadData()
    }, [date])

    if (hasError) {
        return <ErrorPage />
    }

    if (!monthlyData) {
        return (
            <div>Loading...</div>
        )
    }

    const currentDay = monthlyData.days.find(day => day.day === date.getDate()) ??
        monthlyData.days[monthlyData.days.length - 1]

    if (!currentDay) {
        return <ErrorPage />
    }

    return (
        <RootPage day={currentDay} />
    )
}

type RootPageProps = {
    day: Day | MonthlyData['days'][0]
}

const RootPage = ({ day }: RootPageProps) => {
    const { year, month, day: dayOfMonth } = 'data' in day
        ? day.data
        : day

    const puzzles = 'data' in day
        ? day.data.puzzles
        : day.puzzles

    const date = new Date(`${year}-${month}-${dayOfMonth}`)

    return (
        <div className="column gap-16px">
            <h1>Puzzle for {date.toLocaleDateString()}</h1>
            <ul>
                {puzzles.map((puzzle, index) => (
                    <GridPuzzle key={`${dayOfMonth}-${index}`} schema={puzzle.schema} isCentered />
                ))}
            </ul>
        </div>
    )
}

const ErrorPage = () => {
    return (
        <div>
            <h1>Error: No puzzles found</h1>
            <p>For some reason, there don't appear to be any puzzles for this day or month.</p>
            <p>Your local device time might be way ahead, the puzzles might be a bit late, or this project might be abandoned.</p>
            <p>An easy way to browse previous months will be coming soon!</p>
        </div>
    )
}
