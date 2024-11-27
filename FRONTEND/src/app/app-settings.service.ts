import { URLS_ENTORNOS } from "src/environments/urlsEntornos";
import {Injectable} from "@angular/core";
// import { TokenUtil } from './utils/token-util';

@Injectable({
  providedIn: 'root'
})
export class AppSettingsService {

  private ENTORNO = URLS_ENTORNOS.produccion;

  public HABILITAR_PROCEDIMIENTOS = true;

  public API_ENDPOINT = this.ENTORNO.API_ENDPOINT;
  public URL_FRONT = this.ENTORNO.URL_FRONT;

  getHeaders() {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };
  }

  getHeadersToken() {
    if(localStorage.getItem('tk_str')){
      return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE, PUT',
        'Authorization': ' Bearer ' + localStorage.getItem('tk_str')
      };
    }else{
      return this.getHeaders();
    }
  }

  getHeadersNotifications(restApiKey: string) {
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Basic {{' + restApiKey + '}}'
    };
  }

  getTypeMessageByCode(code: number): string {
    let type_message: string;
    switch (code) {
      case 301:
        type_message = 'alert-warning';
        break;
      case 200:
        type_message = 'alert-success';
        break;
      case 500:
        type_message = 'alert-danger';
        break;
      default:
        type_message = 'alert-warning';
        break;
    }
    return type_message;

  }

  detectMimeType(b64:string) {
    const signatures:any = {
      JVBERi0: "data:application/pdf;base64,",
      R0lGODdh: "data:image/gif;base64,",
      R0lGODlh: "data:image/gif;base64,",
      iVBORw0KGgo: "data:image/png;base64,",
      "/9j/": "data:image/jpg;base64,",
      UEs: "data:application/vnd.openxmlformats-officedocument.;base64,",
      PK: "data:application/zip;base64,",
    };
    for (let s in signatures) {
      if (b64.indexOf(s) === 0) {
        return signatures[s];
      }
    }
  }


}
