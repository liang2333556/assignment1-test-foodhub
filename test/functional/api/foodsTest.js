const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer;
const Food = require("../../../models/foods");
const mongoose = require("mongoose");

const _ = require("lodash");
let server;
let mongod;
let db, validID;

describe("foods", () => {
    before(async () => {
        try {
            mongod = new MongoMemoryServer({
                instance: {
                    port: 27017,
                    dbPath: "./test/database",
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
            await Food.deleteMany({});
            let food = new Food();
            food.type = "US";
            food.author = "liang";
            food.likes = 2;
            await food.save();
            food = new Food();
            food.type = "UK";
            food.author = "mimi";
            await food.save();
            food = await Food.findOne({ type:"US" });
            validID = food._id;
        } catch (error) {
            console.log(error);
        }
    });

    describe("GET /foods", () => {
        it("should GET all the foods", done => {
            request(server)
                .get("/foods")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200)
                .end((err, res) => {
                    try {
                        expect(res.body).to.be.a("array");
                        expect(res.body.length).to.equal(2);
                        let result = _.map(res.body, food => {
                            return {
                                type:food.type,
                                author:food.author,
                            };
                        });
                        expect(result).to.deep.include({
                            type:"US",
                            author:"liang"
                        });
                        expect(result).to.deep.include({
                            type:"UK",
                            author:"mimi"
                        });
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
        });
    });
    describe("GET /foods/:id", () => {
        describe("when the id is valid", () => {
            it("should return the matching foods", done => {
                request(server)
                    .get(`/foods/${validID}`)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body[0]).to.have.property("type", "US");
                        expect(res.body[0]).to.have.property("author", "liang");
                        done(err);
                    });
            });
        });
        describe("when the id is invalid", () => {
            it("should return the NOT found message", done => {
                request(server)
                    .get("/foods/9999")
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body.message).equals("Food NOT Found!");
                        done(err);
                    });
            });
        });
    });
    describe("POST /foods", () => {
        it("should return confirmation message and update datastore", () => {
            const food = {
                type:"Indian",
                author:"peter",
                likes:0
            };
            return request(server)
                .post("/foods")
                .send(food)
                .expect(200)
                .then(res => {
                    expect(res.body.message).equals("Food Added!");
                    validID = res.body.data._id;
                });
        });
        after(() => {
            return request(server)
                .get(`/foods/${validID}`)
                .expect(200)
                .then(res => {
                    expect(res.body[0]).to.have.property("type", "Indian");
                    expect(res.body[0]).to.have.property("author", "peter");
                });
        });
    });
    describe("PUT /foods/:id/likes", () => {
        describe("when the id is valid", () => {
            it("should return a message and the like increased by 1", () => {
                return request(server)
                    .put(`/foods/${validID}/likes`)
                    .expect(200)
                    .then(resp => {
                        expect(resp.body).to.include({
                            message: "Submit your likes successfully!"
                        });
                        expect(resp.body.data).to.have.property("likes", 3);
                    });
            });
            after(() => {
                return request(server)
                    .get(`/foods/${validID}`)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .then(resp => {
                        expect(resp.body[0]).to.have.property("likes", 3);
                    });
            });
        });
        describe("when the id is invalid", () => {
            it("should return nothing for invalid food id", () => {
                return request(server)
                    .put("/foods/1100001/likes")
                    .expect(200);
            });
        });
    });

    describe("DELETE /foods/:id", () => {
        describe("when the id is valid", () => {
            it("should delete the matching food", () => {
                return request(server)
                    .delete(`/foods/${validID}`)
                    .expect(200)
                    .then(resp => {
                        expect(resp.body).to.include({
                            message: "Food Deleted!"
                        })

                    })
            })

            after(() => {
                return request(server)
                    .get("/foods")
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .then(res => {
                        const result = _.map(res.body, foods => {
                            return {
                                type: foods.type,
                                author: foods.author,
                            }
                        })
                        expect(result).to.not.include({type: "US", author: "liang"})
                    })
            })
        })

        describe("when the id is invalid", () => {
            it("should return error message", () => {
                request(server)
                    .delete("/foods/999")
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .expect({message: "Food NOT DELETED!"}, () => {
                    })

            })

        })
    })



});
