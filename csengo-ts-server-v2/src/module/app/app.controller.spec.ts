import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Test suite
// The describe function is used to define a test suite.
// The first argument is the name of the test suite, and the second argument is a callback function that contains the test cases.
// The test suite is used to group related test cases together.
//
describe('AppController', () => {
    let appController: AppController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [
                {
                    provide: AppService,
                    useValue: {
                        getHello: jest.fn().mockReturnValue('Hello World!'),
                    },
                },
            ],
        }).compile();

        appController = module.get<AppController>(AppController);
    });

    it('should be defined', () => {
        expect(appController).toBeDefined();
    });

    it('should return "Hello World!" when getHello is called', () => {
        expect(appController.getHello()).toBe('Hello World!');
    });
});
