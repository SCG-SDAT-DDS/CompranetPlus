export interface ICertificadoFiel {
    certificado_b64: string;
}

export interface IValidacionFiel {
    certificado_b64: string;
    key_b64: string;
    password: string;
    rfc_firmante: string;
}