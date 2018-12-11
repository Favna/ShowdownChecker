import fetch, { Response } from 'node-fetch';
import path from 'path';

interface IModule extends Function {
    _nodeModulePaths: any;
    new (url: string, parents: NodeModule | null): any;
}

export const need = async (url: string) => {
    const Module: IModule = module.constructor as IModule;
    const request: Response = await fetch(url);
    const body: string = await request.text();
    const m = new Module(url, module.parent);
    m.fileName = url;
    m.paths = Module._nodeModulePaths(path.dirname(url));
    m._compile(body, url);
    return m.exports;
};