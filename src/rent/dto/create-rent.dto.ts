import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";
export class CreateRentDto {
	@ApiProperty({
		type: String,
	})
	@IsUUID()
	userId: string;

	@ApiProperty({
		type: String,
	})
	@IsUUID()
	scooterId: string;
}
