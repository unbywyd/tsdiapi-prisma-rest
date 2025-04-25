import type { AppContext, AppPlugin } from "@tsdiapi/server";
export type PluginOptions = {
    availableMethods?: string[] | string;
    availableModels?: string[] | string;
    allowedIps?: string[] | string;
    enabled?: boolean;
    guard?: string;
};
type Config = {
    availableMethods: string[];
    availableModels: string[];
    allowedIps: string[];
    enabled: boolean;
    guard: string;
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