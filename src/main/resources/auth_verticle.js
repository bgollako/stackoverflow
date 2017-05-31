var JWTAuth = require("vertx-auth-jwt-js/jwt_auth");


//username and password in json format as message
//checks the username and password from db
//returns unique token
vertx.eventBus().consumer("token.generate", function(message){
    vertx.eventBus().send("users.get",message.body(),function(mess, error){
      if(error == null){
          if(mess.body().data.length != 0){
            var config = {
              "keyStore" : {
                "path" : "keystore.jceks",
                "type" : "jceks",
                "password" : "secret"
              }
            };
            var provider = JWTAuth.create(vertx, config);
            var token = provider.generateToken({"username":mess.body().data[0].username},{"algorithm":"HS256","expiresInSeconds":"180000"});
            message.reply({"status_code":200,"data":token});
        }else
          message.fail(403,"Invalid Login");
      }else{
        message.fail(500,error.message);
      }
    });
});

//authorization token and username in json format as message
//validates the token
vertx.eventBus().consumer("token.validate", function(message){
    
});