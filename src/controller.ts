import { AppContext, ResponseErrorSchema } from "@tsdiapi/server";
import { Type } from "@sinclair/typebox";
import { JWTGuard } from "@tsdiapi/jwt-auth";
import { usePrisma } from "@tsdiapi/prisma";

export type RegisterMetaRoutesOptions = {
    allModels: boolean;
    allMethods: boolean;
    allIps: boolean;
    availableModels: string[];
    availableMethods: string[];
    allowedIps: string[];
    guard?: string;
}
export default async function registerMetaRoutes({ useRoute }: AppContext, options: RegisterMetaRoutesOptions) {
    const ModelParamSchema = Type.Object({
        model: Type.String(),
        method: Type.String()
    });

    const { availableMethods, availableModels, allowedIps, allMethods, allModels, allIps, guard } = options;

    useRoute("prisma")
        .post("/:method/:model")
        .version("1")
        .code(200, Type.Any({
            default: {}
        }))
        .code(400, ResponseErrorSchema)
        .code(403, ResponseErrorSchema)
        .code(500, ResponseErrorSchema)
        .params(ModelParamSchema)
        .body(Type.Any({
            default: {}
        }))
        .auth('bearer')
        .guard(JWTGuard({
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
            return true;
        })
        .handler(async (req) => {
            const prisma = usePrisma<any>();
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
                const result = await prisma[req.params.model][req.params.method](req.body);
                return { status: 200, data: result };
            } catch (error) {
                return { status: 400, data: { error: error.message } };
            }
        })
        .build();
}