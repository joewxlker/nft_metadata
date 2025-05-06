import { EthereumRpcCheck } from "../types/health";
import { getServerHealth } from "./healthService";
import * as rpcService from "./rpcService";

describe("getServerHealth", () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it("is up when rpc is up", () => {
        const mockRpcHealth: EthereumRpcCheck = {
            circuit: "CLOSED",
            failureCount: 0,
            status: "UP",
            lastFailureTime: undefined,
            latencyMs: undefined
        };
    
        const mockRpcCheck = jest.spyOn(rpcService, 'rpcCheck')
            .mockImplementationOnce(() => mockRpcHealth);
    
        const result = getServerHealth();
    
        expect(mockRpcCheck).toHaveBeenCalledTimes(1);
        expect(result.checks.ethereumRpc.circuit).toBe(mockRpcHealth.circuit);
        expect(result.checks.ethereumRpc.failureCount).toBe(mockRpcHealth.failureCount);
        expect(result.checks.ethereumRpc.status).toBe(mockRpcHealth.status);
        expect(result.checks.ethereumRpc.lastFailureTime).toBe(mockRpcHealth.lastFailureTime);
        expect(result.checks.ethereumRpc.latencyMs).toBe(mockRpcHealth.latencyMs);
        expect(result.status).toBe("UP");
        expect(result.checks.http.status).toBe("UP");
    });

    it("is degraded when rpc is down", () => {
        const mockRpcHealth: EthereumRpcCheck = {
            circuit: "OPEN",
            failureCount: 0,
            status: "DOWN",
            lastFailureTime: undefined,
            latencyMs: undefined
        };
    
        const mockRpcCheck = jest.spyOn(rpcService, 'rpcCheck')
            .mockImplementationOnce(() => mockRpcHealth);
    
        const result = getServerHealth();
    
        expect(mockRpcCheck).toHaveBeenCalledTimes(1);
        expect(result.checks.ethereumRpc.circuit).toBe(mockRpcHealth.circuit);
        expect(result.checks.ethereumRpc.failureCount).toBe(mockRpcHealth.failureCount);
        expect(result.checks.ethereumRpc.status).toBe(mockRpcHealth.status);
        expect(result.checks.ethereumRpc.lastFailureTime).toBe(mockRpcHealth.lastFailureTime);
        expect(result.checks.ethereumRpc.latencyMs).toBe(mockRpcHealth.latencyMs);
        expect(result.status).toBe("DEGRADED");
        expect(result.checks.http.status).toBe("UP");
    });
});