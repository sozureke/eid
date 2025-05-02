import { IsIn, IsString } from 'class-validator'

export class RegisterDeviceDto {
  @IsString()
  pushToken: string

  @IsIn(['ios', 'android', 'web'])
  platform: string
}
