import { Controller, Patch } from "@nestjs/common";
import { UserInfoService } from "./user-info.service";

@Controller("user-info")
export class UserInfoController {
    constructor(private readonly userInforService: UserInfoService) {
    }

    @Patch()
    updateGamenameById() {
        return this.userInforService.updateGamenameById();
    }
}
