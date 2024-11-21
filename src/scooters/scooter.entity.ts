import { Entity, Column, PrimaryGeneratedColumn, Index, OneToMany } from "typeorm";
import { Rent } from "../rent/rent.entity";

@Entity("scooters")
export class Scooter {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column("varchar", { length: 10 })
	license_plate: string;

	@Index({ unique: true })
	@Column("varchar", { length: 17 })
	VIN: string;

	@OneToMany(() => Rent, (rent) => rent.scooter)
	rents: Rent[];
}
