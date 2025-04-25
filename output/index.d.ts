import type { AppContext, AppPlugin } from "@tsdiapi/server";
export type PluginOptions = {
    availableMethods: string[];
    availableModels: string[];
    allowedIps: string[];
    enabled: boolean;
    guard?: string;
};
declare class App implements AppPlugin {
    name: string;
    config: PluginOptions;
    context: AppContext;
    services: AppPlugin['services'];
    allModels: boolean;
    allMethods: boolean;
    allIps: boolean;
    constructor(config?: PluginOptions);
    onInit(ctx: AppContext): Promise<void>;
    preReady(): Promise<void>;
}
export default function createPlugin(config?: PluginOptions): App;
export {};
//# sourceMappingURL=index.d.ts.map