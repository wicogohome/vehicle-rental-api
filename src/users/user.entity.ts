import { Entity, Column, PrimaryGeneratedColumn, Index, OneToMany } from "typeorm";
import { Rent } from "../rent/rent.entity";

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

	@OneToMany(() => Rent, (rent) => rent.user)
	rents: Rent[];
}
