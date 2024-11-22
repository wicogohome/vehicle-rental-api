import { UsersService } from "./users.service";
import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";

describe("UsersController", () => {
	let controller: UsersController;
	let usersService: jest.Mocked<UsersService>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [
				{
					provide: UsersService,
					useValue: usersService,
				},
			],
		}).compile();

		controller = module.get<UsersController>(UsersController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
