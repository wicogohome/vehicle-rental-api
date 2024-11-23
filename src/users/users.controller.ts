import { Controller, Get, Post } from "@nestjs/common";
import { UsersService } from "./users.service";

@Controller("api/users")
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Get()
	list() {
		return this.usersService.findAll();
	}

	@Post()
	create() {
		return this.usersService.create();
	}
}
