import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { FileStorageService } from "./file-storage.service";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [FileStorageService],
  exports: [FileStorageService],
})
export class StorageModule {}