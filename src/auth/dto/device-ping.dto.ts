import { Platform } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'

export class DevicePingDto {
  @IsString() 
	@IsNotEmpty()
	 pushToken!: string
  
	@IsEnum(Platform) 
	platform!: Platform
}