import * as React from 'react';
import {Http} from './http';
import {LambdaResource, ILambda} from './lambda';
import {GatewayResource, IGateway, IGatewayForEdition} from './gateway';
import {LambdaStore, GatewayStore} from './stores';
import {LambdaAdminApplication} from './components';
import * as _ from 'lodash';

const tap = _.tap;

let activeTab = 'gateway';

const render = React.render;
const http = new Http();
const lambdaStore = new LambdaStore();
const reactMain = document.getElementById('react-main');
const lambdaResource = new LambdaResource(http);
const gatewayResource = new GatewayResource(http);
const gatewayStore = new GatewayStore();
const doRender = () => {
    console.log('Rendering...');
    render(<LambdaAdminApplication lambdaStore={lambdaStore}
                                   selectLambda={selectLambda}
                                   selectGateway={selectGateway}
                                   setLambdaValue={setLambdaValue}
                                   createLambda={createLambda}
                                   saveLambda={saveLambda}
                                   saveGateway={saveGateway}
                                   gatewayStore={gatewayStore}
                                   setGatewayParam={setGatewayParam}
                                   activeTab={activeTab}
                                   setActiveTab={setActiveTab}
                                   changeGatewayPath={changeGatewayPath}
                                   changeGatewayMethod={changeGatewayMethod}
                                   changeGatewayLambda={changeGatewayLambda}
                                   createNewGateway={createNewGateway}
                                   newGatewayParameter={newGatewayParameter}
                                   removeGatewayParam={removeGatewayParam}
                                   removeLambda={removeLambda}
                                   removeGateway={removeGateway}/>, reactMain);
}

function removeLambda(name: string) {
    return lambdaResource.deleteByName(name).then(refreshLambdas);
}

function removeGateway(uuid: string) {
    return gatewayResource.deleteByUuid(uuid).then(refreshGateways);
}

function refreshLambdas() {
    lambdaResource.findAll().then(lambdas => {
        lambdaStore.lambdas = lambdas;
        doRender();
    });
}

function refreshGateways() {
    gatewayResource.findAll().then(gateways => {
        gatewayStore.gateways = gateways;
        doRender();
    });
}

function createLambda() {
    const name = prompt();
    lambdaResource.saveWithName(name, '').then(refreshLambdas);
}

function newGatewayParameter() {
    const name = prompt();
    gatewayStore.selectedGateway.params.push({name: name, path: 'query.value'});
    doRender();
}

function removeGatewayParam(paramName: string) {
    _.remove(gatewayStore.selectedGateway.params, param => param.name === paramName);
    doRender();
}

function createNewGateway() {
    gatewayStore.selectedGateway = {
        uuid: undefined,
        method: 'get',
        path: '/path',
        lambda: 'myLambda',
        params: []
    };
    doRender();
}

function setGatewayParam(name: string, path: string): void {
    _.find(gatewayStore.selectedGateway.params, p => p.name === name).path = path;
    doRender();
}

function selectLambda(name: string) {
    lambdaResource.findByName(name).then(lambda => {
        lambdaStore.selectedLambda = lambda;
        doRender();
    });
}

function selectGateway(gateway: IGateway) {
    gatewayStore.selectedGateway = fromGateway(gateway);
    doRender();
}

function setLambdaValue(value: string) {
    lambdaStore.selectedLambda.body = value;
    doRender();
}

function saveLambda() {
    lambdaResource.saveWithName(lambdaStore.selectedLambda.name, lambdaStore.selectedLambda.body)
        .then(doRender);
}

function toGateway(editing: IGatewayForEdition): IGateway {
    return {
        uuid: editing.uuid,
        method: editing.method,
        path: editing.path,
        lambda: editing.lambda,
        params: editing.params.reduce((prev, cur) => tap(prev, () => prev[cur.name] = cur.path.split('.')), {} as {[key: string]: string[]}),
    };
}

function fromGateway(gateway: IGateway): IGatewayForEdition {
    return {
        uuid: gateway.uuid,
        method: gateway.method,
        path: gateway.path,
        lambda: gateway.lambda,
        params: Object.keys(gateway.params).map(key => ({name: key, path: gateway.params[key].join('.')}))
    };
}

function saveGateway() {
    if (gatewayStore.selectedGateway.uuid == null) {
        gatewayResource.create(toGateway(gatewayStore.selectedGateway)).then(gateway => {
            gatewayStore.selectedGateway = fromGateway(gateway);
            refreshGateways();
        });
    } else {
        gatewayResource.saveByUuid(gatewayStore.selectedGateway.uuid, toGateway(gatewayStore.selectedGateway))
            .then(refreshGateways);
    }
}

function setActiveTab(tabName: string): void {
    activeTab = tabName;
    doRender();
}

function changeGatewayMethod(value: string): void {
    gatewayStore.selectedGateway.method = value;
    doRender();
}

function changeGatewayPath(value: string): void {
    gatewayStore.selectedGateway.path = value;
    doRender();
}

function changeGatewayLambda(value: string): void {
    gatewayStore.selectedGateway.lambda = value;
    doRender();
}

refreshLambdas();
refreshGateways();
