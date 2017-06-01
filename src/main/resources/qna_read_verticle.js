var MongoClient = require("vertx-mongo-js/mongo_client");

vertx.eventBus().consumer("questions.read",function(message){
    var client = MongoClient.createShared(vertx, {"db_name":"stackoverflow","connection_string":"mongodb://mongodbhost:27017"});
    if(message.body() == null){
        client.find("question",{},function(res, res_err){
            if(res_err == null){
                message.reply({"status_code":200,"data":res});
            }else{
                res_err.printStackTrace();
                message.fail(500, res_err.message);
            }
        });
    }else{
        client.find("question",{"_id":message.body()._id},function(res, res_err){
            if(res_err == null){
                message.reply({"status_code":200,"data":res});
            }else{
                res_err.printStackTrace();
                message.fail(500, res_err.message);
            }
        });
    }
    
});

vertx.eventBus().consumer("questions.search",function(message){
    var client = MongoClient.createShared(vertx, {"db_name":"stackoverflow","connection_string":"mongodb://mongodbhost:27017"});
    client.find("question",{"title":{"$regex":message.body().title}},function(res, res_err){
            if(res_err == null){
                message.reply({"status_code":200,"data":res});
            }else{
                res_err.printStackTrace();
                message.fail(500, res_err.message);
            }
        });
});

vertx.eventBus().consumer("questions.read.answer",function(message){
    var client = MongoClient.createShared(vertx, {"db_name":"stackoverflow","connection_string":"mongodb://mongodbhost:27017"});
    if(message.body() == null){
        client.findWithOptions("question",{},{"fields":{"answers":true}},function(res, res_err){
            if(res_err == null){
                message.reply({"status_code":200,"data":res});
            }else{
                res_err.printStackTrace();
                message.fail(500, res_err.message);
            }
        });
    }else{
        client.findWithOptions("question",{"_id":message.body()._id},{"fields":{"answers":true}},function(res, res_err){
            if(res_err == null){
                message.reply({"status_code":200,"data":res});
            }else{
                res_err.printStackTrace();
                message.fail(500, res_err.message);
            }
        });
    }
});
