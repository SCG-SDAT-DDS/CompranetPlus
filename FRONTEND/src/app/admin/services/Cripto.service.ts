import {Injectable} from '@angular/core';
import * as CryptoJS from 'crypto-js';

const SECRET_KEY = 'secret_key';

@Injectable({
    providedIn: 'root'
})
export class CriptoService {

    constructor() {
    }

    encrypt(data:any) {
        if (data === undefined || data === null) {
            return "";
        }
        return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
    }

    decrypt(data:any) {
        if (data === undefined || data === null) {
            return "";
        }
        try {
            return JSON.parse(CryptoJS.AES.decrypt(data, SECRET_KEY).toString(CryptoJS.enc.Utf8));
        } catch (e) {
            return "";
        }
    }

}
