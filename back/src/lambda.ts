import * as fsType from 'fs';
import * as mkdirpType from 'mkdirp';
import * as streamType from 'stream';
import * as rimrafType from 'rimraf';
import * as child_processType from 'child_process';
import * as path from 'path';

function resolver<T, U>(resolve: (value: U) => void, reject: (err: any) => void, map?: (value: T) => U) {
    return (err: any, value?: T): void => {
        if (err) return reject(err);
        resolve(map ? map(value): <U><any>value);
    };
}

interface ILambda {
    handler: Function;
    dependencies?: string[];
}

export class LambdaService {

    constructor (private fs: typeof fsType,
                 private mkdirp: typeof mkdirpType,
                 private rimraf: typeof rimrafType,
                 private child_process: typeof child_processType) {

    }

    run(name: string, vars: any): any {
        return this.grabLambda(name).then(lambda => lambda.handler(vars));
    }

    scan(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            this.fs.readdir(__dirname + '/../../lambdas/', resolver(resolve, reject));
        });
    }

    read(name: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.fs.readFile(__dirname + '/../../lambdas/' + name + '/index.js',
                resolver<Buffer, string>(resolve, reject, value => value.toString('utf8')));
        });
    }

    write(name: string, body: streamType.Readable): Promise<{}> {
        return new Promise((resolve, reject) => {
            this.mkdirp(__dirname + '/../../lambdas/' + name, err => {
                if (err) return reject(err);
                const file = this.fs.createWriteStream(__dirname + '/../../lambdas/' + name + '/index.js');
                body.pipe(file).on('finish', () => resolve(null)).on('error', reject);
            });
        });
    }

    remove(name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.rimraf(__dirname + '/../../lambdas/' + name, resolver(resolve, reject));
        });
    }

    private lambdaCache: {[key: string]: {mtime: Date}} = {};

    private grabLambda(name: string): Promise<ILambda> {
        const lambdaPath = path.normalize(`${__dirname}/../../lambdas/${name}`);
        return new Promise<boolean>((resolve, reject) => {
            this.fs.stat(lambdaPath + '/index.js', resolver<fsType.Stats, boolean>(resolve, reject, stats => {
                const result = !this.lambdaCache.hasOwnProperty(name) || this.lambdaCache[name].mtime.getTime() !== stats.mtime.getTime();
                this.lambdaCache[name] = {
                    mtime: stats.mtime
                };
                return result;
            }));
        }).then(shouldReload => {
            if (shouldReload) {
                console.log(`Reloading lambda: ${name}`);
                delete require.cache[require.resolve(lambdaPath)];
                const lambda: ILambda = require(lambdaPath);
                if (!lambda.dependencies) {
                    lambda.dependencies = [];
                }
                return this.runNpmInstall(lambda, lambdaPath);
            }
        }).then(() => {
            return require(lambdaPath);
        });
    }

    private runNpmInstall(lambda: ILambda, lambdaPath: string) {
        return new Promise((resolve, reject) => {
            if (lambda.dependencies.length > 0) {
                this.mkdirp(path.normalize(lambdaPath + '/node_modules'), resolver(resolve, reject));
            } else {
                resolve();
            }
        }).then(() => new Promise((resolve, reject) => {
            const child = this.child_process.spawn('npm', ['install', ...lambda.dependencies], {
                cwd: path.normalize(lambdaPath)
            });
            child.on('exit', resolve);
            child.on('error', reject);
        }));
    }
}
