import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../users/user.entity";
import { Scooter } from "src/scooters/scooter.entity";

@Entity("rents")
export class Rent {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@ManyToOne(() => User, (user) => user.rents)
	@JoinColumn({ name: "user_id" })
	user: User;

	@ManyToOne(() => Scooter, (scooter) => scooter.rents)
	@JoinColumn({ name: "scooter_id" })
	scooter: Scooter;

	@Column("timestamptz", { nullable: false, default: () => "CURRENT_TIMESTAMP" })
	start_at: Date;

	@Column("timestamptz", { nullable: true })
	end_at: Date;
}
