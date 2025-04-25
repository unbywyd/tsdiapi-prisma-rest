import type { AppContext, AppPlugin, RequestWithState } from "@tsdiapi/server";
export type FilterFunction = <T = any>(model: string, method: string, request: T, req: RequestWithState) => Promise<T>;
export type ModelMapping = {
    [key: string]: {
        allowedMethods?: string[];
        allowedIps?: string[];
        filter?: FilterFunction;
    };
};
export type PluginOptions = {
    availableMethods?: string[] | string;
    availableModels?: string[] | string;
    allowedIps?: string[] | string;
    enabled?: boolean;
    guard?: string;
    filter?: FilterFunction;
    access?: ModelMapping;
};
type Config = {
    availableMethods: string[];
    availableModels: string[];
    allowedIps: string[];
    enabled: boolean;
    guard: string;
    filter?: FilterFunction;
    access: ModelMapping;
};
declare class App implements AppPlugin {
    name: string;
    config: Config;
    private context;
    services: AppPlugin['services'];
    private allModels;
    private allMethods;
    private allIps;
    constructor(options?: PluginOptions);
    private initializeConfig;
    private parseConfigValue;
    private checkWildcard;
    onInit(ctx: AppContext): Promise<void>;
    preReady(): Promise<void>;
}
export default function createPlugin(config?: PluginOptions): App;
export {};
//# sourceMappingURL=index.d.ts.map