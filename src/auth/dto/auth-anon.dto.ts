import { IsNotEmpty, IsString } from 'class-validator'

export class AuthAnonDto {
  @IsString({message: 'deviceUid must be a string'})
  @IsNotEmpty({message: 'deviceUid must not be empty'})
  deviceUid!: string
}
