import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

/**
 * Telegram bot credentials, read from the environment
 */
interface TelegramConfig {
  botToken: string;
  chatId: string;
}

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  /**
   * Get bot credentials from environment variables
   */
  private getConfig(): TelegramConfig {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      throw new Error(
        'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID environment variables'
      );
    }

    return { botToken, chatId };
  }

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
    const { botToken, chatId } = this.getConfig();
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    await axios.post(url, {
      text,
      chat_id: chatId
    });
  }
}

