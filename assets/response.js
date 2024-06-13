export default class Response{
    constructor(result={},responseMessage='Opreation Completed'){
        this.result = result || {},
        this.responseMessage= responseMessage?responseMessage:'Opreation Completed';
        this.responseCode  = 200;
    }
}