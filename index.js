const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()


const app = express();
const port = process.env.PORT || 3000;


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
   
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
    await client.close();
  }
}
run().catch(console.dir);

// Server listen
app.listen(port, () => {
    console.log(`Utility Pay Server at port: ${port}`)
});


// pass: lH9ElaUwEMWMSoAT
// user: utilityPay