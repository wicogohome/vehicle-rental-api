import { CreateRentDto } from "./dto/create-rent.dto";
import { RentService } from "./rent.service";

import { Controller, Get, Post, Body, ParseUUIDPipe, Patch, Param, ValidationPipe } from "@nestjs/common";

@Controller("api/rents")
export class RentController {
	constructor(private rentService: RentService) {}

	@Get()
	list() {
		return this.rentService.findAll();
	}

	@Post()
	create(@Body(new ValidationPipe()) creatRentDto: CreateRentDto) {
		return this.rentService.create(creatRentDto);
	}

	@Patch(":rentId/return")
	returnScooter(@Param("rentId", ParseUUIDPipe) rentId: string) {
		return this.rentService.returnScooter(rentId);
	}
}
