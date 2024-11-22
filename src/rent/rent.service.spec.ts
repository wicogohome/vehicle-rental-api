import { Test, TestingModule } from "@nestjs/testing";
import { RentService } from "./rent.service";
import { ScootersService } from "../scooters/scooters.service";
import { UsersService } from "../users/users.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Rent } from "./rent.entity";

describe("RentService", () => {
	let service: RentService;
	let rentRepository: jest.Mocked<Repository<Rent>>;
	let usersService: jest.Mocked<UsersService>;
	let scootersService: jest.Mocked<ScootersService>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RentService,
				{
					provide: getRepositoryToken(Rent),
					useValue: rentRepository,
				},
				{
					provide: UsersService,
					useValue: usersService,
				},
				{
					provide: ScootersService,
					useValue: scootersService,
				},
			],
		}).compile();

		service = module.get<RentService>(RentService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
