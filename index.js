const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 3000;



app.use(cors());
app.use(express.json());

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
    await client.connect();

    // Define Database and Collections
    const Database = client.db("utility-pay");
    const payBillsCollection = Database.collection("bills");

    // Get: All Bills
    // app.get("/bills", async (req, res) => {
    //   const query = {}
    //   const cursor = payBillsCollection.find(query);
    //   const result = await cursor.toArray();
    //   res.send(result);
    // })

    // GET: Get latest 6 Bills (sorted by date)
    app.get("/latest-bills", async (req, res) => {
      const cursor = payBillsCollection.find().sort({ date: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });


    // GET: Get a specific product by ID
    app.get("/bills/:id", async (req, res) => {
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


    // POST: Add a new product
    app.post("/bills", async (req, res) => {
      const newBills = req.body;
      const result = await payBillsCollection.insertOne(newBills);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
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
