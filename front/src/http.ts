export interface IHttpRequest {
    method: string;
    path: string;
    headers: IHeaders;
    body: Object | string;
}

export interface IHttpResponse<T> {
    status: number;
    headers: {[key: string]: string};
    data: T;
}

export interface IHeaders {
    [key: string]: string;
}

export class Http {

    constructor(private root: string) {

    }

    get<T>(path: string): Promise<IHttpResponse<T>> {
        return this.sendRequest<T>({method: 'GET', path, headers: {}, body: null});
    }

    put<T>(path: string, body: any): Promise<IHttpResponse<T>> {
        return this.sendRequest<T>({method: 'PUT', path, headers: {}, body});
    }

    post<T>(path: string, body: any): Promise<IHttpResponse<T>> {
        return this.sendRequest<T>({method: 'POST', path, headers: {}, body});
    }

    delete<T>(path: string): Promise<IHttpResponse<T>> {
        return this.sendRequest<T>({method: 'DELETE', path, headers: {}, body: null});
    }

    private sendRequest<T>(request: IHttpRequest): Promise<IHttpResponse<T>> {
        request.path = this.root + request.path;
        return new Promise<IHttpResponse<T>>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(request.method, request.path);
            xhr.onreadystatechange = () => {
                try {
                    if (xhr.readyState === 4) {
                        let response: T;
                        try {
                            response = JSON.parse(xhr.responseText);
                        } catch (e) {
                            response = <any> xhr.responseText;
                        }
                        resolve(<IHttpResponse<T>> {
                            request: request,
                            status: xhr.status,
                            headers: this.parseHeaders(xhr.getAllResponseHeaders()),
                            data: response
                        });
                    }
                } catch (e) {
                    reject(e);
                }
            };
            const requestBody = this.convertForXhr(request.headers, request.body);
            Object.keys(request.headers).forEach(header => xhr.setRequestHeader(header, request.headers[header]));
            xhr.send(requestBody);
        }).then(response => {
            if (response.status < 200 && response.status >= 400) {
                throw response;
            }
            return response;
        });
    }

    private parseHeaders(rawHeaders: string): IHeaders {
        return rawHeaders.split('\n').map(header => {
            const index = header.indexOf(':');
            return [header.substring(0, index).trim(), header.substring(index + 1).trim()];
        }).filter(pair => pair[0] !== '').reduce((result, pair) => {
            result[pair[0]] = pair[1];
            return result;
        }, <{[key: string]: string}>{});
    }

    private convertForXhr(headers: IHeaders, data: Object | string): string {
        if (typeof data === 'object') {
            headers['Content-Type'] = 'application/json';
            return JSON.stringify(data);
        } else {
            return <string> data;
        }
    }
}
