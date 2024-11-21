import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Scooter } from "./scooter.entity";

@Injectable()
export class ScootersService {
	constructor(
		@InjectRepository(Scooter)
		private scootersRepository: Repository<Scooter>
	) {}

	findAll(): Promise<Scooter[]> {
		return this.scootersRepository.find();
	}

	findOne(id: string): Promise<Scooter | null> {
		return this.scootersRepository.findOneBy({ id });
	}

	async remove(id: string): Promise<void> {
		await this.scootersRepository.delete(id);
	}
}
