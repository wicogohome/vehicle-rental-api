import { User } from "./../users/user.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { RentService } from "./rent.service";
import { ScootersService } from "../scooters/scooters.service";
import { UsersService } from "../users/users.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, IsNull, Repository } from "typeorm";
import { Rent } from "./rent.entity";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { Scooter } from "../scooters/scooter.entity";

describe("RentService", () => {
	let service: RentService;
	let dataSource: jest.Mocked<DataSource>;
	let rentsRepository: jest.Mocked<Repository<Rent>>;
	let scootersService: jest.Mocked<ScootersService>;

	beforeEach(async () => {
		const mockRepository = {
			find: jest.fn(),
			findOneBy: jest.fn(),
			save: jest.fn(),
			existsBy: jest.fn(),
		};
		const mockDatasource = {
			transaction: jest.fn(async (callback: any) =>
				callback({
					findOneBy: jest.fn(),
					findOne: jest.fn(),
					save: jest.fn(),
				})
			),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RentService,
				{
					provide: getRepositoryToken(Rent),
					useValue: mockRepository,
				},
				{ provide: DataSource, useValue: mockDatasource },
				{
					provide: UsersService,
					useValue: { findOne: jest.fn() },
				},
				{
					provide: ScootersService,
					useValue: { findOne: jest.fn(), reserveScooterWithVersionCheck: jest.fn() },
				},
			],
		}).compile();

		service = module.get<RentService>(RentService);
		rentsRepository = module.get(getRepositoryToken(Rent));
		dataSource = module.get(DataSource);
		scootersService = module.get(ScootersService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("create", () => {
		it("should throw NotFoundException if user does not exist", async () => {
			dataSource.transaction.mockImplementation(async (callback: any) =>
				callback({
					findOneBy: jest.fn().mockResolvedValueOnce(null), // User not found
				})
			);

			await expect(service.create("user-id", "scooter-id")).rejects.toThrow(
				new NotFoundException("User not found")
			);
		});

		it("should throw NotFoundException if scooter does not exist", async () => {
			const user = { id: "user-id" } as User;

			dataSource.transaction.mockImplementation(async (callback: any) =>
				callback({
					findOneBy: jest.fn().mockResolvedValueOnce(user).mockResolvedValueOnce(null), // Scooter not found
				})
			);

			await expect(service.create("user-id", "scooter-id")).rejects.toThrow(
				new NotFoundException("Scooter not found")
			);
		});

		it("should throw BadRequestException if user already has an active rental", async () => {
			const user = { id: "user-id" } as User;
			const scooter = { id: "scooter-id", is_available: true } as Scooter;

			dataSource.transaction.mockImplementation(async (callback: any) =>
				callback({
					findOneBy: jest.fn().mockResolvedValueOnce(user).mockResolvedValueOnce(scooter),
				})
			);

			jest.spyOn(service, "isUserEligibleToRent").mockResolvedValue(false);

			await expect(service.create("user-id", "scooter-id")).rejects.toThrow(
				new BadRequestException("User already has an active rental.")
			);

			expect(service.isUserEligibleToRent).toHaveBeenCalled();
		});

		it("should throw BadRequestException if scooter is not available", async () => {
			const user = { id: "user-id" } as User;
			const scooter = { id: "scooter-id", is_available: false } as Scooter;

			dataSource.transaction.mockImplementation(async (callback: any) =>
				callback({
					findOneBy: jest.fn().mockResolvedValueOnce(user).mockResolvedValueOnce(scooter),
				})
			);

			jest.spyOn(service, "isUserEligibleToRent").mockResolvedValue(true);
			jest.spyOn(service, "isScooterAvailable").mockResolvedValue(false);

			await expect(service.create("user-id", "scooter-id")).rejects.toThrow(
				new BadRequestException("The scooter is not available for rent.")
			);

			expect(service.isUserEligibleToRent).toHaveBeenCalled();
			expect(service.isScooterAvailable).toHaveBeenCalled();
		});

		it("should create a rental successfully", async () => {
			const user = { id: "user-id" } as User;
			const scooter = { id: "scooter-id", is_available: true } as Scooter;

			dataSource.transaction.mockImplementation(async (callback: any) =>
				callback({
					findOneBy: jest.fn().mockResolvedValueOnce(user).mockResolvedValueOnce(scooter),
					save: jest.fn().mockResolvedValue({ id: "rent-id" } as Rent),
				})
			);

			jest.spyOn(service, "isUserEligibleToRent").mockResolvedValue(true);
			jest.spyOn(service, "isScooterAvailable").mockResolvedValue(true);

			const lockedScooter = { id: "scooter-id", is_available: false } as Scooter;
			scootersService.reserveScooterWithVersionCheck.mockResolvedValue(lockedScooter);

			const result = await service.create("user-id", "scooter-id");

			expect(result).toEqual({ id: "rent-id" });
			expect(service.isUserEligibleToRent).toHaveBeenCalled();
			expect(service.isScooterAvailable).toHaveBeenCalled();
			expect(scootersService.reserveScooterWithVersionCheck).toHaveBeenCalled();
		});
	});

	describe("isUserEligibleToRent", () => {
		it("should return true if user has no active rental", async () => {
			rentsRepository.existsBy.mockResolvedValue(false);

			const result = await service.isUserEligibleToRent({ id: "user-id" } as User);
			expect(result).toBe(true);
			expect(rentsRepository.existsBy).toHaveBeenCalledWith(Rent, {
				user: { id: "user-id" },
				end_at: IsNull(),
			});
		});

		it("should return false if user has an active rental", async () => {
			rentsRepository.existsBy.mockResolvedValue(true);

			const result = await service.isUserEligibleToRent({ id: "user-id" } as User);
			expect(result).toBe(false);
		});
	});

	describe("isScooterAvailable", () => {
		it("should return true if scooter is available", async () => {
			rentsRepository.existsBy.mockResolvedValue(false);

			const result = await service.isScooterAvailable({ id: "scooter-id", is_available: true } as Scooter);
			expect(result).toBe(true);
			expect(rentsRepository.existsBy).toHaveBeenCalledWith(Rent, {
				scooter: { id: "scooter-id" },
				end_at: IsNull(),
			});
		});

		it("should return false if scooter is not available", async () => {
			const result = await service.isScooterAvailable({ id: "scooter-id", is_available: false } as Scooter);
			expect(result).toBe(false);
		});

		it("should return false if scooter has been rented", async () => {
			rentsRepository.existsBy.mockResolvedValue(true);

			const result = await service.isScooterAvailable({ id: "scooter-id", is_available: true } as Scooter);
			expect(result).toBe(false);
		});
	});

	describe("returnScooter", () => {
		it("should throw NotFoundException if rental does not exist", async () => {
			dataSource.transaction.mockImplementation(async (callback: any) =>
				callback({
					findOne: jest.fn().mockResolvedValue(null),
				})
			);

			rentsRepository.findOneBy.mockResolvedValue(null);

			await expect(service.returnScooter("rent-id")).rejects.toThrow(
				new NotFoundException("Rental record not found")
			);
		});

		it("should throw BadRequestException if rental already has an end time", async () => {
			dataSource.transaction.mockImplementation(async (callback: any) =>
				callback({
					findOne: jest.fn().mockResolvedValue({ end_at: new Date() } as Rent),
				})
			);

			await expect(service.returnScooter("rent-id")).rejects.toThrow(
				new BadRequestException("Rental return time has already been set.")
			);
		});

		it("should set end time and save rental", async () => {
			const rent = {
				id: "rent-id",
				end_at: null,
				scooter: {
					id: "scooter-id",
					is_available: false,
				},
				user: {
					id: "user-id",
				},
			} as Rent;

			dataSource.transaction.mockImplementation(async (callback: any) =>
				callback({
					findOne: jest.fn().mockResolvedValue(rent),
					save: jest.fn().mockResolvedValue(rent),
				})
			);

			const result = await service.returnScooter("rent-id");
			expect(result).toEqual(rent);
		});
	});
});
