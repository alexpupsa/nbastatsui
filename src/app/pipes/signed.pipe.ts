import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'signed' })
export class SignedPipe implements PipeTransform {
    transform(input: string): string {
        return !input.startsWith('-') ? `+${input}` : input;
    }
}
