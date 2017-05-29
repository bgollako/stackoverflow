var Router = require("vertx-web-js/router");
var server = vertx.createHttpServer();
var router = Router.router(vertx);
router.route().method("GET").path("/questions/").handler(function (routingContext){
	var response = routingContext.response();
	response.putHeader("content-type","text/plain");
	response.end("Get All Questions");
});
router.route().method("GET").path("/questions/:id").handler(function (routingContext){
	var response = routingContext.response();
	response.putHeader("content-type","text/plain");
	response.end("Get particular Question");
});
server.requestHandler(router.accept).listen(8080);