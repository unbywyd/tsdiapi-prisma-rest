import type { AppContext, AppPlugin } from "@tsdiapi/server";
import registerMetaRoutes from "./controller.js";

export type PluginOptions = {
    availableMethods?: string[] | string;
    availableModels?: string[] | string;
    allowedIps?: string[] | string;
    enabled?: boolean;
    guard?: string;
}

type Config = {
    availableMethods: string[];
    availableModels: string[];
    allowedIps: string[];
    enabled: boolean;
    guard: string;
}

class App implements AppPlugin {
    name = '@tsdiapi/prisma-rest';
    config: Config;
    private context: AppContext;
    services: AppPlugin['services'] = [];
    private allModels: boolean = false;
    private allMethods: boolean = false;
    private allIps: boolean = false;

    constructor(options?: PluginOptions) {
        this.config = this.initializeConfig(options);
    }

    private initializeConfig(options?: PluginOptions): Config {
        const defaultConfig: Config = {
            availableMethods: [],
            availableModels: [],
            allowedIps: [],
            enabled: false,
            guard: 'admin'
        };

        if (!options) return defaultConfig;

        return {
            ...defaultConfig,
            availableMethods: this.parseConfigValue(options.availableMethods || []),
            availableModels: this.parseConfigValue(options.availableModels || []),
            allowedIps: this.parseConfigValue(options.allowedIps || []),
            enabled: options.enabled ?? defaultConfig.enabled,
            guard: options.guard || defaultConfig.guard
        };
    }

    private parseConfigValue(value: string[] | string | undefined): string[] {
        if (!value) return [];
        if (Array.isArray(value)) return value.map(item => item.trim());
        return value.split(',').map(item => item.trim());
    }

    private checkWildcard(values: string[]): boolean {
        return values.includes('*');
    }

    async onInit(ctx: AppContext) {
        this.context = ctx;
        const methods = this.context.projectConfig.get('PRISMA_REST_METHODS', this.config.availableMethods.join(',') || '*') as string;
        const models = this.context.projectConfig.get('PRISMA_REST_MODELS', this.config.availableModels.join(',') || '*') as string;
        const ips = this.context.projectConfig.get('PRISMA_REST_ALLOWED_IPS', this.config.allowedIps.join(',') || '127.0.0.1,::1') as string;
        const enabled = this.context.projectConfig.get('PRISMA_REST_ENABLED', this.config.enabled) as boolean;
        const guard = this.context.projectConfig.get('PRISMA_REST_GUARD', this.config.guard) as string;

        this.config.availableMethods = this.parseConfigValue(methods);
        this.config.availableModels = this.parseConfigValue(models);
        this.config.allowedIps = this.parseConfigValue(ips);
        this.config.enabled = enabled;
        this.config.guard = guard;

        this.allMethods = this.checkWildcard(this.config.availableMethods);
        this.allModels = this.checkWildcard(this.config.availableModels);
        this.allIps = this.checkWildcard(this.config.allowedIps);
    }

    async preReady() {
        if (!this.config.enabled) return;

        await registerMetaRoutes(this.context, {
            allModels: this.allModels,
            allMethods: this.allMethods,
            allIps: this.allIps,
            availableModels: this.config.availableModels,
            availableMethods: this.config.availableMethods,
            allowedIps: this.config.allowedIps,
            guard: this.config.guard
        });
    }
}

export default function createPlugin(config?: PluginOptions) {
    return new App(config);
}