import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

import { RentModule } from "./rent/rent.module";

import { User } from "./users/user.entity";
import { UsersModule } from "./users/users.module";
import { ScootersModule } from "./scooters/scooters.module";
import { Scooter } from "./scooters/scooter.entity";

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: process.env.NODE_ENV === "production" ? ".env.production.local" : ".env.local",
			isGlobal: true,
		}),
		TypeOrmModule.forRoot({
			type: "postgres",
			host: process.env.POSTGRES_HOST,
			port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
			username: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD,
			database: process.env.POSTGRES_DB,
			entities: [User, Scooter],
			synchronize: process.env.NODE_ENV === "development" ? true : false,
		}),
		RentModule,
		UsersModule,
		ScootersModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
