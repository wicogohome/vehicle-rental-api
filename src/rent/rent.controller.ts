import { RentService } from "./rent.service";

import { Controller, Get } from "@nestjs/common";

@Controller("rent")
export class RentController {
	constructor(private rentService: RentService) {}

	@Get()
	list() {
		return this.rentService.get();
	}
}
