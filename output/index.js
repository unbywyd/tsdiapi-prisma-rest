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
            enabled: false,
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
        const methods = this.context.projectConfig.get('PRISMA_REST_METHODS', this.config.availableMethods.join(',') || '*');
        const models = this.context.projectConfig.get('PRISMA_REST_MODELS', this.config.availableModels.join(',') || '*');
        const ips = this.context.projectConfig.get('PRISMA_REST_ALLOWED_IPS', this.config.allowedIps.join(',') || '127.0.0.1,::1');
        const enabled = this.context.projectConfig.get('PRISMA_REST_ENABLED', this.config.enabled);
        const guard = this.context.projectConfig.get('PRISMA_REST_GUARD', this.config.guard);
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