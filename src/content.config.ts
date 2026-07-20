import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
			unlisted: z.optional(z.boolean()),
		}),
})

const games = defineCollection({
	loader: glob({ base: './src/content/games', pattern: '**/*.{md,mdx}' }),
	schema: () =>
		z.object({
			title: z.string(),
			description: z.string(),
			gameId: z.string(),
			pubDate: z.coerce.date(),
			unlisted: z.optional(z.boolean()),
			url: z.optional(z.string()),
		}),
})

const edgeRuleValidator = z.union([
	z.null(),
	z.object({
		type: z.union([z.literal('count'), z.literal('groups'), z.literal('inverted-groups')]),
		count: z.number(),
	}),
	z.object({
		type: z.literal('nonogram'),
		groups: z.array(z.number()),
	}),
])

const cellRuleValidator = z.union([
	z.object({
		type: z.literal('forced'),
		state: z.boolean(),
	}),
])

const gridGameDailyPuzzles = defineCollection({
	loader: glob({ base: './src/content/grid-game-daily', pattern: '*/*/*.json' }),
	schema: () =>
		z.object({
			year: z.number(),
			month: z.number(),
			day: z.number(),
			puzzles: z.array(z.object({
				schema: z.object({
					width: z.number(),
					height: z.number(),
					verticalEdgeRules: z.optional(z.array(edgeRuleValidator)),
					horizontalEdgeRules: z.optional(z.array(edgeRuleValidator)),
					cellRules: z.optional(z.array(z.object({
						row: z.number(),
						column: z.number(),
						rule: cellRuleValidator,
					}))),
				}),
			})),
		}),
})

export const collections = { blog, games, gridGameDaily: gridGameDailyPuzzles }
