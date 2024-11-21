import { Controller, Get } from "@nestjs/common";

@Controller("rent")
export class RentController {
	@Get()
	getHello(): string {
		return "hello";
	}
}
