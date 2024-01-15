import { Controller, Patch } from "@nestjs/common";
import { UserInforService } from "./user-infor.service";

@Controller("user-infor")
export class UserInforController {
    constructor(private readonly userInforService: UserInforService) {
    }

    @Patch()
    updateGamenameById() {
        return this.userInforService.updateGamenameById();
    }
}
