import { Test, TestingModule } from "@nestjs/testing";
import { ScootersService } from "./scooters.service";
import { Repository } from "typeorm";
import { Scooter } from "./scooter.entity";
import { getRepositoryToken } from "@nestjs/typeorm";

describe("ScootersService", () => {
	let service: ScootersService;
	let scootersRepository: jest.Mocked<Repository<Scooter>>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ScootersService,
				{
					provide: getRepositoryToken(Scooter),
					useValue: scootersRepository,
				},
			],
		}).compile();

		service = module.get<ScootersService>(ScootersService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
