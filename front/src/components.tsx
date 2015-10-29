import {stateless} from './util';
import * as React from 'react';
import {ILambda} from './lambda';
import {IGateway, IGatewayForEdition} from './gateway';
import {LambdaStore as LambdaStoreType} from './stores';
import {GatewayStore as GatewayStoreType} from './stores';

export const Nav = stateless<{
    activeTab: string;
    setActiveTab: (tabName: string) => void;
}>('Nav', props =>
    <nav className="navbar navbar-inverse navbar-static-top">
        <div className="container">
            <div className="navbar-header">
                <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar">
                    <span className="sr-only">Toggle navigation</span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                </button>
                <a className="navbar-brand" href="#">My Lambdas</a>
            </div>
            <div id="navbar" className="collapse navbar-collapse">
                <ul className="nav navbar-nav">
                    <li className={props.activeTab === 'lambda' ? 'active' : ''}
                        onClick={event => props.setActiveTab('lambda')}>
                        <a>Lambda</a>
                    </li>
                    <li className={props.activeTab === 'gateway' ? 'active' : ''}
                        onClick={event => props.setActiveTab('gateway')}>
                        <a>Gateway</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
);

export const LambdaList = stateless<{
    lambdas: string[];
    selectLambda: (name: string) => void;
    createLambda: () => void;
    removeLambda: (name: string) => void;
}>('LambdaList', props =>
    <div>
        <ul className="list-group">
            {props.lambdas.map(lambdaName =>
                <li key={lambdaName}
                    className="list-group-item">
                    <button className="btn btn-default"
                            onClick={() => props.selectLambda(lambdaName)}>
                        Open
                    </button>
                    {lambdaName}
                    <button className="btn btn-danger pull-right"
                            onClick={() => props.removeLambda(lambdaName)}>
                        Remove
                    </button>
                </li>)}
        </ul>
        <button className="btn btn-primary"
                onClick={props.createLambda}>
            New
        </button>
    </div>
);

export const GatewayList = stateless<{
    gateways: IGateway[];
    selectGateway: (gateway: IGateway) => void;
    createNewGateway: () => void;
    removeGateway: (uuid: string) => void;
}>('GatewayList', props =>
    <div>
        <ul className="list-group">
            {props.gateways.map(gateway =>
                <li key={gateway.uuid}
                    className="list-group-item">
                    <button className="btn btn-default"
                            onClick={event => props.selectGateway(gateway)}>
                        Open
                    </button>
                    {gateway.method.toUpperCase()} {gateway.path}
                    <button className="btn btn-danger pull-right"
                            onClick={event => props.removeGateway(gateway.uuid)}>
                        Remove
                    </button>
                </li>)}
        </ul>
        <button className="btn btn-primary"
                onClick={props.createNewGateway}>
            New
        </button>
    </div>
);

export const LambdaEditor = stateless<{
    lambda: ILambda;
    setLambdaValue: (body: string) => void;
    saveLambda: Function;
}>('LambdaEditor', props =>
    props.lambda ?
        <div>
            <textarea style={{width: '100%', height: '500px'}}
                      className="form-control"
                      value={props.lambda.body}
                      onChange={event => props.setLambdaValue((event.target as any).value)} />
            <button className="btn btn-primary"
                    onClick={event => props.saveLambda()}>
                Save
            </button>
        </div> :
        false
);

export const GatewayEditor = stateless<{
    gateway: IGatewayForEdition;
    saveGateway: Function;
    setGatewayParam: (name: string, value: string) => void;
    changeGatewayMethod: (value: string) => void;
    changeGatewayPath: (value: string) => void;
    changeGatewayLambda: (value: string) => void;
    newGatewayParameter: () => void;
    removeGatewayParam: (paramName: string) => void;
}>('GatewayEditor', props =>
    props.gateway ?
        <div>
            <h2>gateway</h2>
            <div className="input-group">
                <span className="input-group-addon">Method</span>
                <input className="form-control"
                       value={props.gateway.method}
                       onChange={event => props.changeGatewayMethod((event.target as any).value)} />
            </div>
            <div className="input-group">
                <span className="input-group-addon">Path</span>
                <input className="form-control"
                       value={props.gateway.path}
                       onChange={event => props.changeGatewayPath((event.target as any).value)} />
           </div>
           <div className="input-group">
                <span className="input-group-addon">Lambda name</span>
                <input className="form-control"
                       value={props.gateway.lambda}
                       onChange={event => props.changeGatewayLambda((event.target as any).value)} />
           </div>
            {props.gateway.params
                .map(param =>
                <div key={param.name} className="input-group">
                    <span className="input-group-addon">Param: {param.name}</span>
                    <input className="form-control"
                           value={param.path}
                           onChange={event => props.setGatewayParam(param.name, (event.target as HTMLInputElement).value)}/>
                    <span className="input-group-btn">
                        <button className="btn btn-danger"
                                onClick={event => props.removeGatewayParam(param.name)}>
                            Remove
                        </button>
                    </span>
                </div>
            )}
            <div className="btn-group">
                <button className="btn btn-default"
                        onClick={props.newGatewayParameter}>
                    New parameter
                </button>
                <button className="btn btn-primary"
                        onClick={() => props.saveGateway()}>
                    Save
                </button>
            </div>
        </div> :
        false
);

export const LambdaAdminApplication = stateless<{
    lambdaStore: LambdaStoreType;
    gatewayStore: GatewayStoreType;
    selectLambda: (name: string) => void;
    setLambdaValue: (value: string) => void;
    saveLambda: Function;
    saveGateway: Function;
    selectGateway: (name: IGateway) => void;
    setGatewayParam: (name: string, value: string) => void;
    activeTab: string;
    setActiveTab: (tabName: string) => void;
    changeGatewayMethod: (value: string) => void;
    changeGatewayPath: (value: string) => void;
    changeGatewayLambda: (value: string) => void;
    createNewGateway: () => void;
    newGatewayParameter: () => void;
    removeGatewayParam: (paramName: string) => void;
    createLambda: () => void;
    removeLambda: (name: string) => void;
    removeGateway: (uuid: string) => void;
}>('LambdaAdminApplication', props =>
    <div>
        <Nav activeTab={props.activeTab} setActiveTab={props.setActiveTab}/>
        <div className="container">
            {props.activeTab === 'lambda' &&
                <div>
                    <h2>Lambda Editor</h2>
                    <LambdaList lambdas={props.lambdaStore.lambdas}
                                selectLambda={name => props.selectLambda(name)}
                                createLambda={props.createLambda}
                                removeLambda={props.removeLambda} />
                    <LambdaEditor lambda={props.lambdaStore.selectedLambda}
                                  setLambdaValue={props.setLambdaValue}
                                  saveLambda={props.saveLambda} />
                </div>}
            {props.activeTab === 'gateway' &&
                <div>
                    <h2>Gateway Editor</h2>
                    <GatewayList gateways={props.gatewayStore.gateways}
                                 selectGateway={gateway => props.selectGateway(gateway)}
                                 createNewGateway={props.createNewGateway}
                                 removeGateway={props.removeGateway} />
                    <GatewayEditor gateway={props.gatewayStore.selectedGateway}
                                   saveGateway={props.saveGateway}
                                   setGatewayParam={props.setGatewayParam}
                                   changeGatewayMethod={props.changeGatewayMethod}
                                   changeGatewayPath={props.changeGatewayPath}
                                   changeGatewayLambda={props.changeGatewayLambda}
                                   newGatewayParameter={props.newGatewayParameter}
                                   removeGatewayParam={props.removeGatewayParam}/>
                </div>}
        </div>
    </div>
);
