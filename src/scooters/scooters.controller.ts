import { ScootersService } from "./scooters.service";
import { Controller, Get, Post } from "@nestjs/common";

@Controller("api/scooters")
export class ScootersController {
	constructor(private scootersService: ScootersService) {}

	@Get()
	list() {
		return this.scootersService.findAll();
	}

	@Post()
	create() {
		return this.scootersService.create();
	}
}
