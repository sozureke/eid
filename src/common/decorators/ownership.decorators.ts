import { SetMetadata } from '@nestjs/common'

export interface OwnershipOptions {
	model: string
	idParam: string
	ownerField?: string
}

export const OWNERSHIP_KEY = 'ownership'
export const Ownership = (options: OwnershipOptions) => SetMetadata(OWNERSHIP_KEY, {ownerField: 'userId', ...options})