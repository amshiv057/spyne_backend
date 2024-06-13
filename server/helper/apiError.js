import error from "./error";

class apiError extends Error{
    constructor(responseCode,responseMessage){
        super(responseMessage)
        this.responseCode = responseCode,
        this.responseMessage= responseMessage?responseMessage:error[responseCode] ||'Internal Server Error',
        this.isApiError =true;
    }

    static badRequest(msg){
        return new apiError(400,msg);
    }
}

module.exports =apiError;