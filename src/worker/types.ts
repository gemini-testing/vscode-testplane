export enum WorkerEvents {
    INIT_SUCCESS = "initialize_success",
    INIT_FAIL = "initialize_fail",
}

export type WorkerInitFailEventMessage = {
    error: string;
};
