import { RentService } from "./rent.service";

import { Controller, Get, Post, Body, ParseUUIDPipe, Patch, Param } from "@nestjs/common";

@Controller("api/rent")
export class RentController {
	constructor(private rentService: RentService) {}

	@Get()
	list() {
		return this.rentService.findAll();
	}

	@Post()
	create(@Body("user_id", ParseUUIDPipe) userId: string, @Body("scooter_id", ParseUUIDPipe) scooterId: string) {
		return this.rentService.create(userId, scooterId);
	}

	@Patch(":rentId/return")
	returnScooter(@Param("rentId", ParseUUIDPipe) rentId: string) {
		return this.rentService.returnScooter(rentId);
	}
}
