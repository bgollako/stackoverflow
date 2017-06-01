package com.stackoverflow.auth;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.auth.jwt.JWTOptions;

public class AuthVerticle extends AbstractVerticle {
	@Override
	public void start(Future<Void> future) throws Exception {
		vertx.eventBus().consumer("token.generate", message -> {
			vertx.eventBus().send("users.get", message.body(), res -> {
				if(res.succeeded()){
					JsonObject object=new JsonObject(res.result().body().toString());
					JsonArray array=object.getJsonArray("data");
					if(array.isEmpty())
						message.fail(403, "No users found");
					JWTAuth jwt = JWTAuth.create(vertx, new JsonObject()
							.put("keyStore", new JsonObject()
									.put("type", "jceks")
									.put("path", "keystore.jceks")
									.put("password", "secret")));
					message.reply(new JsonObject().put("status_code", 200).put("data", jwt.generateToken(new JsonObject().put("username", message.body()), 
							new JWTOptions().setExpiresInSeconds(3600000L))));
				}else if(res.failed()){
					message.fail(403, "No users found");
				}
			});
		});
	}
}