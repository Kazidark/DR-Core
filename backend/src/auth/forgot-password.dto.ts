import {
  IsEmail,
  IsNotEmpty,
} from 'class-validator';


export class ForgotPasswordDto {
  @IsEmail(
    {},
    {
      message:
        'Debes ingresar un correo válido.',
    },
  )
  @IsNotEmpty({
    message:
      'El correo es obligatorio.',
  })
  correo!: string;
}