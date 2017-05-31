var Router = require("vertx-web-js/router");
var bodyHandler = require("vertx-web-js/body_handler");
var server = vertx.createHttpServer();
var router = Router.router(vertx);
var JWTAuth = require("vertx-auth-jwt-js/jwt_auth");
var JWTAuthHandler = require("vertx-web-js/jwt_auth_handler");
router.route().handler(bodyHandler.create().handle);

var authConfig = {
  "keyStore" : {
    "type" : "jceks",
    "path" : "keystore.jceks",
    "password" : "secret"
  }
};

var authProvider = JWTAuth.create(vertx, authConfig);

//Deploying all the worker verticles
vertx.deployVerticle("qna_read_verticle.js");
vertx.deployVerticle("qna_write_verticle.js");
vertx.deployVerticle("users_verticle.js");
vertx.deployVerticle("com.stackoverflow.auth.AuthVerticle");

//Get All Questions or Get Question by title
router.route().method("GET").path("/questions/").handler(function (routingContext){
	routingContext.response().putHeader("content-type","application/json");
	var query = routingContext.request().query();
	if(query != null && query.length != 0){
		var args = query.split("=");
		if(args != null && args.length == 2){
			vertx.eventBus().send("questions.search",{"title":args[1]},function(message,error){
				if(error == null){
					routingContext.response().putHeader("content-type","application/json").setStatusCode(message.body().status_code)
					.end(JSON.stringify(message.body().data));
				}else{
					routingContext.response.setStatusCode(error.failureCode()).end();
				}
			});
		}else{
			routingContext.response().setStatusCode(400).end();
		}
	}else{
		vertx.eventBus().send("questions.read",null,function(message, error){
			if(error == null){
				routingContext.response().putHeader("content-type","application/json").setStatusCode(message.body().status_code)
				.end(JSON.stringify(message.body().data));
			}else{
					routingContext.response.setStatusCode(error.failureCode()).end();
			}
		});
	}
});

//Get Question and Answers of a given question
router.route().method("GET").path("/questions/:id").handler(function(routingContext){
	var id = routingContext.request().getParam("id");
	vertx.eventBus().send("questions.read",{"_id":id},function(message, error){
		if(error == null){
			routingContext.response().putHeader("content-type","application/json").setStatusCode(message.body().status_code)
			.end(JSON.stringify(message.body().data));
		}else{
			routingContext.response().setStatusCode(error.failureCode()).end();
		}
	});
});

//Get Answers of a given question
router.route().method("GET").path("/questions/:id/answers/").handler(function(routingContext){
	var id = routingContext.request().getParam("id");
	if(id != null){
		vertx.eventBus().send("questions.read.answer",{"_id":id},function(message, error){
			if(error == null){
				routingContext.response().putHeader("content-type","application/json").setStatusCode(message.body().status_code)
				.end(JSON.stringify(message.body().data));
			}else{
				routingContext.response().setStatusCode(error.failureCode()).end();
			}
		});
	}
});

//Get user details
//Requires Authorization header
router.route().method("GET").path("/user/:username").handler(JWTAuthHandler.create(authProvider).handle);
router.route().method("GET").path("/user/:username").handler(function(routingContext){
	var id = routingContext.request().getParam("username");
	vertx.eventBus().send("users.get",{"username":id},function(message, error){
		if(error == null){
			routingContext.response().putHeader("content-type","application/json").setStatusCode(message.body().status_code).end(JSON.stringify(message.body().data));
		}else{
			routingContext.response().setStatusCode(error.failureCode()).end();
		}
	});
});

//Creates new user
router.route().method("POST").path("/user/").handler(function(routingContext){
	var jsonBody = routingContext.getBodyAsJson();
	if(jsonBody == null || jsonBody.length == 0)
		routingContext.response().setStatusCode(400).end();
	vertx.eventBus().send("users.add",jsonBody,function(message,error){
		if(message != null){
			routingContext.response().setStatusCode(message.body().status_code).end();
		}
	});
});

//Updates user details
//User details present in body in json format
router.route().method("PATCH").path("/user/:username").handler(JWTAuthHandler.create(authProvider).handle);
router.route().method("PATCH").path("/user/:username").handler(function(routingContext){
	var jsonBody = routingContext.getBodyAsJson();
	var id = routingContext.request().getParam("username");
	if(jsonBody == null || jsonBody.length == 0 || id == null || id.length == 0)
		routingContext.response().setStatusCode(400).end();
	vertx.eventBus().send("users.update",jsonBody,function(message,error){
		if(message != null){
			routingContext.response().setStatusCode(message.body().status_code).end();
		}
	});
});

//User login
//User details present in body in json format
//Response will be authorization header
router.route().method("POST").path("/login/").handler(function(routingContext){
	var creds = routingContext.getBodyAsJson();
	vertx.eventBus().send("token.generate",creds,function(message,error){
		if(error == null){
			routingContext.response().putHeader("content-type","application/json").setStatusCode(message.body().status_code)
				.end(message.body().data);
		}else{
			routingContext.response().setStatusCode(error.failureCode()).end();
		}
	});
});

//User logout
//Requires Authorization header
router.route().method("POST").path("/logout/").handler(JWTAuthHandler.create(authProvider).handle);
router.route().method("POST").path("/logout/").handler(function(routingContext){
	routingContext.response().setStatusCode(200).end();
});

//Post Question
//Requires Authorization header
//Question details in the body in json format
router.route().method("POST").path("/questions/").handler(JWTAuthHandler.create(authProvider).handle);
router.route().method("POST").path("/questions/").handler(function(routingContext){
	var questionAsString = routingContext.getBodyAsString()
	if(questionAsString == null || questionAsString.trim().length == 0)
		routingContext.response().setStatusCode(400).end();
	var question = routingContext.getBodyAsJson();
	if(question != null){
		if(!(question.hasOwnProperty("title") && question.hasOwnProperty("user_id")))
			routingContext.response().setStatusCode(400).end();
		vertx.eventBus().send("questions.post",question,function(message, error){
			if(error == null){
				routingContext.response().putHeader("content-type","application/json").setStatusCode(message.body().status_code).end();
			}else{
				routingContext.response().setStatusCode(error.failureCode()).end();
			}
		});
	}else
		routingContext.response().setStatusCode(400).end();
});

//Post answer for given question
//Answer details in body in json format
router.route().method("POST").path("/questions/:id/answers/").handler(JWTAuthHandler.create(authProvider).handle);
router.route().method("POST").path("/questions/:id/answers/").handler(function(routingContext){
	var id = routingContext.request().getParam("id");
	if(id == null || id.trim().length ==0)
		routingContext.response().setStatusCode(400).end();
	var answerAsString = routingContext.getBodyAsString()
	if(answerAsString == null || answerAsString.trim().length == 0)
		routingContext.response().setStatusCode(400).end();
	var answer = routingContext.getBodyAsJson();
	if(answer != null){
		if(!(answer.hasOwnProperty("answer") && answer.hasOwnProperty("user_id")))
			routingContext.response().setStatusCode(400).end();
		vertx.eventBus().send("answers.post",{"_id":id,"answer":answer},function(message,error){
			if(error == null){
				routingContext.response().putHeader("content-type","application/json").setStatusCode(message.body().status_code).end();
			}else{
				routingContext.response().setStatusCode(error.failureCode()).end();
			}
		});
	}
});


server.requestHandler(router.accept).listen(8080);