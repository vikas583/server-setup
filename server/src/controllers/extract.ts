import { Body, Controller, Post } from "routing-controllers";
import { Inject, Service } from "typedi";
// import { RabbitMqService } from "../services/RabbitMqService";

@Service()
@Controller('/extract')
export class ExtractController {

    constructor(
        // @Inject()
        // private readonly rabbitMqService: RabbitMqService
    ) {

    }


    @Post('/')
    async extract(
        // @Body() body: { type: string, url: string }
    ) {
        // await this.rabbitMqService.publishMessage('extract',body.url)
        // console.log(body)
        return true
    }
}