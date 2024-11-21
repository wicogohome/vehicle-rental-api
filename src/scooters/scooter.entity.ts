import { Entity, Column, PrimaryGeneratedColumn, Index, OneToMany } from "typeorm";
@Entity("scooters")
export class Scooter {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column("varchar", { length: 10 })
	license_plate: string;

	@Index({ unique: true })
	@Column("varchar", { length: 255 })
	VIN: string;
}
