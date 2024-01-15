import { Module } from '@nestjs/common';
import { UserInforController } from './user-infor.controller';
import { UserInforService } from './user-infor.service';

@Module({
  controllers: [UserInforController],
  providers: [UserInforService]
})
export class UserInforModule {}
