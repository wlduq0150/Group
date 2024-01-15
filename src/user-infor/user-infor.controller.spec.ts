import { Test, TestingModule } from '@nestjs/testing';
import { UserInforController } from './user-infor.controller';

describe('UserInforController', () => {
  let controller: UserInforController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserInforController],
    }).compile();

    controller = module.get<UserInforController>(UserInforController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
