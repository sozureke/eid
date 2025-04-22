import { Injectable, NotFoundException } from '@nestjs/common'
import { DueFlavour, PresetThought, Thought, ThoughtStatus, UserThought } from '@prisma/client'
import { ClassifierService } from 'src/nlp/classifier.service'
import { ClassificationInput } from 'src/nlp/nlp.types'
import { TransformService } from 'src/nlp/transform.service'
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
    private readonly transformer: TransformService
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

  async createThought(userId: string, dto: CreateThoughtDto) {
    const original = await this.prisma.thought.create({
      data: {
        userId,
        title: dto.title,
        details: dto.details,
        status: dto.status,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
      },
    })

    const input: ClassificationInput = {
      title: dto.title,
      details: dto.details,
    }

    const { label, score } = await this.classifier.classify(input)

    if (this.classifier.isToxic(label) && this.classifier.meetsThreshold(score)) {
      const transformed = await this.transformer.rewrite(dto.title, dto.details, label)
      await this.prisma.thought.update({
        where: { id: original.id },
        data: {
          title: transformed.title,
          details: transformed.details ?? original.details,
        },
      })
      return { original, transformed }
    }

    return { original }
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
