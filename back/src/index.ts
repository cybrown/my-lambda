import * as express from 'express';
import {LambdaService} from './lambda';
import {tap} from 'lodash';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import {GatewayService} from './gateway';
import * as bodyParser from 'body-parser';
import * as rimraf from 'rimraf';
import * as child_process from 'child_process';

const standardBodyParsers = [bodyParser.json(), bodyParser.urlencoded({extended: false})];

const lambdaService = (() => new LambdaService(fs, mkdirp, rimraf, child_process))();

const gatewayService = (() => new GatewayService(express, fs, lambdaService))();

const lambdaController = (() => tap(express.Router(), router => {

    router
        .post('/run/:name', ...standardBodyParsers, (req, res) =>
            lambdaService.run(req.params['name'], req.body)
                .then((result: any) => res.send(result))
                .catch((err: any) => res.status(500).send(err)))
        .get('/', (req, res) =>
            lambdaService.scan()
                .then(files => res.json(files))
                .catch((err: any) => res.status(500).send(err)))
        .get('/:name', (req, res) =>
            lambdaService.read(req.params['name'])
                .then(result => res.send(result))
                .catch((err: any) => res.status(500).send(err)))
        .put('/:name', (req, res) =>
            lambdaService.write(req.params['name'], req)
                .then(() => res.status(204).send(''))
                .catch(err => res.status(500).send(err)))
        .delete('/:name', (req, res) =>
            lambdaService.remove(req.params['name'])
                .then(() => res.status(204).send(''))
                .catch(err => res.status(500).send(err)))
}))();

const staticRessources = (() => express.static(__dirname + '/../../front/public'))()

const gatewayController = (() => tap(express.Router(), router => {

    router
        .post('/', ...standardBodyParsers, (req, res) =>
            gatewayService.add(req.body)
                .then(gateway => res.status(201).json(gateway))
                .catch((err: any) => res.status(500).send(err)))
        .put('/:uuid', ...standardBodyParsers, (req, res) =>
            gatewayService.save(req.params.uuid, req.body)
                .then(() => res.status(200).send(''))
                .catch((err: any) => res.status(500).send(err)))
        .get('/', (req, res) =>
            res.json(gatewayService.list()))
        .delete('/:uuid', (req, res) =>
            gatewayService.remove(req.params.uuid)
                .then(() => res.status(204).send(''))
                .catch((err: any) => res.status(500).send(err)));
}))()

const app = ((
    routers: [string, express.Router][],
    staticRessources: express.Handler
) => tap(express(), app => {
    app.use(staticRessources);
    routers.forEach(router => app.use(router[0], router[1]));
}))(
    [
        ['/lambda', lambdaController],
        ['/api', gatewayService.router],
        ['/gateway', gatewayController]
    ],
    staticRessources
);

app.listen(3000);
