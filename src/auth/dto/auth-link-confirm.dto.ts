import { IsNotEmpty, IsString } from 'class-validator'

export class AuthLinkConfirmDto {
  @IsString({message: 'deviceUid must be a string'})
  @IsNotEmpty({message: 'deviceUid must not be empty'})
  linkToken!: string

  @IsString({message: 'newDeviceUid must be a string'})
  @IsNotEmpty({message: 'newDeviceUid must not be empty'})
  newDeviceUid!: string
}