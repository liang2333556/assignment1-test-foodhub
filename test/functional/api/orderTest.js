/*eslint no-unused-vars: "off" */

/*eslint no-useless-escape: "off" */

const chai = require("chai")
const expect = chai.expect
const request = require("supertest")
const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer
const User= require("../../../models/users")
const Product= require("../../../models/products")
const Order= require("../../../models/order")


const mongoose = require("mongoose")

const _ = require("lodash")
let server
let mongod
let db, validID,user_ID,product1_ID,product2_ID

describe("Order", () => {
  before(async () => {
    try {
      mongod = new MongoMemoryServer({
        instance: {
          port: 27017,
          dbPath: "./test/database4",
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
      await Order.deleteMany({})
      let user = new User()
      user.name = "pig"
      user.pwd = "123214"
      await user.save()
      user_ID = user._id

      let product1 = new Product()
      product1.type = "Spanish",
      product1.name = "beef",
      product1.price = 12,
      product1.likes = 2,
      await product1.save()
      product1_ID = product1._id

      let product2 = new Product()
      product2.type = "UK",
      product2.name = "lamb",
      product2.price = 9,
      product2.likes = 3,
      await product2.save()
      product2_ID = product2._id

    } catch (error) {
      console.log(error)
    }
  })


  describe("POST /order", () => {
    it("should return confirmation message and update datastore", () => {
      const order = {
        customerID: user_ID,
        productList: [product1_ID, product2_ID],
      }
      // console.log(order)

      return request(server)
        .post("/order")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .send(order)
        .expect(200)
        .then(res => {
          expect(res.body.message).equals("Order Successfully Added!")
          validID = res.body.data._id
          // console.log(validID)

        })
    })
    after(() => {
      return request(server)
        .get(`/order/${validID}`)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then(res => {

          var id1=JSON.stringify(user_ID)
          id1 = id1.replace(/\"/g, "")
          var id2=JSON.stringify(product1_ID)
          id2 = id2.replace(/\"/g, "")

          var id3=JSON.stringify(product2_ID)
          id3 = id3.replace(/\"/g, "")

          expect(res.body[0]).to.have.property("customerID",id1)
          // expect(res.body[0]).to.have.property("productList",[id2,id3]);
        })
    })
  })

})
