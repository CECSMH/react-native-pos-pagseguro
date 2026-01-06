

export type CustomError = {
    code: string,
    message: string
}

class CustomException extends Error {
    code: string;
    constructor(code: string, message: string) {
        super(message);
        this.code = code;
    }
};


export class PaymentError extends CustomException{};
export class PrintError extends CustomException{};
export class AbordError extends CustomException{};