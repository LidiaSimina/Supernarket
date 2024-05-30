import jwt from "jsonwebtoken"

const key = "1234567890"

export const encryptToken = function(login){
	return jwt.sign({"login": login}, key);
}

export const parseToken = function(token){
	try {
		const data = jwt.verify(token, key);
		return {"ok": true, data: data}
  	} catch(err) {
		return {"ok": false}
  }
}