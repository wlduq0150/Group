import { Test, TestingModule } from '@nestjs/testing';
import { UserInforService } from './user-infor.service';

describe('UserInforService', () => {
  let service: UserInforService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserInforService],
    }).compile();

    service = module.get<UserInforService>(UserInforService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
