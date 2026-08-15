import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import nodemailer, {
  type Transporter,
} from 'nodemailer';


@Injectable()
export class MailService {
  private readonly transporter:
    Transporter;


  constructor(
    private readonly configService:
      ConfigService,
  ) {

    const host =
      this.configService
        .getOrThrow<string>(
          'SMTP_HOST',
        );


    const port =
      Number(
        this.configService
          .getOrThrow<string>(
            'SMTP_PORT',
          ),
      );


    const secure =
      this.configService
        .get<string>(
          'SMTP_SECURE',
          'false',
        )
        .toLowerCase() ===
      'true';


    const user =
      this.configService
        .getOrThrow<string>(
          'SMTP_USER',
        );


    const pass =
      this.configService
        .getOrThrow<string>(
          'SMTP_PASS',
        );


    this.transporter =
      nodemailer.createTransport({
        host,

        port,

        secure,

        auth: {
          user,
          pass,
        },
      });
  }


  async enviarRecuperacionPassword(
    correo:
      string,

    nombre:
      string,

    resetUrl:
      string,
  ) {

    const from =
      this.configService
        .getOrThrow<string>(
          'SMTP_USER',
        );


    try {

      await this.transporter
        .sendMail({
          from:
            `"DR+ Core" <${from}>`,

          to:
            correo,

          subject:
            'Recuperación de contraseña - DR+ Core',

          text:
            [
              `Hola ${nombre},`,
              '',
              'Recibimos una solicitud para restablecer tu contraseña de DR+ Core.',
              '',
              'Utiliza el siguiente enlace:',
              resetUrl,
              '',
              'El enlace estará disponible durante 15 minutos y solo podrá utilizarse una vez.',
              '',
              'Si no solicitaste este cambio, ignora este mensaje.',
              '',
              'Equipo de TI',
              'DR+',
            ].join(
              '\n',
            ),

          html: `
            <!doctype html>

            <html lang="es">

              <head>
                <meta charset="utf-8" />

                <meta
                  name="viewport"
                  content="width=device-width, initial-scale=1"
                />
              </head>

              <body
                style="
                  margin: 0;
                  padding: 0;
                  background: #f8fafc;
                  font-family:
                    Arial,
                    Helvetica,
                    sans-serif;
                  color: #0f172a;
                "
              >

                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    background: #f8fafc;
                    padding: 32px 16px;
                  "
                >

                  <tr>

                    <td
                      align="center"
                    >

                      <table
                        role="presentation"
                        width="100%"
                        cellspacing="0"
                        cellpadding="0"
                        border="0"
                        style="
                          max-width: 560px;
                          background: #ffffff;
                          border:
                            1px solid #e2e8f0;
                          border-radius: 18px;
                          overflow: hidden;
                        "
                      >

                        <tr>

                          <td
                            style="
                              height: 5px;
                              background:
                                linear-gradient(
                                  90deg,
                                  #0f766e,
                                  #0ea5e9
                                );
                            "
                          >
                          </td>

                        </tr>


                        <tr>

                          <td
                            style="
                              padding:
                                32px
                                34px;
                            "
                          >

                            <div
                              style="
                                margin-bottom: 8px;
                                color: #0f766e;
                                font-size: 13px;
                                font-weight: 800;
                                letter-spacing: .08em;
                                text-transform: uppercase;
                              "
                            >
                              DR+ CORE
                            </div>


                            <h1
                              style="
                                margin:
                                  0 0 18px;
                                color: #0f172a;
                                font-size: 25px;
                                line-height: 1.25;
                              "
                            >
                              Recuperación de contraseña
                            </h1>


                            <p
                              style="
                                margin:
                                  0 0 14px;
                                color: #475569;
                                font-size: 14px;
                                line-height: 1.7;
                              "
                            >
                              Hola ${this.escapeHtml(
                                nombre,
                              )},
                            </p>


                            <p
                              style="
                                margin:
                                  0 0 24px;
                                color: #475569;
                                font-size: 14px;
                                line-height: 1.7;
                              "
                            >
                              Recibimos una solicitud para restablecer la contraseña de tu cuenta en DR+ Core.
                            </p>


                            <table
                              role="presentation"
                              cellspacing="0"
                              cellpadding="0"
                              border="0"
                              style="
                                margin:
                                  0 auto
                                  26px;
                              "
                            >

                              <tr>

                                <td
                                  style="
                                    border-radius: 10px;
                                    background: #0f766e;
                                  "
                                >

                                  <a
                                    href="${this.escapeHtml(
                                      resetUrl,
                                    )}"
                                    style="
                                      display: inline-block;
                                      padding:
                                        13px
                                        22px;
                                      color: #ffffff;
                                      font-size: 14px;
                                      font-weight: 700;
                                      text-decoration: none;
                                    "
                                  >
                                    Restablecer contraseña
                                  </a>

                                </td>

                              </tr>

                            </table>


                            <div
                              style="
                                padding: 14px 16px;
                                border:
                                  1px solid
                                  #dbeafe;
                                border-radius: 11px;
                                background: #f0f9ff;
                                color: #475569;
                                font-size: 13px;
                                line-height: 1.6;
                              "
                            >
                              Este enlace estará disponible durante
                              <strong>
                                15 minutos
                              </strong>
                              y solo podrá utilizarse una vez.
                            </div>


                            <p
                              style="
                                margin:
                                  24px 0 0;
                                color: #64748b;
                                font-size: 13px;
                                line-height: 1.6;
                              "
                            >
                              Si no solicitaste este cambio, puedes ignorar este correo.
                            </p>


                            <div
                              style="
                                margin-top: 28px;
                                padding-top: 18px;
                                border-top:
                                  1px solid
                                  #e2e8f0;
                                color: #94a3b8;
                                font-size: 12px;
                                line-height: 1.6;
                              "
                            >
                              Equipo de TI
                              <br />
                              DR+
                            </div>

                          </td>

                        </tr>

                      </table>

                    </td>

                  </tr>

                </table>

              </body>

            </html>
          `,
        });

    } catch (
      error
    ) {

      console.error(
        'Error enviando correo de recuperación:',
        error,
      );


      throw new InternalServerErrorException(
        'No se pudo enviar el correo de recuperación.',
      );

    }
  }


  private escapeHtml(
    value:
      string,
  ) {

    return value
      .replace(
        /&/g,
        '&amp;',
      )
      .replace(
        /</g,
        '&lt;',
      )
      .replace(
        />/g,
        '&gt;',
      )
      .replace(
        /"/g,
        '&quot;',
      )
      .replace(
        /'/g,
        '&#039;',
      );

  }
}