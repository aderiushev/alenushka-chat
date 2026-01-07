import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import axios from 'axios';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  private readonly recaptchaSecretKey = '6LdKSc8qAAAAAFMJnXvgMxYvlxOBvhkOqbE5XHZU';

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
            secret: this.recaptchaSecretKey,
            response: body.recaptchaToken,
          },
        }
      );

      if (!recaptchaResponse.data.success) {
        throw new BadRequestException('Проверка reCAPTCHA не пройдена');
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

