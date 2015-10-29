import {Http as HttpType} from './http';

export interface IGateway {
    uuid: string;
    method: string;
    path: string;
    lambda: string;
    params: {
        [name: string]: string[]
    }
}

export interface IGatewayForEditionParameter {
    name: string;
    path: string;
}

export interface IGatewayForEdition {
    uuid: string;
    method: string;
    path: string;
    lambda: string;
    params: IGatewayForEditionParameter[]
}

export class GatewayResource {

    constructor (private http: HttpType) {

    }

    findAll(): Promise<IGateway[]> {
        return this.http.get('/gateway').then(r => r.data);
    }

    saveByUuid(uuid: string, gateway: IGateway): Promise<{}> {
        return this.http.put<{}>(`/gateway/${uuid}`, gateway);
    }

    create(gateway: IGateway): Promise<IGateway> {
        return this.http.post<IGateway>(`/gateway`, gateway).then(r => r.data);
    }

    deleteByUuid(uuid: string): Promise<void> {
        return this.http.delete(`/gateway/${uuid}`).then(r => undefined);
    }
}
