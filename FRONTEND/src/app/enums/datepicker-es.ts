import { NgbDatepickerI18n, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

export class NgbDatepickerI18nSpanish extends NgbDatepickerI18n {
  getWeekdayShortName(weekday: number): string {
    const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return weekdays[weekday - 1];
  }

  getMonthShortName(month: number): string {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return months[month - 1];
  }

  getMonthFullName(month: number): string {
    return this.getMonthShortName(month);
  }

  getDayAriaLabel(date: NgbDateStruct): string {
    return `${date.day}-${date.month}-${date.year}`;
  }

  getWeekdayLabel(weekday: number): string {
    const weekdays = ['Lun', 'Mar', 'Miér', 'Jue', 'Vie', 'Sáb','Dom'];
    return weekdays[weekday - 1];
  }
}
