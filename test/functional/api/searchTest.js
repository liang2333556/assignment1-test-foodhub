/*eslint no-unused-vars: "off" */

const chai = require("chai")
const expect = chai.expect
const request = require("supertest")
const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer
const PRODUCT = require("../../../models/product")
const mongoose = require("mongoose")

const _ = require("lodash")
let server
let mongod
let db, validID

describe("search", () => {
  before(async () => {
    try {
      mongod = new MongoMemoryServer({
        instance: {
          port: 27017,
          dbPath: "./test/database2",
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
      await PRODUCT.deleteMany({})
      let product = new PRODUCT()

      product.name = "beef",

      await product.save()

    } catch (error) {
      console.log(error)
    }
  })


  describe("search", () => {

    describe("POST /search", () => {
      it("should return the result of search ", () => {
        const e = {
          name: "b"
        }

        return request(server)
          .post("/search")
          .send(e)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .then(res => {
            const result = _.map(res.body, product => {
              return {
                name: product.name,
              }
            })

            expect(result).to.deep.include({
              name: "beef"
            })

          })
      })


    })
  })
})