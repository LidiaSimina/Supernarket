import assert from "assert";
import supertest from "supertest";
import test from "node:test";
import app from "./index.js";

test.describe('Unit testing the /product route', function() {
    test.it('should return OK status', function() {
      return supertest(app)
        .get('/product/')
		.type('json')
    	.send('{"id":"0"}')
        .then(function(response){
            assert.equal(response.status, 200)
        })
    });
});