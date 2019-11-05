/*eslint no-unused-vars: "off" */

const chai = require("chai")
const expect = chai.expect
const request = require("supertest")
const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer
const Product = require("../../../models/products")
const mongoose = require("mongoose")

const _ = require("lodash")
let server
let mongod
let db, validID

describe("Products", () => {
  before(async () => {
    try {
      mongod = new MongoMemoryServer({
        instance: {
          port: 27017,
          dbPath: "./test/database1",
          dbName: "foodhub" // by default generate random dbName
        }
      })
      // Async Trick - this ensures the database is created before
      // we try to connect to it or start the server
      // await mongod.getConnectionString();

      mongoose.connect("mongodb://localhost:27017/foodhub", {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
      server = require("../../../bin/www")
      db = mongoose.connection
    } catch (error) {
      console.log(error)
    }
  })

  after(async () => {
    try {
      await db.dropDatabase()
    } catch (error) {
      console.log(error)
    }
  })

  beforeEach(async () => {
    try {
      await Product.deleteMany({})
      let product = new Product()
      product.type="UK",
      product.name="cake",
      product.price=11,
      product.likes=1,
      await product.save()
      product = new Product()
      product.type="Spanish",
      product.name="apple",
      product.price=9,
      await product.save()
      product = await Product.findOne({ type:"UK" })
      validID = product._id
    } catch (error) {
      console.log(error)
    }
  })

  describe("GET /products", () => {
    it("should GET all the products", done => {
      request(server)
        .get("/products")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .end((err, res) => {
          try {
            expect(res.body).to.be.a("array")
            expect(res.body.length).to.equal(2)
            let result = _.map(res.body, product => {
              return {
                type:product.type,
                name:product.name,
                price:product.price,

              }
            })
            expect(result).to.deep.include({
              type:"UK",
              name:"cake",
              price:11,

            })
            expect(result).to.deep.include({
              type:"Spanish",
              name:"apple",
              price:9,
            })
            done()
          } catch (e) {
            done(e)
          }
        })
    })
  })
  describe("GET /products/:id", () => {
    describe("when the id is valid", () => {
      it("should return the matching product", done => {
        request(server)
          .get(`/products/${validID}`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err, res) => {
            expect(res.body[0]).to.have.property("type", "UK")
            expect(res.body[0]).to.have.property("name", "cake")
            done(err)
          })
      })
    })
    describe("when the id is invalid", () => {
      it("should return the NOT found message", done => {
        request(server)
          .get("/products/9999")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err, res) => {
            expect(res.body.message).equals("Product NOT Found!")
            done(err)
          })
      })
    })
  })
  describe("POST /products", () => {
    it("should return confirmation message and update datastore", () => {
      const product = {
        type:"Indian",
        name:"curry",
        price:20
      }
      return request(server)
        .post("/products")
        .send(product)
        .expect(200)
        .then(res => {
          expect(res.body.message).equals("Product Added!")
          validID = res.body.data._id
        })
    })
    after(() => {
      return request(server)
        .get(`/products/${validID}`)
        .expect(200)
        .then(res => {
          expect(res.body[0]).to.have.property("type", "Indian")
          expect(res.body[0]).to.have.property("name", "curry")
        })
    })
  })
  describe("PUT /products/:id/likes", () => {
    describe("when the id is valid", () => {
      it("should return a message and the like increased by 1", () => {
        return request(server)
          .put(`/products/${validID}/likes`)
          .expect(200)
          .then(resp => {
            expect(resp.body).to.include({
              message: "Submit your likes successfully!"
            })
            expect(resp.body.data).to.have.property("likes", 2)
          })
      })
      after(() => {
        return request(server)
          .get(`/products/${validID}`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .then(resp => {
            expect(resp.body[0]).to.have.property("likes", 2)
          })
      })
    })
    describe("when the id is invalid", () => {
      it("should return  nothing for the error id", () => {
        return request(server)
          .put("/products/1100001/likes")
          .expect(200)
      })
    })
  })



  describe("DELETE /products/:id", () => {
    describe("when the id is valid", () => {
      it("should delete the matching product", () => {
        return request(server)
          .delete(`/products/${validID}`).expect(200)
          .then(resp => {
            expect(resp.body).to.include({
              message: "Product Deleted!"
            })

          })
      })

      after(() => {
        return request(server)
          .get("/products")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .then(res => {
            const result = _.map(res.body, products => {
              return {
                type: products.type,
                name: products.name,
                price: products.price,
                likes: products.likes,
              }
            })
            expect(result).to.not.include({type: "UK", name: "cake", price: 11, likes: 1,})
          })
      })
    })

    describe("when the id is invalid", () => {
      it("should return the error message", () => {
        request(server)
          .delete("/products/999")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .expect({message: "Product NOT DELETED!"}, () => {
          })

      })

    })

  })
})

