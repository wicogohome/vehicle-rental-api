import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { Rent } from "./rent.entity";

import { ScootersService } from "../scooters/scooters.service";
import { UsersService } from "../users/users.service";

@Injectable()
export class RentService {
	constructor(
		@InjectRepository(Rent)
		private rentsRepository: Repository<Rent>,

		private scootersService: ScootersService,
		private usersService: UsersService
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
		return this.rentsRepository.findOneBy({ id });
	}

	async create(userId: string, scooterId: string): Promise<Rent> {
		// get models
		const user = await this.usersService.findOne(userId);
		if (!user) {
			throw new NotFoundException("User not found");
		}

		const scooter = await this.scootersService.findOne(scooterId);
		if (!scooter) {
			throw new NotFoundException("Scooter not found");
		}

		// check ability
		const isUserNotEligible = !(await this.isUserEligibleToRent(userId));
		if (isUserNotEligible) {
			throw new BadRequestException("User already has an active rental.");
		}

		const isScooterNotAvailable = !(await this.isScooterAvailable(scooterId));
		if (isScooterNotAvailable) {
			throw new BadRequestException("The scooter is not available for rent.");
		}

		// save data
		const rent = new Rent();
		rent.user = user;
		rent.scooter = scooter;
		return this.rentsRepository.save(rent);
	}

	async isUserEligibleToRent(userId: string): Promise<boolean> {
		const activeUserRent = await this.rentsRepository.existsBy({
			user: { id: userId },
			end_at: IsNull(),
		});

		return !activeUserRent;
	}

	async isScooterAvailable(scooterId: string): Promise<boolean> {
		const activeRent = await this.rentsRepository.existsBy({
			scooter: { id: scooterId },
			end_at: IsNull(),
		});

		return !activeRent;
	}

	async returnScooter(rentId: string): Promise<Rent> {
		const rent = await this.findOne(rentId);
		if (!rent) {
			throw new NotFoundException("Rental record not found");
		}

		if (rent.end_at) {
			throw new BadRequestException("Rental return time has already been set.");
		}

		rent.end_at = new Date();

		return this.rentsRepository.save(rent);
	}
}
