const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const admin = require("firebase-admin");
const app = express();
const port = process.env.PORT || 3000;


const serviceAccount = require("./utility-bills-firebase-adminsdk.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


app.use(cors());
app.use(express.json());


const verifyFirebaseToken = async (req, res, next) => {
  // console.log("Firebase-Token: ", req.headers.authorization);
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "unauthorized access" })
  }
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" })
  }
  try {
    const userInfo = await admin.auth().verifyIdToken(token);
    req.token_email = userInfo.email;
    console.log("userInfo: ", userInfo)
    next();
  }
  catch {
    return res.status(401).send({ message: 'unauthorized access' })
  }
}


// Root route for testing server
app.get("/", (req, res) => {
  res.send("Utility Pay Server is running");
})


const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@clustersm.e6uuj86.mongodb.net/?appName=ClusterSM`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // await client.connect();

    // Define Database and Collections
    const Database = client.db("utility-pay");
    const payBillsCollection = Database.collection("bills");
    const paymentsCollection = Database.collection("payments")


    // GET: Get latest 6 Bills (sorted by date)
    app.get("/latest-bills", async (req, res) => {
      const cursor = payBillsCollection.find().sort({ date: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });


    // GET: Get a specific ID
    app.get("/bills/:id", verifyFirebaseToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await payBillsCollection.findOne(query);
      res.send(result);
    });


    // GET: Get specific category
    app.get("/bill-category", async (req, res) => {
      const category = req.query.category;
      let query = {};

      if (category) {
        query.category = category;
      }
      const result = await payBillsCollection.find(query).toArray();
      res.send(result);
    });


    // // POST: Add a new Bills
    // app.post("/bills", async (req, res) => {
    //   const newBills = req.body;
    //   const result = await payBillsCollection.insertOne(newBills);
    //   res.send(result);
    // });


    //===================================================================

    // Post Payment-Bills
    app.post("/pay-bill", verifyFirebaseToken, async (req, res) => {
      const paymentData = req.body;
      const result = await paymentsCollection.insertOne(paymentData);
      res.send(result);
    });


    app.get("/my-pay-bills", verifyFirebaseToken, async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
        if (email !== req.token_email) {
          return res.status(403).send({ message: "forbidden access" })
        }
      }
      const result = await paymentsCollection.find(query).toArray();
      res.send(result);
    });


    // Update a specific paid bill 
    app.put("/my-pay-bills/:id", verifyFirebaseToken, async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          amount: updatedData.amount,
          address: updatedData.address,
          phone: updatedData.phone,
          date: updatedData.date,
        },
      };
      const result = await paymentsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });


    // Delete a specific paid bill 
    app.delete("/my-pay-bills/:id", verifyFirebaseToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await paymentsCollection.deleteOne(query);
      res.send(result);
    });


    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    // await client.close();
  }
}
run().catch(console.dir);

// Server listen
app.listen(port, () => {
  console.log(`Utility Pay Server at port: ${port}`)
});
