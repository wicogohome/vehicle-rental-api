import { User } from "./../users/user.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { RentService } from "./rent.service";
import { ScootersService } from "../scooters/scooters.service";
import { UsersService } from "../users/users.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { Rent } from "./rent.entity";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { Scooter } from "../scooters/scooter.entity";

describe("RentService", () => {
	let service: RentService;
	let rentsRepository: jest.Mocked<Repository<Rent>>;
	let usersService: jest.Mocked<UsersService>;
	let scootersService: jest.Mocked<ScootersService>;

	beforeEach(async () => {
		const mockRepository = {
			find: jest.fn(),
			findOneBy: jest.fn(),
			save: jest.fn(),
			existsBy: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RentService,
				{
					provide: getRepositoryToken(Rent),
					useValue: mockRepository,
				},
				{
					provide: UsersService,
					useValue: { findOne: jest.fn() },
				},
				{
					provide: ScootersService,
					useValue: { findOne: jest.fn() },
				},
			],
		}).compile();

		service = module.get<RentService>(RentService);
		rentsRepository = module.get(getRepositoryToken(Rent));
		scootersService = module.get(ScootersService);
		usersService = module.get(UsersService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("create", () => {
		it("should throw NotFoundException if user does not exist", async () => {
			usersService.findOne.mockResolvedValue(null);

			await expect(service.create("user-id", "scooter-id")).rejects.toThrow(
				new NotFoundException("User not found")
			);

			expect(usersService.findOne).toHaveBeenCalledWith("user-id");
		});

		it("should throw NotFoundException if scooter does not exist", async () => {
			usersService.findOne.mockResolvedValue(new User());
			scootersService.findOne.mockResolvedValue(null);

			await expect(service.create("user-id", "scooter-id")).rejects.toThrow(
				new NotFoundException("Scooter not found")
			);

			expect(scootersService.findOne).toHaveBeenCalledWith("scooter-id");
		});

		it("should throw BadRequestException if user already has an active rental", async () => {
			usersService.findOne.mockResolvedValue(new User());
			scootersService.findOne.mockResolvedValue(new Scooter());

			jest.spyOn(service, "isUserEligibleToRent").mockResolvedValue(false);

			await expect(service.create("user-id", "scooter-id")).rejects.toThrow(
				new BadRequestException("User already has an active rental.")
			);

			expect(usersService.findOne).toHaveBeenCalledWith("user-id");
			expect(scootersService.findOne).toHaveBeenCalledWith("scooter-id");
			expect(service.isUserEligibleToRent).toHaveBeenCalledWith("user-id");
		});

		it("should throw BadRequestException if scooter is not available", async () => {
			usersService.findOne.mockResolvedValue(new User());
			scootersService.findOne.mockResolvedValue(new Scooter());

			jest.spyOn(service, "isUserEligibleToRent").mockResolvedValue(true);
			jest.spyOn(service, "isScooterAvailable").mockResolvedValue(false);

			await expect(service.create("user-id", "scooter-id")).rejects.toThrow(
				new BadRequestException("The scooter is not available for rent.")
			);

			expect(usersService.findOne).toHaveBeenCalledWith("user-id");
			expect(scootersService.findOne).toHaveBeenCalledWith("scooter-id");
			expect(service.isUserEligibleToRent).toHaveBeenCalledWith("user-id");
			expect(service.isScooterAvailable).toHaveBeenCalledWith("scooter-id");
		});

		it("should create a rental successfully", async () => {
			usersService.findOne.mockResolvedValue({ id: "user-id" } as User);
			scootersService.findOne.mockResolvedValue({ id: "scooter-id" } as Scooter);

			jest.spyOn(service, "isUserEligibleToRent").mockResolvedValue(true);
			jest.spyOn(service, "isScooterAvailable").mockResolvedValue(true);

			rentsRepository.save.mockResolvedValue({ id: "rent-id" } as Rent);

			const result = await service.create("user-id", "scooter-id");

			expect(result).toEqual({ id: "rent-id" });
			expect(usersService.findOne).toHaveBeenCalledWith("user-id");
			expect(scootersService.findOne).toHaveBeenCalledWith("scooter-id");
			expect(service.isUserEligibleToRent).toHaveBeenCalledWith("user-id");
			expect(service.isScooterAvailable).toHaveBeenCalledWith("scooter-id");
			expect(rentsRepository.save).toHaveBeenCalledWith(
				expect.objectContaining({
					user: { id: "user-id" },
					scooter: { id: "scooter-id" },
				})
			);
		});
	});

	describe("isUserEligibleToRent", () => {
		it("should return true if user has no active rental", async () => {
			rentsRepository.existsBy.mockResolvedValue(false);

			const result = await service.isUserEligibleToRent("user-id");
			expect(result).toBe(true);
			expect(rentsRepository.existsBy).toHaveBeenCalledWith({
				user: { id: "user-id" },
				end_at: IsNull(),
			});
		});

		it("should return false if user has an active rental", async () => {
			rentsRepository.existsBy.mockResolvedValue(true);

			const result = await service.isUserEligibleToRent("user-id");
			expect(result).toBe(false);
		});
	});

	describe("isScooterAvailable", () => {
		it("should return true if scooter is available", async () => {
			rentsRepository.existsBy.mockResolvedValue(false);

			const result = await service.isScooterAvailable("scooter-id");
			expect(result).toBe(true);
			expect(rentsRepository.existsBy).toHaveBeenCalledWith({
				scooter: { id: "scooter-id" },
				end_at: IsNull(),
			});
		});

		it("should return false if scooter is not available", async () => {
			rentsRepository.existsBy.mockResolvedValue(true);

			const result = await service.isScooterAvailable("scooter-id");
			expect(result).toBe(false);
		});
	});

	describe("returnScooter", () => {
		it("should throw NotFoundException if rental does not exist", async () => {
			rentsRepository.findOneBy.mockResolvedValue(null);

			await expect(service.returnScooter("rent-id")).rejects.toThrow(
				new NotFoundException("Rental record not found")
			);

			expect(rentsRepository.findOneBy).toHaveBeenCalledWith({ id: "rent-id" });
		});

		it("should throw BadRequestException if rental already has an end time", async () => {
			rentsRepository.findOneBy.mockResolvedValue({ end_at: new Date() } as Rent);

			await expect(service.returnScooter("rent-id")).rejects.toThrow(
				new BadRequestException("Rental return time has already been set.")
			);
		});

		it("should set end time and save rental", async () => {
			const rent = { id: "rent-id", end_at: null } as Rent;
			rentsRepository.findOneBy.mockResolvedValue(rent);
			rentsRepository.save.mockResolvedValue(rent);

			const result = await service.returnScooter("rent-id");
			expect(result).toEqual(rent);
			expect(rentsRepository.save).toHaveBeenCalledWith(expect.objectContaining({ end_at: expect.any(Date) }));
		});
	});
});
