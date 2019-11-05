/*eslint no-unused-vars: "off" */

const chai = require("chai")
const expect = chai.expect
const request = require("supertest")
const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer
const User= require("../../../models/users")



const mongoose = require("mongoose")

const _ = require("lodash")
let server
let mongod
let db, validID

describe("User", () => {
  before(async () => {
    try {
      mongod = new MongoMemoryServer({
        instance: {
          port: 27017,
          dbPath: "./test/database5",
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



  describe("POST /user", () => {
    it("should return confirmation message and update ", () => {
      const user = {
        name: "lxq",
        pwd: "lxq123123",
      }

      return request(server)
        .post("/regist")
        .send(user)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then(res => {
          const result = _.map(res.body, user => {
            return {
              name: user.name,
              pwd: user.pwd,
            }
          })
          expect(res.body.message).equals("User Successfully Added!")

          expect(result).to.deep.include({name: "lxq", pwd: "lxq123123"})

        })
    })


  })

})
