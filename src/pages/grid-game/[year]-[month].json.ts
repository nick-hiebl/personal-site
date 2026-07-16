import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'

export const GET = (async ({ params }) => {
    const year = parseInt(params.year ?? '', 10)
    const month = parseInt(params.month ?? '', 10)

    const days = await getCollection('gridGameDaily')

    return new Response(
        JSON.stringify({
            year,
            month,
            days: days
                .filter(p => p.data.month === month && p.data.year === year)
                .map(day => ({
                    id: day.id,
                    year: day.data.year,
                    month: day.data.month,
                    day: day.data.day,
                    puzzles: day.data.puzzles,
                })),
        })
    )
}) satisfies APIRoute

export async function getStaticPaths() {
    const puzzles = await getCollection('gridGameDaily')

    const yearMonthSet = new Set<string>()

    puzzles.forEach(({ data: { year, month } }) => {
        yearMonthSet.add(`${year}-${month}`)
    })

    return Array.from(yearMonthSet).map(yearMonthString => {
        console.error('WORKING WITH', yearMonthString, puzzles)
        const [year, month] = yearMonthString.split('-')
        return {
            params: { year, month },
        }
    })
}
