import { Module } from "@nestjs/common";
import { RentController } from "./rent.controller";
import { RentService } from "./rent.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Rent } from "./rent.entity";
import { ScootersModule } from "../scooters/scooters.module";
import { UsersModule } from "../users/users.module";

@Module({
	imports: [TypeOrmModule.forFeature([Rent]), ScootersModule, UsersModule],
	controllers: [RentController],
	providers: [RentService],
})
export class RentModule {}
