import { Prisma } from '@prisma/client'

export type PresetWithTags = Prisma.PresetThoughtGetPayload<{
  include: { category: true; fuels: true }
}>

export type UserThoughtWithPreset = Prisma.UserThoughtGetPayload<{
  include: {
    preset: {
      include: {
        category: { select: { slug: true; title: true } }
        fuels:    { select: { slug: true; title: true } }
      }
    }
  }
}>