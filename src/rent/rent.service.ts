import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Rent } from "./rent.entity";

@Injectable()
export class RentService {
	constructor(
		@InjectRepository(Rent)
		private rentsRepository: Repository<Rent>
	) {}

	get(): Promise<Rent[]> {
		return this.rentsRepository.find({
			relations: {
				user: true,
				scooter: true,
			},
		});
	}
}
