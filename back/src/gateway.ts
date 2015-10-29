import * as expressType from 'express';
import * as uuid from 'uuid';
import * as fsType from 'fs';
import {assign} from 'lodash';
import {LambdaService as LambdaServiceType} from './lambda';

export interface ILambdaParams {
    [key: string]: [string, string];
}

export interface IAddApi {
    method: string;
    path: string;
    params: ILambdaParams;
    lambda: string;
    uuid?: string;
}

export class GatewayService {

    private _router: expressType.Router = this.express.Router();
    private routes: IAddApi[] = [];

    constructor (private express: typeof expressType,
                 private fs: typeof fsType,
                 private lambdaService: LambdaServiceType) {
        this.loadJson();
    }

    list(): IAddApi[] {
        return this.routes;
    }

    add(route: IAddApi) {
        const gateway = <IAddApi>assign({uuid: uuid()}, route);
        this.routes.push(gateway);
        this.clearRouter();
        this.applyRoutes();
        return this.saveJson().then(() => gateway);
    }

    save(uuid: string, route: IAddApi) {
        const savedRoute = this.routes.filter(route => route.uuid === uuid)[0];
        if (savedRoute) {
            savedRoute.method = route.method;
            savedRoute.path = route.path;
            savedRoute.params = route.params;
            savedRoute.lambda = route.lambda;
            this.clearRouter();
            this.applyRoutes();
            return this.saveJson();
        }
        return Promise.resolve();
    }

    remove(uuid: string) {
        const matchingRoutes = this.routes.filter(route => route.uuid === uuid);
        if (matchingRoutes.length) {
            const index = this.routes.indexOf(matchingRoutes[0]);
            this.routes.splice(index, 1);
        } else {
            throw new Error(`Route with uuid ${uuid} not found`);
        }
        this.clearRouter();
        this.applyRoutes();
        return this.saveJson();
    }

    get router() {
        return this._router;
    }

    private loadJson() {
        try {
            this.routes = require(__dirname + '/../../routes.json');
            this.applyRoutes();
        } catch (e) {
            this.routes = [];
        }
    }

    private saveJson(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.fs.writeFile(__dirname + '/../../routes.json', JSON.stringify(this.routes), (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    private applyRoutes() {
        this.routes.forEach(route => {
            switch (route.method) {
                case 'get':
                    this.router.get(route.path, this.createRequestHandler(route));
                    break;
                case 'post':
                    this.router.post(route.path, this.createRequestHandler(route));
                    break;
                case 'put':
                    this.router.put(route.path, this.createRequestHandler(route));
                    break;
                case 'patch':
                    this.router.patch(route.path, this.createRequestHandler(route));
                    break;
                case 'delete':
                    this.router.delete(route.path, this.createRequestHandler(route));
                    break;
                case 'head':
                    this.router.head(route.path, this.createRequestHandler(route));
                    break;
            }
        });
    }

    private createRequestHandler(route: IAddApi): expressType.RequestHandler {
        return (req, res) => {
            this.lambdaService.run(route.lambda, this.extractParamsFromRequest(req, route.params))
                .then((value: any)  => res.json(value))
                .catch((err: any) => res.status(500).json(err));
        }
    }

    private clearRouter() {
        (<any> this._router).stack.length = 0;
    }

    private extractParamsFromRequest(req: expressType.Request, params: ILambdaParams) {
        return Object.keys(params).reduce((prev, key) => {
            prev[key] = (<any> req)[params[key][0]][params[key][1]];
            return prev;
        }, <{[key: string]: string}>{});
    }
}
