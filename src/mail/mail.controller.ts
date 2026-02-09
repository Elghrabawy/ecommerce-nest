import { Controller, Param, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import { ApiBody } from '@nestjs/swagger';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send/:to')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        subject: { type: 'string' },
        body: { type: 'string' },
      },
      required: ['subject', 'body'],
    },
  })
  async sendMail(
    @Body() body: { subject: string; body: string },
    @Param('to') to: string,
  ) {
    await this.mailService.sendMail(to, body.subject, body.body);
  }
}
