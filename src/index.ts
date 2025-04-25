import type { AppContext, AppPlugin } from "@tsdiapi/server";
import registerMetaRoutes from "./controller.js";

export type PluginOptions = {
    availableMethods: string[];
    availableModels: string[];
    allowedIps: string[];
    enabled: boolean;
    guard?: string;
}

class App implements AppPlugin {
    name = '@tsdiapi/prisma-rest';
    config: PluginOptions;
    context: AppContext;
    services: AppPlugin['services'] = [];
    allModels: boolean = false;
    allMethods: boolean = false;
    allIps: boolean = false;
    constructor(config?: PluginOptions) {
        this.config = { ...config };
    }
    async onInit(ctx: AppContext) {
        this.context = ctx;
        const appConfig = this.context.projectConfig.getConfig({
            PRISMA_REST_METHODS: '*',
            PRISMA_REST_MODELS: '*',
            PRISMA_REST_ALLOWED_IPS: '127.0.0.1,::1',
            PRISMA_REST_ENABLED: true,
            PRISMA_REST_GUARD: 'admin'
        }) as {
            PRISMA_REST_METHODS: string;
            PRISMA_REST_MODELS: string;
            PRISMA_REST_ALLOWED_IPS: string;
            PRISMA_REST_ENABLED: boolean;
            PRISMA_REST_GUARD: string;
        };

        this.config.availableMethods = appConfig.PRISMA_REST_METHODS.split(',').map(method => method.trim());
        this.config.availableModels = appConfig.PRISMA_REST_MODELS.split(',').map(model => model.trim());
        this.config.allowedIps = appConfig.PRISMA_REST_ALLOWED_IPS.split(',').map(ip => ip.trim());
        this.config.enabled = appConfig.PRISMA_REST_ENABLED;

        if (this.config.availableMethods.includes('*')) {
            this.allMethods = true;
        }

        if (this.config.availableModels.includes('*')) {
            this.allModels = true;
        }

        if (this.config.allowedIps.includes('*')) {
            this.allIps = true;
        }

    }
    async preReady() {
        if (this.config.enabled) {
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
}

export default function createPlugin(config?: PluginOptions) {
    return new App(config);
}