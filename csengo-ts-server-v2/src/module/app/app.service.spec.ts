import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

// Test suite
// The describe function is used to define a test suite.
// The first argument is the name of the test suite, and the second argument is a callback function that contains the test cases.
describe('AppService', () => {
    let appService: AppService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AppService],
        }).compile();

        appService = module.get<AppService>(AppService);
    });

    it('should be defined', () => {
        expect(appService).toBeDefined();
    });

    it('should return "Hello World!" when getHello is called', () => {
        expect(appService.getHello()).toBe('Hello World!');
    });
});
