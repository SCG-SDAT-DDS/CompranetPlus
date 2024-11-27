import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {AppSettingsService} from "../app-settings.service";
import { HttpClient } from "@angular/common/http";
import { IBusquedaBitacora } from '../interfaces/bitacora/IBusquedaBitacora';


@Injectable({
    providedIn: 'root'
})
export class BitacorasService {

    constructor(private _app: AppSettingsService,
                private _http: HttpClient) {

    }

    
    buscarBitacoras(params: IBusquedaBitacora): Observable<any> {
        return this._http.post(
            `${this._app.API_ENDPOINT}/api/bitacoras/buscarBitacoras`,
            params,
            {headers: this._app.getHeadersToken()}
        );
    }


}
