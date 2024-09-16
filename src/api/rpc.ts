import { createBirpc, type ChannelOptions } from "birpc";

import type {
    TestplaneMasterRPC,
    TestplaneMasterEvents,
    TestplaneWorkerMethods,
    TestplaneMasterHandlers,
} from "../types";

type Handler<T extends (...args: unknown[]) => void> = {
    handlers: T[];
    register: (listener: T) => void;
    trigger: (...args: unknown[]) => void;
    clear: () => void;
};

type RpcOptions = {
    events: TestplaneMasterEvents;
    handlers: TestplaneMasterHandlers;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createEventHandler = <T extends (...args: any[]) => void>(): Handler<T> => {
    const handlers: T[] = [];

    return {
        handlers,
        register: listener => handlers.push(listener),
        trigger: (...args) => handlers.forEach(handler => handler(...args)),
        clear: () => (handlers.length = 0),
    };
};

const createRpcOpts = (): RpcOptions => {
    const handlers = {
        onTestBegin: createEventHandler<TestplaneMasterEvents["onTestBegin"]>(),
        onTestPass: createEventHandler<TestplaneMasterEvents["onTestPass"]>(),
        onTestFail: createEventHandler<TestplaneMasterEvents["onTestFail"]>(),
        onTestPending: createEventHandler<TestplaneMasterEvents["onTestPending"]>(),
        onRunnerEnd: createEventHandler<TestplaneMasterEvents["onRunnerEnd"]>(),
    };

    const events: TestplaneMasterEvents = {
        onTestBegin: handlers.onTestBegin.trigger,
        onTestPass: handlers.onTestPass.trigger,
        onTestFail: handlers.onTestFail.trigger,
        onTestPending: handlers.onTestPending.trigger,
        onRunnerEnd: handlers.onRunnerEnd.trigger,
    };

    return {
        events,
        handlers: {
            onTestBegin: handlers.onTestBegin.register,
            onTestPass: handlers.onTestPass.register,
            onTestFail: handlers.onTestFail.register,
            onTestPending: handlers.onTestPending.register,
            onRunnerEnd: handlers.onRunnerEnd.register,
            clearListeners(): void {
                for (const name of Object.keys(handlers)) {
                    handlers[name as keyof TestplaneMasterEvents].clear();
                }
            },
        },
    };
};

export function createTestplaneMasterRpc(channel: ChannelOptions): {
    api: TestplaneMasterRPC;
    handlers: RpcOptions["handlers"];
} {
    const { events, handlers } = createRpcOpts();

    const api = createBirpc<TestplaneWorkerMethods, TestplaneMasterEvents>(events, {
        timeout: -1,
        ...channel,
    });

    return { api, handlers };
}
