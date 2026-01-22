import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  private readonly botToken = '6492863867:AAEMYr4ksmLUwAUm8ZhTduSKTGVk5z8aYg8';
  private readonly chatId = -1003631903891;

  /**
   * Send consultation request notification to Telegram
   * @param phone - Contact phone number (optional)
   * @param contactMethod - Messenger username or other contact method
   */
  async sendConsultationRequest(
    phone?: string,
    contactMethod?: string
  ): Promise<void> {
    try {
      const messageParts = ['📋 Заявка на онлайн-консультацию:', ''];
      
      if (phone) {
        messageParts.push(`☎️ Телефон: ${phone}`);
      }
      
      if (contactMethod) {
        messageParts.push(`💬 Способ связи: ${contactMethod}`);
      }

      if (!phone && !contactMethod) {
        messageParts.push('⚠️ Контактные данные не указаны');
      }

      const message = messageParts.join('\n');

      await this.sendMessage(message);
      this.logger.log('Consultation request notification sent');
    } catch (error) {
      this.logger.error('Failed to send consultation request notification', error);
      throw error;
    }
  }

  /**
   * Send message to Telegram bot
   * @param text - Message text
   */
  private async sendMessage(text: string): Promise<void> {
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

    await axios.post(url, {
      text,
      chat_id: this.chatId
    });
  }
}

