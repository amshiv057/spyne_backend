const apiErrorHandler = (err,req,res,next)=>{
        if(err.isApiError){
            const responseCode = typeof err.responseCode === 'number'? err.responseCode : 500;
            res.status(responseCode).json({
                responseCode:responseCode,
                responseMessage:err.responseMessage?err.responseMessage:'Internal sever error'
            })
            return;
        }

      if(err.message == 'Validation Error'){
          res.status(502).json({
            responseCode:502,
            responseMessage:err.original?err.original.message:'Validation Error'
          })
          return;
      }
      const code = typeof err.code ==='number'?err.code:500;
      res.status(code).json({
        responseCode:code,
        responseMessage:err.message? err.message :'Internal server error'
      })
}

module.exports = apiErrorHandler;