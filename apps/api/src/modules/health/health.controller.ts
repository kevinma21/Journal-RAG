import { Controller, Get, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { HealthService } from './health.service.js';

@Controller({
    path: 'health',
    version: '1',
})
export class HealthController {
    constructor(private readonly healthService: HealthService) {}

    @Get()
    getHealth () {
        return this.healthService.getHealth();
    }

    @Get('not-found')
    testNotFound() {
        throw new NotFoundException('Test resource not found');
    }

    @Get('error')
    testError() {
        throw new InternalServerErrorException('Test internal error');
    }

    @Get('unknown-error')
    testUnknownError() {
        throw new Error('This should not be exposed');
    }
}
