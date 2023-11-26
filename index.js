const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s1bw0ez.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const categoryCollection = client.db("petAdoptionDB").collection("petCategory");
    const reviewsCollection = client.db("petAdoptionDB").collection("reviews");
    const petListingCollection = client.db("petAdoptionDB").collection("petListing");


    // category get operation
    app.get('/category',async(req,res)=>{
        const result = await categoryCollection.find().toArray();
        res.send(result);
    });
    // reviews get operation
    app.get('/reviews',async(req,res)=>{
        const result = await reviewsCollection.find().toArray();
        res.send(result);
    });


    // petListing api
    app.get('/petListing',async(req,res)=>{
        const filter = req.query
        const options ={
            sort :{
                date : -1
            }
        };
        const cursor = petListingCollection.find(filter,options);
        const result =await cursor.toArray();
        res.send(result);
    })







    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/',(req,res)=>{
    res.send('Pet Adoption server is running')
});
app.listen(port,()=>{
    console.log(`Pet Adoption server is running on port ${port}`);
});