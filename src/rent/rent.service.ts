import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, IsNull, Repository } from "typeorm";
import { Rent } from "./rent.entity";

import { ScootersService } from "../scooters/scooters.service";
import { Scooter } from "../scooters/scooter.entity";
import { User } from "../users/user.entity";

@Injectable()
export class RentService {
	constructor(
		private dataSource: DataSource,
		@InjectRepository(Rent)
		private rentsRepository: Repository<Rent>,

		private scootersService: ScootersService,
	) {}

	findAll(): Promise<Rent[]> {
		return this.rentsRepository.find({
			relations: {
				user: true,
				scooter: true,
			},
		});
	}

	findOne(id: string): Promise<Rent | null> {
		return this.rentsRepository.findOne({
			where: { id },
			relations: {
				user: true,
				scooter: true,
			},
		});
	}

	async create(userId: string, scooterId: string): Promise<Rent> {
		return await this.dataSource.transaction(async (manager) => {
			// get models
			const user = await manager.findOneBy(User, { id: userId });

			if (!user) {
				throw new NotFoundException("User not found");
			}

			let scooter = await manager.findOneBy(Scooter, { id: scooterId });
			if (!scooter) {
				throw new NotFoundException("Scooter not found");
			}

			// check ability
			const isUserNotEligible = !(await this.isUserEligibleToRent(user, manager));
			if (isUserNotEligible) {
				throw new BadRequestException("User already has an active rental.");
			}

			const isScooterNotAvailable = !(await this.isScooterAvailable(scooter, manager));
			if (isScooterNotAvailable) {
				throw new BadRequestException("The scooter is not available for rent.");
			}

			// For Demo
			// await new Promise((r) => setTimeout(r, 10000));

			// save data
			const currentVersion = scooter.version;
			scooter = await this.scootersService.reserveScooterWithVersionCheck(manager, scooterId, currentVersion);

			const rent = new Rent();
			rent.user = user;
			rent.scooter = scooter;

			return await manager.save(rent);
		});
	}

	async isUserEligibleToRent(user: User, manager?: EntityManager): Promise<boolean> {
		let model: EntityManager | Repository<Rent> = manager;
		if (!model) {
			model = this.rentsRepository;
		}
		const activeUserRent = await model.existsBy(Rent, {
			user: { id: user.id },
			end_at: IsNull(),
		});

		return !activeUserRent;
	}

	async isScooterAvailable(scooter: Scooter, manager?: EntityManager): Promise<boolean> {
		if (!scooter.is_available) {
			return false;
		}

		let model: EntityManager | Repository<Rent> = manager;
		if (!model) {
			model = this.rentsRepository;
		}
		const activeRent = await model.existsBy(Rent, {
			scooter: { id: scooter.id },
			end_at: IsNull(),
		});

		return !activeRent;
	}

	async returnScooter(rentId: string): Promise<Rent> {
		return await this.dataSource.transaction(async (manager) => {
			const rent = await manager.findOne(Rent, {
				where: { id: rentId },
				relations: {
					user: true,
					scooter: true,
				},
			});
			if (!rent) {
				throw new NotFoundException("Rental record not found");
			}

			if (rent.end_at) {
				throw new BadRequestException("Rental return time has already been set.");
			}

			const scooter = rent.scooter;
			scooter.is_available = true;
			await manager.save(scooter);

			rent.end_at = new Date();
			return await manager.save(rent);
		});
	}
}
