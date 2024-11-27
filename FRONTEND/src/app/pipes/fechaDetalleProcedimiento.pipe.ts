import { Pipe, PipeTransform } from '@angular/core';
import * as moment from "moment";

@Pipe({
  name: 'fechahoraPipe'
})
export class FechaProcedimientoPipe implements PipeTransform {

  transform(value: unknown, formato: string = 'fecha', ...args: unknown[]): unknown {
    if (value !== undefined && value !== null) {
      if (formato === 'fecha') {
        return moment(value).format("DD/MM/yyyy");
      } else if (formato === 'hora') {
        return moment(value).format("hh:mm a");
      }
    }
    return "Sin fecha";
  }
}
