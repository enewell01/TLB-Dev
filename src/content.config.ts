import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const categories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/categories' }),
  schema: z.object({
    title: z.string(),
    h1: z.string(),
    metaDescription: z.string(),
    targetKeyword: z.string(),
    order: z.number(),
  }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    h1: z.string(),
    metaDescription: z.string(),
    targetKeyword: z.string(),
    category: z.string(),
    type: z.enum(['service', 'geo']).default('service'),
    // Setting `city` lists an entry in that city's column of the Service Areas block on
    // /services. Geo pages use it; so do the Moncton service pages, which double as
    // Moncton's area coverage rather than being duplicated under `-moncton-nb` slugs.
    city: z.enum(['Moncton', 'Dieppe', 'Riverview']).optional(),
    // Short label for the Service Areas column. The full h1 is too long and repeats the
    // city name that already heads the column. Falls back to `h1`.
    areaLabel: z.string().optional(),
    // Sort position within the Service Areas column. Needed because a service page's
    // `order` positions it inside its category section, which is unrelated. Falls back
    // to `order`.
    areaOrder: z.number().optional(),
    relatedServices: z.array(z.string()).default([]),
    intro: z.string(),
    // Short prose summary of the work. Replaced an earlier `whatsIncluded` bullet list,
    // which read as a fixed package of deliverables when scope varies by job.
    overview: z.string(),
    localRelevance: z.string().optional(),
    order: z.number(),
  }),
});

const reviews = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/reviews' }),
  schema: z.object({
    name: z.string(),
    monthYear: z.string(),
    text: z.string(),
    order: z.number(),
  }),
});

export const collections = { categories, services, reviews };
