import { Pipe, PipeTransform } from '@angular/core';
import * as moment from "moment";

@Pipe({
  name: 'fechasPipe'
})
export class FechaPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    if (value !== undefined && value !== null) {
      return moment(value).format("DD/MM/yyyy hh:mm a");
    }
    return "Sin fecha";
  }

}
