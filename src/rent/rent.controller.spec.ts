import { Test, TestingModule } from "@nestjs/testing";
import { RentController } from "./rent.controller";
import { RentService } from "./rent.service";

describe("RentController", () => {
	let controller: RentController;
	let rentService: jest.Mocked<RentService>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [RentController],
			providers: [
				{
					provide: RentService,
					useValue: rentService,
				},
			],
		}).compile();

		controller = module.get<RentController>(RentController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
