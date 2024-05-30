import express from "express";
import md5 from "md5";
import { parseToken, encryptToken } from "./functions/jwt.js";
import mongoose from "mongoose";
mongoose.connect('mongodb://localhost:27017/supermarket');

import User from "./user.schema.js";

var app = express();
app.use(express.json());



app.route("/client")
	.get(async function(req, res){
		res.status(200).send("ok");
	})
	.post(async function(req, res){
		res.status(200).send("ok");
	})
	.patch(async function(req, res){
		res.status(200).send("ok");
	})
	.delete(async function(req, res){
		res.status(200).send("ok");
	});

app.route("/login")
	//вход
	.get(async function(req, res){
		const body = req.body;
		const user = await User.find({"login": body.login, "password": md5(body.password)});
	
		if (user.length == 1){
			return res.json({
				"ok": true,
				"token": user[0].token
			});
		}
		else {
			return res.json({
				"ok" : false,
				"errMessage" : "Логин или пароль введены неправильно"
			});
		}
	})
	//регистрация
	.post(async function(req, res){
		const body = req.body;
		
		const token = encryptToken(body.login);
		const password = md5(body.password);
		const user = new User({"login": body.login, "password": password, "token": token});
	
		await user.save()
		.then(function(saved_user){
			return res.json({
				"ok": true,
				"token": saved_user.token
			});
		})
		.catch(function(err){
			return res.json({
				"ok" : false,
				"errMessage" : err
			});
		});
	})
	//изменить пароль
	.patch(async function(req, res){
		const body = req.body;
		
		await User.updateOne({login : body.login}, {password : md5(body.password)})
		.then(function(saved_user){
			return res.json({
				"ok": true
			});
		})
		.catch(function(err){
			return res.json({
				"ok" : false,
				"errMessage" : err
			});
		});
	})
	//удалить
	.delete(async function(req, res){
		const body = req.body;

		const result = await User.deleteOne({login: body.login});
		return res.json(result);
	})

app.listen(8080, function(){
	console.log(`Server started on port 8080.`);
});