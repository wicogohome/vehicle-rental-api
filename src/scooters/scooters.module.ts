import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScootersService } from "./scooters.service";
import { Scooter } from "./scooter.entity";
import { ScootersController } from "./scooters.controller";

@Module({
	imports: [TypeOrmModule.forFeature([Scooter])],
	providers: [ScootersService],
	exports: [ScootersService],
	controllers: [ScootersController],
})
export class ScootersModule {}
