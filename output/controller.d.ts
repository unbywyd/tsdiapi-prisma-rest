import { AppContext } from "@tsdiapi/server";
export type RegisterMetaRoutesOptions = {
    allModels: boolean;
    allMethods: boolean;
    allIps: boolean;
    availableModels: string[];
    availableMethods: string[];
    allowedIps: string[];
    guard?: string;
};
export default function registerMetaRoutes({ useRoute }: AppContext, options: RegisterMetaRoutesOptions): Promise<void>;
//# sourceMappingURL=controller.d.ts.map