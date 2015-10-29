import {ILambda} from './lambda';
import {IGateway, IGatewayForEdition} from './gateway';

export class LambdaStore {
    lambdas: string[] = [];
    selectedLambda: ILambda = null;
}

export class GatewayStore {
    gateways: IGateway[] = [];
    selectedGateway: IGatewayForEdition = null;
}
