import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Redirect,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Res() res: Response): void {
    res.status(200).send(this.appService.getHello());
  }
}
