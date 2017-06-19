var MongoClient = require("vertx-mongo-js/mongo_client");

vertx.eventBus().consumer("answers.post",function(message){
    var client = MongoClient.createShared(vertx, {"db_name":"stackoverflow","connection_string":"mongodb://10.128.0.8:27017"});
    client.update("question", {"_id":message.body()._id},{"$push":{"answers":message.body().answer}}, function (res, res_err) {
    if (res_err == null) {
        message.reply({"status_code":201,"data":res});
    }else{
        res_err.printStackTrace();
        message.fail(500,res_err.message);
    }
    });
});

vertx.eventBus().consumer("questions.post",function(message){
    var client = MongoClient.createShared(vertx, {"db_name":"stackoverflow","connection_string":"mongodb://10.128.0.8:27017"});
    client.insert("question", message.body(), function (res, res_err) {
    if (res_err == null) {
        message.reply({"status_code":201,"data":res});
    }else{
        res_err.printStackTrace();
        message.fail(500,res_err.message);
    }
    });
});