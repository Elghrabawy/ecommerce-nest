import { Controller, Delete, Get, Param, Post, Body, Res } from '@nestjs/common';
import { MailService } from './mail.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

@ApiTags('mail')
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

  @Get('inbox')
  async getInbox() {
    return this.mailService.getInboxMessages();
  }

  @Get('inbox/:id/body')
  async getMessageBody(@Param('id') id: string, @Res() res: Response) {
    const html = await this.mailService.getMessageHtml(id);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Delete('inbox/:id')
  async deleteMessage(@Param('id') id: string) {
    await this.mailService.deleteMessage(id);
    return { message: 'Deleted' };
  }
}
