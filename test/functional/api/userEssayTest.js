const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer;
const Essay = require("../../../models/userEssay");
const mongoose = require("mongoose");

const _ = require("lodash");
let server;
let mongod;
let db, validID;

describe("Essays", () => {
    before(async () => {
        try {
            mongod = new MongoMemoryServer({
                instance: {
                    port: 27017,
                    dbPath: "./test/database3",
                    dbName: "foodhub" // by default generate random dbName
                }
            });
            // Async Trick - this ensures the database is created before
            // we try to connect to it or start the server
            // await mongod.getConnectionString();

            mongoose.connect("mongodb://localhost:27017/foodhub", {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            server = require("../../../bin/www");
            db = mongoose.connection;
        } catch (error) {
            console.log(error);
        }
    });

    after(async () => {
        try {
            await db.dropDatabase();
        } catch (error) {
            console.log(error);
        }
    });

    beforeEach(async () => {
        try {
            await Essay.deleteMany({});
            let essay= new Essay();
            essay.author="vans",
                essay.content="I like Chinese food",
                essay.likes=1,
                await essay.save();
            essay = new Essay();
            essay.author="Alex",
                essay.content="I like Spanish food",

                await essay.save();
            essay = await Essay.findOne({ author:"vans" });
            validID = essay._id;
        } catch (error) {
            console.log(error);
        }
    });

    describe("GET /userEssay", () => {
        it("should GET all the foods", done => {
            request(server)
                .get("/userEssay")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200)
                .end((err, res) => {
                    try {
                        expect(res.body).to.be.a("array");
                        expect(res.body.length).to.equal(2);
                        let result = _.map(res.body, essay => {
                            return {
                                author:essay.author,
                                content:essay.content,
                            };
                        });
                        expect(result).to.deep.include({
                            author:"vans",
                            content:"I like Chinese food",
                        });
                        expect(result).to.deep.include({
                            author:"Alex",
                            content:"I like Spanish food",
                        });
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
        });
    });
    describe("GET /userEssay/:id", () => {
        describe("when the id is valid", () => {
            it("should return the matching donation", done => {
                request(server)
                    .get(`/userEssay/${validID}`)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body[0]).to.have.property("author", "vans");
                        expect(res.body[0]).to.have.property( "content","I like Chinese food",);
                        done(err);
                    });
            });
        });
        describe("when the id is invalid", () => {
            it("should return the NOT found message", done => {
                request(server)
                    .get("/userEssay/9999")
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body.message).equals("Essay NOT Found!");
                        done(err);
                    });
            });
        });
    });
    describe("POST /userEssay", () => {
        it("should return confirmation message and update datastore", () => {
            const essay = {
                author:"stephen",
                content:"I like sushi"
            };
            return request(server)
                .post("/userEssay")
                .send(essay)
                .expect(200)
                .then(res => {
                    expect(res.body.message).equals("Essay Added!");
                    validID = res.body.data._id;
                });
        });
        after(() => {
            return request(server)
                .get(`/userEssay/${validID}`)
                .expect(200)
                .then(res => {
                    expect(res.body[0]).to.have.property("content", "I like sushi");
                    expect(res.body[0]).to.have.property("author", "stephen");
                });
        });
    });
    describe("PUT /userEssay/:id/likes", () => {
        describe("when the id is valid", () => {
            it("should return a message and the like increased by 1", () => {
                return request(server)
                    .put(`/userEssay/${validID}/likes`)
                    .expect(200)
                    .then(resp => {
                        expect(resp.body).to.include({
                            message: "Submit your likes successfully!"
                        });
                        expect(resp.body.data).to.have.property("likes", 2);
                    });
            });
            after(() => {
                return request(server)
                    .get(`/userEssay/${validID}`)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .then(resp => {
                        expect(resp.body[0]).to.have.property("likes", 2);
                    });
            });
        });
        describe("when the id is invalid", () => {
            it("should return nothing for invalid food id", () => {
                return request(server)
                    .put("/userEssay/1100001/likes")
                    .expect(200);
            });
        });
    });



    describe("DELETE /userEssay/:id", () => {
        describe("when the id is valid", () => {
            it("should delete the matching product", () => {
                return request(server)
                    .delete(`/userEssay/${validID}`)
                    .expect(200)
                    .then(resp => {
                        expect(resp.body).to.include({
                            message: "Essay Deleted!"
                        })

                    })
            })

            after(() => {
                return request(server)
                    .get("/userEssay")
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .then(res => {
                        const result = _.map(res.body, essay => {
                            return {
                                author: essay.author,
                                content: essay.content,
                                comment: essay.comment,
                                likes: essay.likes,
                            }
                        })
                        expect(result).to.not.include({author:"vans",
                            content:"I like Chinese food",
                            likes:1,})
                    })
            })
        })

        describe("when the id is invalid", () => {
            it("should return the NOT found message", () => {
                request(server)
                    .delete("/userEssay/999")
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .expect({message: "Essay NOT DELETED!"}, () => {
                    })

            })

        })

    })
})
