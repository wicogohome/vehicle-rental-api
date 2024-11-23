import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { User } from "./user.entity";
import { faker } from "@faker-js/faker";

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>
	) {}

	create(): Promise<User> {
		const user = new User();
		user.name = faker.person.fullName();
		user.identification_number = `${faker.string.alpha({ casing: "upper" })}${faker.string.numeric(9)}`;
		user.driving_license = `${faker.string.alpha({ casing: "upper" })}${faker.string.numeric(9)}`;
		return this.usersRepository.save(user);
	}

	findAll(): Promise<User[]> {
		return this.usersRepository.find();
	}

	findOne(id: string): Promise<User | null> {
		return this.usersRepository.findOneBy({ id });
	}

	async remove(id: string): Promise<void> {
		await this.usersRepository.delete(id);
	}
}
