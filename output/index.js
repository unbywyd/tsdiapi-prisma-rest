import registerMetaRoutes from "./controller.js";
class App {
    name = '@tsdiapi/prisma-rest';
    config;
    context;
    services = [];
    allModels = false;
    allMethods = false;
    allIps = false;
    constructor(config) {
        this.config = { ...config };
    }
    async onInit(ctx) {
        this.context = ctx;
        const appConfig = this.context.projectConfig.getConfig({
            PRISMA_REST_METHODS: '*',
            PRISMA_REST_MODELS: '*',
            PRISMA_REST_ALLOWED_IPS: '127.0.0.1,::1',
            PRISMA_REST_ENABLED: true,
            PRISMA_REST_GUARD: 'admin'
        });
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
export default function createPlugin(config) {
    return new App(config);
}
//# sourceMappingURL=index.js.map