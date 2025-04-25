import registerMetaRoutes from "./controller.js";
class App {
    name = '@tsdiapi/prisma-rest';
    config;
    context;
    services = [];
    allModels = false;
    allMethods = false;
    allIps = false;
    constructor(options) {
        this.config = this.initializeConfig(options);
    }
    initializeConfig(options) {
        const defaultConfig = {
            availableMethods: [],
            availableModels: [],
            allowedIps: [],
            enabled: true,
            guard: 'admin'
        };
        if (!options)
            return defaultConfig;
        return {
            ...defaultConfig,
            availableMethods: this.parseConfigValue(options.availableMethods || []),
            availableModels: this.parseConfigValue(options.availableModels || []),
            allowedIps: this.parseConfigValue(options.allowedIps || []),
            enabled: options.enabled ?? defaultConfig.enabled,
            guard: options.guard || defaultConfig.guard
        };
    }
    parseConfigValue(value) {
        if (!value)
            return [];
        if (Array.isArray(value))
            return value.map(item => item.trim());
        return value.split(',').map(item => item.trim());
    }
    checkWildcard(values) {
        return values.includes('*');
    }
    async onInit(ctx) {
        this.context = ctx;
        const appConfig = this.context.projectConfig.getConfig({
            PRISMA_REST_METHODS: this.config.availableMethods.join(',') || '*',
            PRISMA_REST_MODELS: this.config.availableModels.join(',') || '*',
            PRISMA_REST_ALLOWED_IPS: this.config.allowedIps.join(',') || '127.0.0.1,::1',
            PRISMA_REST_ENABLED: this.config.enabled,
            PRISMA_REST_GUARD: this.config.guard
        });
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
        if (!this.config.enabled)
            return;
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
export default function createPlugin(config) {
    return new App(config);
}
//# sourceMappingURL=index.js.map