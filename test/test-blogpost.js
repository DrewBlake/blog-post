const chai = require("chai");
const chaiHttp = require("chai-http");

const { app, runServer, closeServer } = require("../server");

// this lets us use *expect* style syntax in our tests
// so we can do things like `expect(1 + 1).to.equal(2);`
// http://chaijs.com/api/bdd/
const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe("BlogPosts", function() {
	before(function() {
		return runServer();
	});

	after(function() {
		return closeServer();
	});

	//test GET for recipes
	it("should list blog posts when GET runs", function() {
		return chai
			.request(app)
			.get("/blog-posts")
			.then(function(res) {
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body).to.be.a("array");
				expect(res.body.length).to.be.at.least(1);
				const expectedKeys = ["id", "title", "content", "author", "publishDate"];
				res.body.forEach(function(item) {
					expect(item).to.be.a("object");
					expect(item).to.include.keys(expectedKeys);
				});
			});
		});

	//test for POST - creating new blog item
	it("should add blog post on POST", function() {
		const newItem = {
			title: "hello", 
			content: "common english greeting",
			author: "sir lancalot"
			
		};
		return chai
		  .request(app)
		  .post("/blog-posts")
		  .send(newItem)
		  .then(function(res) {
	        expect(res).to.have.status(201);
	        expect(res).to.be.json;
	        expect(res.body).to.be.a("object");
	        expect(res.body).to.include.keys("id", "title", "content", "author", "publishDate");
	        expect(res.body.id).to.not.equal(null);
	        expect(res.body.title).to.equal(newItem.title);
	        expect(res.body.content).to.equal(newItem.content);
	        expect(res.body.author).to.equal(newItem.author);

	        // response should be deep equal to `newItem` from above if we assign
	        // `id` to it from `res.body.id`
	        /*expect(res.body).to.deep.equal(
	          Object.assign(newItem, { id: res.body.id })
	        );*/
		});
	});

	// test for update - PUT
	it("should update exsisting blog post on PUT", function() {
		const updateData = {
			title: "hola",
			content: "common spanish greeting",
			author: "Spain"
		};

		return (
	      chai
	        .request(app)
	        // first have to get so we have an idea of object to update
	        .get("/blog-posts")
	        .then(function(res) {
	          updateData.id = res.body[0].id;
	          // this will return a promise whose value will be the response
	          // object, which we can inspect in the next `then` block. Note
	          // that we could have used a nested callback here instead of
	          // returning a promise and chaining with `then`, but we find
	          // this approach cleaner and easier to read and reason about.
	          return chai
	          	.request(app)
	          	.put(`/blog-posts/${updateData.id}`)
	          	.send(updateData);
	        })
	        .then(function(res) {
	          expect(res).to.have.status(204);
	          //expect(res).to.be.json;
	          expect(res.body).to.be.a("object");
	          //expect(res.body).to.deep.equal(updateData);
	        })
	    );
  	});

  	// test for delete using DELETE
  	it("deletes item from blog post list", function() {
  		return (
          chai
	        .request(app)
	        // first have to get so we have an `id` of item
	        // to delete
	        .get("/blog-posts")
	        .then(function(res) {
	          return chai.request(app).delete(`/blog-posts/${res.body[0].id}`);
	        })
	        .then(function(res) {
	          expect(res).to.have.status(204);
	        })
    	);
  	});
});