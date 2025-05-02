import { IsNotEmpty, IsString } from 'class-validator'

export class SendPushDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  body: string

  @IsString()
  @IsNotEmpty()
  token: string
}
