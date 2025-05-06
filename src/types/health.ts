export type HealthCheckStatus = "UP" | "DOWN" | "DEGRADED";
export type CircuitState = "OPEN" | "HALF_OPEN" | "CLOSED";

export interface EthereumRpcCheck {
    status: HealthCheckStatus;
    circuit: CircuitState;
    latencyMs?: number;
    lastFailureTime?: number;
    failureCount: number;
}

export interface Health {
    status: HealthCheckStatus;
    checks: {
        http: { status: HealthCheckStatus };
        ethereumRpc: EthereumRpcCheck;
    };
    version?: string;
    commitHash?: string;
}