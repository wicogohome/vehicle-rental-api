import { Test, TestingModule } from "@nestjs/testing";
import { ScootersService } from "./scooters.service";

describe("ScootersService", () => {
	let service: ScootersService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ScootersService],
		}).compile();

		service = module.get<ScootersService>(ScootersService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
