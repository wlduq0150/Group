import { Logger, Module, forwardRef } from "@nestjs/common";
import { DiscordService } from "./discord.service";
import { DiscordController } from "./discord.controller";
import { GroupModule } from "src/group/group.module";
import { UserModule } from "src/user/user.module";
import { GroupGateway } from "src/group/group.gateway";

@Module({
    imports: [forwardRef(() => GroupModule), UserModule],
    exports: [DiscordService],
    controllers: [DiscordController],
    providers: [DiscordService, Logger],
})
export class DiscordModule {}
