import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository, UpdateResult } from "typeorm";
import { Scooter } from "./scooter.entity";
import { faker } from "@faker-js/faker";
@Injectable()
export class ScootersService {
	constructor(
		@InjectRepository(Scooter)
		private scootersRepository: Repository<Scooter>
	) {}

	create(): Promise<Scooter> {
		const scooter = new Scooter();
		scooter.license_plate = faker.vehicle.vrm();
		scooter.VIN = faker.vehicle.vin();
		return this.scootersRepository.save(scooter);
	}

	findAll(): Promise<Scooter[]> {
		return this.scootersRepository.find();
	}

	findOne(id: string): Promise<Scooter | null> {
		return this.scootersRepository.findOneBy({ id });
	}

	async remove(id: string): Promise<void> {
		await this.scootersRepository.delete(id);
	}

	async reserveScooterWithVersionCheck(
		manager: EntityManager,
		scooterId: string,
		currentVersion: number
	): Promise<Scooter> {
		const result: UpdateResult = await manager
			.createQueryBuilder()
			.update(Scooter)
			.set({ is_available: false })
			.where("id = :id", { id: scooterId })
			.andWhere("is_available = true")
			.andWhere("version = :version", { version: currentVersion })
			.returning("*")
			.execute();

		if (result.affected === 0) {
			throw new BadRequestException("Scooter has already been reserved or modified.");
		}

		return result.raw[0] as Scooter;
	}
}
