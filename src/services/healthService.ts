import { Health } from "../types/health";
import { rpcCheck } from "./rpcService";

export const getServerHealth = (): Health => {
    const rpcHealth = rpcCheck();

    return {
        checks: {
            http: { status: "UP" },
            ethereumRpc: rpcHealth,
        },
        status: rpcHealth.status === "UP" ? "UP" : "DEGRADED",
    };
};