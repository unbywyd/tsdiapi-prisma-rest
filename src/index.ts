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
            enabled: true,
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
        const appConfig = this.context.projectConfig.getConfig({
            PRISMA_REST_METHODS: this.config.availableMethods.join(',') || '*',
            PRISMA_REST_MODELS: this.config.availableModels.join(',') || '*',
            PRISMA_REST_ALLOWED_IPS: this.config.allowedIps.join(',') || '127.0.0.1,::1',
            PRISMA_REST_ENABLED: this.config.enabled,
            PRISMA_REST_GUARD: this.config.guard
        }) as {
            PRISMA_REST_METHODS: string;
            PRISMA_REST_MODELS: string;
            PRISMA_REST_ALLOWED_IPS: string;
            PRISMA_REST_ENABLED: boolean;
            PRISMA_REST_GUARD: string;
        };

        this.config.availableMethods = this.parseConfigValue(appConfig.PRISMA_REST_METHODS);
        this.config.availableModels = this.parseConfigValue(appConfig.PRISMA_REST_MODELS);
        this.config.allowedIps = this.parseConfigValue(appConfig.PRISMA_REST_ALLOWED_IPS);
        this.config.enabled = appConfig.PRISMA_REST_ENABLED;
        this.config.guard = appConfig.PRISMA_REST_GUARD;

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