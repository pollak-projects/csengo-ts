import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// Controller
// The @Controller() decorator is used to define a controller.
// The controller is responsible for handling incoming requests and returning responses to the client.
// The controller is a class that contains methods that are responsible for handling requests.
// The @Controller() decorator takes an optional argument that specifies the base route for the controller.
// In this case, the base route is not specified, so the controller will handle requests to the root route.
// The controller class is exported so that it can be used in other parts of the application.
// The controller class contains a constructor that takes an instance of the AppService class as an argument.
//
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }
}
