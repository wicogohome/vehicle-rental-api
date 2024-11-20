import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RentModule } from './rent/rent.module';

@Module({
  imports: [RentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
