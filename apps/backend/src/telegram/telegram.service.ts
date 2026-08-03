import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

/**
 * Relay configuration
 *
 * Notifications go through a Supabase Edge Function rather than straight to
 * api.telegram.org, which is filtered from the datacenter this runs in. The bot
 * token and chat id live in the function's secrets, not here.
 */
interface RelayConfig {
  url: string;
  secret: string;
}

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  /**
   * Get relay configuration from environment variables
   */
  private getRelayConfig(): RelayConfig {
    const url = process.env.TELEGRAM_RELAY_URL;
    const secret = process.env.TELEGRAM_RELAY_SECRET;

    if (!url || !secret) {
      throw new Error(
        'Missing TELEGRAM_RELAY_URL or TELEGRAM_RELAY_SECRET environment variables'
      );
    }

    return { url, secret };
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
   * Send message to Telegram through the relay
   * @param text - Message text
   */
  private async sendMessage(text: string): Promise<void> {
    const { url, secret } = this.getRelayConfig();

    await axios.post(
      url,
      {
        bot: 'requests',
        method: 'sendMessage',
        payload: { text }
      },
      { headers: { 'X-Relay-Secret': secret } }
    );
  }
}

