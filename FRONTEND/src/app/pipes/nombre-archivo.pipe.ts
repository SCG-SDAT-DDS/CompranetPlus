import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nombreArchivoPipe'
})
export class NombreArchivoPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    if (value !== undefined && value !== null) {
      return (value as string).split('/').pop()
    }
    return null;
  }

}
