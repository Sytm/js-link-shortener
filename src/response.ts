export class JsonResponse {

    constructor(public state: State, public message: string, public id: string) {
    }
}

export const enum State {
    ERROR = 'error',
    INVALID = 'invalid',
    SUCCESS = 'success'
}