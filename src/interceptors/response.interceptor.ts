import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map } from "rxjs/operators";

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
	intercept(context: ExecutionContext, next: CallHandler<T>) {
		const response = context.switchToHttp().getResponse();
		return next.handle().pipe(
			map((data) => ({
				statusCode: response.statusCode,
				message: response.customMessage || "Operation successful",
				data: data ?? null,
			}))
		);
	}
}
