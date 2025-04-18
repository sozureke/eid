import { PrismaClient } from '@prisma/client'
import { promises as fs } from 'fs'
import path from 'path'
import type { SeedAchievement, SeedPreset } from '../src/seed/types'

const prisma = new PrismaClient()

async function loadJSON<T>(relativePath: string): Promise<T> {
  const filePath = path.join(process.cwd(), relativePath)
  const file = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(file) as T
}

async function main() {
  const presets = await loadJSON<SeedPreset[]>('prisma/presets.json')
  const achievements = await loadJSON<SeedAchievement[]>('prisma/achievements.json')
  await prisma.userAchievement.deleteMany()
  await prisma.achievement.deleteMany()
  await prisma.userThought.deleteMany()
  await prisma.presetThought.deleteMany()

  for (const p of presets) {
    const categoryId = await prisma.tag.upsert({
      where: { slug: p.category },
      update: { type: 'category', title: p.category },
      create: { type: 'category', slug: p.category, title: p.category },
    }).then(t => t.id)

    const fuelIds = await Promise.all(
      p.fuel.map(f =>
        prisma.tag.upsert({
          where: { slug: f },
          update: { type: 'fuel', title: f },
          create: { type: 'fuel', slug: f, title: f },
        }).then(t => t.id),
      ),
    )

    await prisma.presetThought.create({
      data: {
        title:      p.title,
        details:    p.details,
        dueFlavour: p.due_flavour,
        category:   { connect: { id: categoryId } },
        fuels:      { connect: fuelIds.map(id => ({ id })) },
      },
    })
  }

  // 4) сидим ачивки
  for (const a of achievements) {
    await prisma.achievement.upsert({
      where:  { code: a.code },
      update: {
        title:       a.title,
        description: a.description,
        icon:        a.icon,
        criteria:    a.criteria,
      },
      create: {
        code:        a.code,
        title:       a.title,
        description: a.description,
        icon:        a.icon,
        criteria:    a.criteria,
      },
    })
  }

  console.log('Seed completed.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
