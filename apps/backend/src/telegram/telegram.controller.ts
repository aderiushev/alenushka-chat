import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegramService } from './telegram.service';
import axios from 'axios';

@Controller('telegram')
export class TelegramController {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly configService: ConfigService,
  ) {}

  @Post('consultation-request')
  async sendConsultationRequest(
    @Body() body: { phone?: string; contactMethod?: string; recaptchaToken?: string }
  ) {
    // Verify reCAPTCHA token
    if (!body.recaptchaToken) {
      throw new BadRequestException('Пожалуйста, подтвердите, что вы не робот');
    }

    try {
      const recaptchaResponse = await axios.post(
        'https://www.google.com/recaptcha/api/siteverify',
        null,
        {
          params: {
            secret: this.configService.get<string>('RECAPTCHA_SECRET_KEY'),
            response: body.recaptchaToken,
          },
        }
      );

      if (!recaptchaResponse.data.success) {
        throw new BadRequestException('Проверка reCAPTCHA не пройдена');
      }

      // For reCAPTCHA v3, check the score (0.0 - 1.0, higher is more likely human)
      const score = recaptchaResponse.data.score;
      if (score !== undefined && score < 0.5) {
        throw new BadRequestException('Проверка reCAPTCHA не пройдена. Попробуйте ещё раз.');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Ошибка проверки reCAPTCHA');
    }

    await this.telegramService.sendConsultationRequest(
      body.phone,
      body.contactMethod
    );
    return { success: true };
  }
}

