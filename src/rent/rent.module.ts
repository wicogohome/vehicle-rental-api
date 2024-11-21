import { Module } from "@nestjs/common";
import { RentController } from "./rent.controller";
import { RentService } from "./rent.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Rent } from "./rent.entity";

@Module({
	imports: [TypeOrmModule.forFeature([Rent])],
	controllers: [RentController],
	providers: [RentService],
})
export class RentModule {}
