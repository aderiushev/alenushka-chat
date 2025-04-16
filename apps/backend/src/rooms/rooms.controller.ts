import { Body, Controller, Get, Post, UseGuards, Param } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';


@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Roles('admin')
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() body: {  patientName: string, userId: number }) {
    return this.roomsService.create(body.patientName, body.userId);
  }

  @Roles('admin')
  @UseGuards(RolesGuard)
  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findById(id);
  }
}
