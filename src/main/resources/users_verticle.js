var MongoClient = require("vertx-mongo-js/mongo_client");

vertx.eventBus().consumer("users.get",function(message){
    var client = MongoClient.createShared(vertx, {"db_name":"stackoverflow","connection_string":"mongodb://104.197.213.109:27017"});
    client.find("user",{"username":message.body().username},function(res, res_err){
        if(res_err == null){
            message.reply({"status_code":200,"data":res});
        }else{
            res_err.printStackTrace();
            message.fail(500, res_err.message);
        }
    });
});

vertx.eventBus().consumer("users.update",function(message){
    console.log("Updating a user");
    var client = MongoClient.createShared(vertx, {"db_name":"stackoverflow","connection_string":"mongodb://104.197.213.109:27017"});
    client.update("user",{"username":message.body()["username"]},{"$set":message.body()},function(res, res_err){
        if(res_err == null){
            message.reply({"status_code":200});
        }else{
            res_err.printStackTrace();
            message.fail(500, res_err.message);
        }
    });
});


vertx.eventBus().consumer("users.delete",function(message){
    console.log("Removing a user");
    var client = MongoClient.createShared(vertx, {"db_name":"stackoverflow","connection_string":"mongodb://104.197.213.109:27017"});
    client.removeDocument("user",{"username":message.body()},function(res, res_err){
        if(res_err == null){
            message.reply({"status_code":200});
        }else{
            res_err.printStackTrace();
            message.fail(500, res_err.message);
        }
    });
});

vertx.eventBus().consumer("users.add",function(message){
    console.log("Adding a new user");
    var client = MongoClient.createShared(vertx, {"db_name":"stackoverflow","connection_string":"mongodb://104.197.213.109:27017"});
    client.insert("user", message.body(), function(res, res_err){
        if(res_err == null){
            message.reply({"status_code":201});
        }else{
            res_err.printStackTrace();
            message.fail(500, res_err.message);
        }
    });
});

