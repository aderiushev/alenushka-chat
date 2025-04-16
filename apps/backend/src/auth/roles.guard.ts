import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import {JwtService} from "./jwt.service";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
      private reflector: Reflector,
      private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    const user = this.jwtService.verify(token);
    return requiredRoles.includes(user.role);
  }
}
