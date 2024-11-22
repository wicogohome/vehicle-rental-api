import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScootersService } from "./scooters.service";
import { Scooter } from "./scooter.entity";

@Module({
	imports: [TypeOrmModule.forFeature([Scooter])],
	providers: [ScootersService],
	exports: [ScootersService],
})
export class ScootersModule {}
