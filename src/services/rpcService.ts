import { CircuitState, EthereumRpcCheck, HealthCheckStatus } from "../types/health";

export class CircuitBreaker {
    private failureCount = 0;
    private lastFailureTime?: number;
    private state: CircuitState = "CLOSED";
    private status: HealthCheckStatus = "UP";
    private latencyMs: number | undefined;

    constructor(private failureThreshold = 3, private cooldownTime = 30_000) {}

    public get check(): EthereumRpcCheck {
        return {
            status: this.status,
            circuit:  this.circuit,
            latencyMs: this.latencyMs,
            lastFailureTime: this.lastFailureTime,
            failureCount: this.failureCount,
        };
    }

    private get circuit() {
        const now = performance.now();
        if (this.state === "OPEN" && now >= this.lastFailureTime! + this.cooldownTime) {
            return "HALF_OPEN";
        }

        return this.state;
    }

    public async call<T>(fn: () => Promise<T>): Promise<T> {
        const now = performance.now();

        if (this.circuit === "OPEN") {
            throw new Error("Circuit is open");
        }
        
        try {
            const start = performance.now();
            const result = await fn();
            const end = performance.now();
            this.latencyMs = end - start;
            this.reset();
            return result;
        } catch (err: any) {
            this.recordFailure(now);
            throw err;
        }
    }

    private recordFailure(now: number) {
        this.failureCount++;
        this.lastFailureTime = now;
        this.status = "DOWN";
        if (this.failureCount >= this.failureThreshold) {
            this.state = "OPEN";
        }
    }

    private reset() {
        this.status = "UP";
        this.failureCount = 0;
        this.state = "CLOSED";
        this.lastFailureTime = undefined;
    }
}

export const breaker = new CircuitBreaker();
export const rpcCheck = (): EthereumRpcCheck => breaker.check;
