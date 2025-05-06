import { breaker as defaultBreaker, rpcCheck, CircuitBreaker } from "./rpcService";

const sleep = (delay: number) => new Promise((resolve, _reject) => setTimeout(resolve, delay));

jest.useFakeTimers({});

describe("CircuitBreaker", () => {
    afterEach(() => {
        jest.resetAllMocks();
        jest.clearAllTimers();
    });

    it("rpcCheck() returns the singleton breaker's check result", async () => {
        expect(rpcCheck()).toEqual(defaultBreaker.check);

        await expect(defaultBreaker.call(async () => { throw new Error("") }))
                .rejects
                .toThrow("");

        expect(rpcCheck()).toEqual(defaultBreaker.check);
    });
    
    it("should remain closed on successful calls", async () => {
        const breaker = new CircuitBreaker();
        await breaker.call(async () => {});

        expect(breaker.check.status).toBe("UP");
        expect(breaker.check.circuit).toBe("CLOSED");
    });

    it("should record accurate latency readings", async () => {
        for(const sleepTime of [5, 100, 200, 1000]){
            const performanceSpy = jest.spyOn(performance, 'now')
                .mockImplementationOnce(() => 0)
                .mockImplementationOnce(() => 0)
                .mockImplementationOnce(() => 0)
                .mockImplementationOnce(() => sleepTime);
    
            const breaker = new CircuitBreaker();
            const resetSpy = jest.spyOn(breaker as any, 'reset');
            const callPromise = breaker.call(async () => await sleep(sleepTime));
    
            await jest.advanceTimersByTimeAsync(sleepTime);
    
            await callPromise;
    
            expect(performanceSpy).toHaveBeenCalledTimes(4);
            expect(resetSpy).toHaveBeenCalled();
            expect(breaker.check.latencyMs).toBeCloseTo(sleepTime, 0);

            jest.resetAllMocks();
            jest.clearAllTimers();
        }
    });

    it("should open the circuit after threshold failures", async () => {
        const failureThreshold = 3;
        const breaker = new CircuitBreaker(failureThreshold);
        expect(breaker.check.circuit).toBe("CLOSED");

        const failureSpy = jest.spyOn(breaker as any, 'recordFailure');

        for(let i = 0; i < failureThreshold; i++){
            await expect(breaker.call(async () => { throw new Error("") }))
                .rejects
                .toThrow("");

            if (i < failureThreshold - 1) {
                expect(breaker.check.circuit).toBe("CLOSED");
            }
        }

        expect(failureSpy).toHaveBeenCalledTimes(failureThreshold);
        expect(breaker.check.circuit).toBe("OPEN");

        await expect(
            breaker.call(async () => Promise.resolve("won't run"))
        ).rejects.toThrow("Circuit is open");
    });

    it("should mark status as DOWN and increment failureCount on each error", async () => {
        const breaker = new CircuitBreaker(5);
        expect(breaker.check.failureCount).toBe(0);
        expect(breaker.check.status).toBe("UP");
    
        await expect(breaker.call(async () => { throw new Error("fail1"); }))
          .rejects.toThrow("fail1");
        expect(breaker.check.failureCount).toBe(1);
        expect(breaker.check.status).toBe("DOWN");
        expect(breaker.check.circuit).toBe("CLOSED");
    
        await expect(breaker.call(async () => { throw new Error("fail2"); }))
          .rejects.toThrow("fail2");
        expect(breaker.check.failureCount).toBe(2);
        expect(breaker.check.circuit).toBe("CLOSED");
    });

    it("should record last failure time correctly", async () => {
        for(const startTime of [1, 100, 200, 1000]){
            jest.spyOn(performance, 'now')
                .mockImplementationOnce(() => startTime);

            const breaker = new CircuitBreaker();
            await expect(breaker.call(async () => { throw new Error("") }))
                .rejects
                .toThrow("");
    
            expect(breaker.check.lastFailureTime).toBeCloseTo(startTime);

            jest.resetAllMocks();
            jest.clearAllTimers();
        }
    });

    it("should reset state after successful call post cooldown", async () => {
        const cooldown = 300;
        const breaker = new CircuitBreaker(1, cooldown);

        const performanceSpy = jest.spyOn(performance, 'now');

        performanceSpy.mockImplementation(() => 0);
        const failureSpy = jest.spyOn(breaker as any, 'recordFailure');
        await expect(breaker.call(async () => { throw new Error("") }))
            .rejects
            .toThrow("");

        expect(failureSpy).toHaveBeenCalledTimes(1);
        expect(breaker.check.circuit).toBe("OPEN");
        expect(breaker.check.lastFailureTime).toBe(0);
        expect(breaker.check.status).toBe("DOWN");

        performanceSpy.mockImplementation(() => cooldown);
        expect(breaker.check.circuit).toBe("HALF_OPEN");
        expect(breaker.check.lastFailureTime).toBe(0);
        expect(breaker.check.status).toBe("DOWN");

        await breaker.call(async () => Promise.resolve());

        expect(breaker.check.circuit).toBe("CLOSED");
        expect(breaker.check.lastFailureTime).toBe(undefined);
        expect(breaker.check.failureCount).toBe(0);
    });
});
