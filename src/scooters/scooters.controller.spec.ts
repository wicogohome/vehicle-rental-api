import { Test, TestingModule } from "@nestjs/testing";
import { ScootersController } from "./scooters.controller";
import { ScootersService } from "./scooters.service";

describe("ScootersController", () => {
	let controller: ScootersController;
	let scootersService: jest.Mocked<ScootersService>;
	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ScootersController],
			providers: [
				{
					provide: ScootersService,
					useValue: scootersService,
				},
			],
		}).compile();

		controller = module.get<ScootersController>(ScootersController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
