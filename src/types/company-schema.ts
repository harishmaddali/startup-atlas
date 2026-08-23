import { z } from "zod";

export const founderSchema = z
  .object({
    name: z.string().min(1),
    linkedinUrl: z.string().url().nullable().optional(),
    twitterUrl: z.string().url().nullable().optional(),
  })
  .strict();

export const companySchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    address: z.string().min(2),
    location: z
      .object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
      })
      .strict(),
    contactEmail: z.string().email().nullable(),
    founders: z.array(founderSchema),
    yearFounded: z.number().int().min(1800).max(2100),
    logoUrl: z.string().url().nullable(),
    ycBatch: z.string().optional(),
    website: z.string().url().nullable().optional(),
    description: z.string().nullable().optional(),
    status: z.string().optional(),
    sector: z.string().optional(),
    dataConfidence: z.enum(["verified", "approximate"]),
  })
  .strict();

export const companiesSchema = z.array(companySchema);

export const researchQueueItemSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1).nullable(),
    location: z.string().min(2),
    yearFounded: z.number().int().min(1800).max(2100),
    founders: z.array(founderSchema),
    website: z.string().url().nullable(),
    logoUrl: z.string().url().nullable(),
    sector: z.string().min(2),
    contactEmail: z.string().email().nullable(),
    address: z.null(),
    location_coords: z.null(),
    dataConfidence: z.literal("from_article"),
    status: z.string().min(2),
    researchReason: z.string().min(20),
    queuedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .strict();

export const researchQueueSchema = z.array(researchQueueItemSchema);
