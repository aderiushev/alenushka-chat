import { Body, Controller, Get, Post, UseGuards, Param, Req } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {JwtService} from "../auth/jwt.service";


@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService, private jwtService: JwtService) {}

  @Roles('admin')
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() body: {  patientName: string, userId: number }) {
    return this.roomsService.create(body.patientName, body.userId);
  }

  @Roles('admin', 'doctor')
  @UseGuards(RolesGuard)
  @Get()
  async findAll(@Req() req: Request) {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];

    const user = this.jwtService.verify(token);

    if (user.role === 'doctor') {
      return this.roomsService.findAllByUserId(Number(user.sub));
    }

    return this.roomsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findById(id);
  }

  @Post(':id/end')
  async endRoom(@Param('id') id: string) {
    return this.roomsService.markRoomAsCompleted(id);
  }
}
