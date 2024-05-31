import express from "express";
import md5 from "md5";
import { parseToken, encryptToken } from "./functions/jwt.js";

//ORM
import mongoose from "mongoose";
mongoose.connect('mongodb://localhost:27017/supermarket');
import User from "./user.schema.js";

//SQL
import pg from "pg";
const db = new pg.Pool({
	"user": "postgres",
	"host": "localhost",
	"port": 5433,
	"database": "supermarket",
	"password": "000000"
});
db.query('CREATE TABLE IF NOT EXISTS product (id SERIAL PRIMARY KEY, name TEXT NOT NULL, sum INTEGER NOT NULL);');



var app = express();
app.use(express.json());



app.route("/product")
	//получить количество по ID
	.get(async function(req, res){
		const body = req.body;
		const db_req = await db.query('SELECT * FROM product WHERE id = $1', [body.id]);
		res.json(db_req.rows[0]);
	})
	//новый товар
	.post(async function(req, res){
		const body = req.body;
		const db_req = await db.query('INSERT INTO product (name, sum) VALUES ($1, $2) RETURNING *', [body.name, body.sum]);
		res.json(db_req.rows[0]);
	})
	//изменить количество
	.patch(async function(req, res){
		const body = req.body;
		const db_req = await db.query('UPDATE product SET sum = $1 WHERE id = $2', [body.sum, body.id]);
		res.json(db_req.rows[0]);
	})
	.delete(async function(req, res){
		const body = req.body;
		const db_req = await db.query('DELETE FROM product WHERE id = $1', [body.id]);
		res.json(db_req.rows[0]);
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