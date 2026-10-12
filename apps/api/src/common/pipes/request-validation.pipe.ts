import {
    PipeTransform,
    Injectable,
    ArgumentMetadata
} from '@nestjs/common';

@Injectable()
export class ValidationPipe implements PipeTransform {
    transform(value: any, metada: ArgumentMetadata) {
        return value;
    }
}