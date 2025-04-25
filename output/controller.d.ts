import { AppContext } from "@tsdiapi/server";
import { FilterFunction, ModelMapping } from "./index.js";
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
};
export default function registerMetaRoutes({ useRoute }: AppContext, options: RegisterMetaRoutesOptions): Promise<void>;
//# sourceMappingURL=controller.d.ts.map