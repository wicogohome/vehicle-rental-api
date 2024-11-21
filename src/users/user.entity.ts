import { Entity, Column, PrimaryGeneratedColumn, Index } from "typeorm";

@Entity("users")
export class User {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column("varchar", { length: 255 })
	name: string;

	@Index({ unique: true })
	@Column("varchar", { length: 10 })
	identification_number: string;

	@Index({ unique: true })
	@Column("varchar", { length: 10 })
	driving_license: string;
}
