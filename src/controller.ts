import { AppContext, ResponseErrorSchema, addSchema } from "@tsdiapi/server";
import { Type } from "@sinclair/typebox";
import { usePrisma } from "@tsdiapi/prisma";
import { FilterFunction, ModelMapping } from "./index.js";
import { HybridAuthGuard } from "@tsdiapi/jwt-auth";

export type RegisterMetaRoutesOptions = {
    allModels: boolean;
    allMethods: boolean;
    allIps: boolean;
    availableModels: string[];
    availableMethods: string[];
    allowedIps: string[];
    guard?: string;
    filter?: FilterFunction;
    access: ModelMapping;
}
export default async function registerMetaRoutes({ useRoute }: AppContext, options: RegisterMetaRoutesOptions) {
    const ModelParamSchema = addSchema(Type.Object({
        model: Type.String(),
        method: Type.String()
    }, { $id: 'PrismaRestModelParamSchema' }));

    const { availableMethods, availableModels, allowedIps, allMethods, allModels, allIps, guard } = options;

    const AnyResponseSchema = addSchema(Type.Object({}, {
        additionalProperties: true,
        $id: 'PrismaRestAnyResponseSchema'
    }));

    const AnyBodySchema = addSchema(Type.Object({}, {
        additionalProperties: true,
        $id: 'PrismaRestAnyBodySchema'
    }));

    useRoute("prisma")
        .post("/:method/:model")
        .version("1")
        .code(200, AnyResponseSchema)
        .code(400, ResponseErrorSchema)
        .code(403, ResponseErrorSchema)
        .code(500, ResponseErrorSchema)
        .params(ModelParamSchema)
        .body(AnyBodySchema)
        .auth('bearer')
        .guard(HybridAuthGuard({
            guardName: guard || 'admin'
        }))
        .guard(async (req) => {
            if (!allMethods && !availableMethods.includes(req.params.method)) {
                return { status: 400, data: { error: "Invalid method" } };
            }
            if (!allModels && !availableModels.includes(req.params.model)) {
                return { status: 400, data: { error: "Invalid model" } };
            }
            if (!allIps && !allowedIps.includes(req.ip)) {
                return { status: 403, data: { error: "Forbidden" } };
            }

            // Check if method is allowed for this specific model
            const modelConfig = options.access[req.params.model];
            if (modelConfig?.allowedMethods && !modelConfig.allowedMethods.includes(req.params.method)) {
                return { status: 400, data: { error: `Method ${req.params.method} is not allowed for model ${req.params.model}` } };
            }
            if (modelConfig?.allowedIps && !modelConfig.allowedIps.includes(req.ip)) {
                return { status: 403, data: { error: "Forbidden" } };
            }

            return true;
        })
        .handler(async (req) => {
            const prisma = usePrisma() as Record<string, any>;
            if (!prisma) {
                return { status: 500, data: { error: "Prisma client not found" } };
            }
            if (!prisma[req.params.model]) {
                return { status: 400, data: { error: "Model not found" } };
            }
            if (!prisma[req.params.model][req.params.method]) {
                return { status: 400, data: { error: "Model does not have this method" } };
            }

            try {
                let body = req.body;
                if (options.filter) {
                    try {
                        body = await options.filter(req.params.model, req.params.method, body, req);
                    } catch (error) {
                        return { status: 400, data: { error: error.message } };
                    }
                }
                if (options.access[req.params.model]?.filter) {
                    try {
                        body = await options.access[req.params.model].filter(req.params.model, req.params.method, body, req);
                    } catch (error) {
                        return { status: 400, data: { error: error.message } };
                    }
                }
                const result = await prisma[req.params.model][req.params.method](body);
                return { status: 200, data: result };
            } catch (error) {
                return { status: 400, data: { error: error.message } };
            }
        })
        .build();
}