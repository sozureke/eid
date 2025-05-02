import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { DueFlavour, PresetThought, Thought, ThoughtStatus, UserThought } from '@prisma/client'
import { FirebaseService } from 'firebase/firebase.service'
import Redis from 'ioredis'
import { ClassifierService } from 'nlp/classifier.service'
import { TransformService } from 'nlp/transform.service'
import { PrismaService } from '../prisma/prisma.service'
import { CreatePresetThoughtDto } from './dto/create-preset-thought.dto'
import { CreateThoughtDto } from './dto/create-thought.dto'
import { UpdatePresetThoughtDto } from './dto/update-preset-thought.dto'
import { UpdateThoughtDto } from './dto/update-thought.dto'
import { PresetWithTags, UserThoughtWithPreset } from './thoughts.types'

@Injectable()
export class ThoughtsService {
  constructor(private readonly prisma: PrismaService,
    private readonly classifier: ClassifierService,
    private readonly transformer: TransformService,
    private readonly firebase: FirebaseService, 
    @Inject('REDIS_CLIENT') private readonly redis: Redis
  ) {}

  async getPresetThoughts(dueFlavour?: DueFlavour): Promise<PresetWithTags[]> {
    return this.prisma.presetThought.findMany({
      where: dueFlavour ? { dueFlavour } : {},
      include: { category: true, fuels: true },
      orderBy: { title: 'asc' },
    })
  }

  async getPresetThoughtById(id: string): Promise<PresetWithTags> {
    const thought = await this.prisma.presetThought.findUnique({
      where: { id },
      include: { category: true, fuels: true },
    })
    if (!thought) throw new NotFoundException(`PresetThought ${id} not found`)
      return thought
  }
  
  async getThoughts(userId: string): Promise<Thought[]> {
    return this.prisma.thought.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getRandomPresetThought(dueFlavour?: DueFlavour): Promise<PresetWithTags> {
    const list = await this.getPresetThoughts(dueFlavour)
    if (!list.length) throw new NotFoundException('No thoughts found')
    return list[Math.floor(Math.random() * list.length)]
  }

  async getUserThoughtHistory(userId: string): Promise<UserThoughtWithPreset[]> {
    return this.prisma.userThought.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        preset: {
          include: {
            category: { select: { slug: true, title: true } },
            fuels:    { select: { slug: true, title: true } },
          },
        },
      },
    })
  }

  async createPresetThought(dto: CreatePresetThoughtDto): Promise<PresetWithTags> {
    return this.prisma.presetThought.create({
      data: {
        title: dto.title,
        details: dto.details,
        dueFlavour: dto.dueFlavour,
        category: { connect: { id: dto.categoryId } },
        fuels: { connect: dto.fuelIds.map(id => ({ id })) },
      },
      include: { category: true, fuels: true },
    })
  }

  async createThought(userId: string, dto: CreateThoughtDto): Promise<Thought> {
    const original = { title: dto.title, details: dto.details }

    const classification = await this.classifier.classify(original)

    let title   = dto.title
    let details = dto.details
    let pushed  = false

    const isToxic = this.classifier.isToxic(classification.label) &&
                    this.classifier.meetsThreshold(classification.score)

    if (isToxic) {
      const rewritten = await this.transformer.rewrite(title, details, classification.label)
      title   = rewritten.title
      details = rewritten.details ?? null

      const devices = await this.prisma.device.findMany({ where: { userId }, select: { pushToken: true } })
      if (devices.length) {
        const msg = await this.transformer.pushMessage('nlp-rewrite', { old: original, new: { title, details } })
        for (const d of devices) {
          await this.firebase.sendPush(d.pushToken, msg) 
        }
      }
    }

    const thought = await this.prisma.thought.create({
      data: {
        userId,
        title,
        details,
        status: dto.status,
        dueAt : dto.dueAt ? new Date(dto.dueAt) : null,
      },
    })

    await this.redis.lpush(
      `thought:logs:${userId}`,
      JSON.stringify({
        createdAt : new Date().toISOString(),
        isToxic,
        pushed,
        label : classification.label,
        score : classification.score,
        original,
        transformed: { title, details },
      }),
    )

    return thought
  }


  async updateThought(
    id: string,
    userId: string,
    dto: UpdateThoughtDto
  ): Promise<Thought> {
    const existing = await this.prisma.thought.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundException(`CustomThought ${id} not found`);
    return this.prisma.thought.update({
      where: { id },
      data: {
        title: dto.title,
        details: dto.details,
        status: dto.status,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : existing.dueAt,
        completedAt:
          dto.status === 'completed' ? new Date() : existing.completedAt,
      },
    })
  }

  async updatePresetThought(id: string, dto: UpdatePresetThoughtDto): Promise<PresetWithTags> {
    await this.getPresetThoughtById(id)
    return this.prisma.presetThought.update({
      where: { id },
      data: {
        title: dto.title,
        details: dto.details,
        dueFlavour: dto.dueFlavour,
        ...(dto.categoryId
          ? { category: { connect: { id: dto.categoryId } } }
          : {}),
        ...(dto.fuelIds
          ? { fuels: { set: dto.fuelIds.map(fid => ({ id: fid })) } }
          : {}),
      },
      include: { category: true, fuels: true },
    })
  }

  async setUserThoughtStatus(
    userId: string,
    presetId: string,
    status: ThoughtStatus = ThoughtStatus.completed,
  ): Promise<UserThoughtWithPreset> {
    const now = new Date()
    return this.prisma.userThought.upsert({
      where: { id: `${presetId}_${userId}` },
      create: {
        id: undefined,
        userId,
        presetId,
        status,
        dueAt: now,
        completedAt: status === ThoughtStatus.completed ? now : null,
      },
      update: {
        status,
        completedAt: status === ThoughtStatus.completed ? now : null,
      },
      include: {
        preset: {
          include: {
            category: { select: { slug: true, title: true } },
            fuels:    { select: { slug: true, title: true } },
          },
        },
      },
    })
  }


  async deletePresetThought(id: string): Promise<PresetThought> {
    await this.getPresetThoughtById(id);
    return this.prisma.presetThought.delete({ where: { id } });
  }

  async deleteUserThought(id: string): Promise<UserThought> {
    const existing = await this.prisma.userThought.findUnique({
      where: { id },
    })
    if (!existing) {
      throw new NotFoundException(`UserThought ${id} not found`)
    }
    return this.prisma.userThought.delete({ where: { id } })
  }

  async deleteThought(
    id: string,
    userId: string
  ): Promise<Thought> {
    const existing = await this.prisma.thought.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundException(`CustomThought ${id} not found`);
    return this.prisma.thought.delete({ where: { id } });
  }
}
