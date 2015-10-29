import {Http as HttpType} from './http';

export interface ILambda {
    name: string;
    body: string;
}

export class LambdaResource {

    constructor (private http: HttpType) {

    }

    findAll(): Promise<string[]> {
        return this.http.get<string[]>('/lambda').then(r => r.data);
    }

    findByName(name: string): Promise<ILambda> {
        return this.http.get<string>(`/lambda/${name}`).then(r => ({name, body: r.data}));
    }

    saveWithName(name: string, data: string): Promise<{}> {
        return this.http.put<{}>(`/lambda/${name}`, data);
    }

    deleteByName(name: string): Promise<void> {
        return this.http.delete(`/lambda/${name}`).then(r => undefined);
    }
}
