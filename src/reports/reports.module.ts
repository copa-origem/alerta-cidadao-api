import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'RABBITMQ_SERVICE',
            }
        ])
    ]
})