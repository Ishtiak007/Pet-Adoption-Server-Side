const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());




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
    const adoptionUsersCollection = client.db("petAdoptionDB").collection("adoptionUsers");
    const campaignsCollection = client.db("petAdoptionDB").collection("campaigns");


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
    });
    app.get('/petListing/:id', async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await petListingCollection.findOne(query);
        res.send(result);
    });


    // pet Adoption request user
    app.post('/adoptionUsers',async(req,res)=>{
        const adoptionUser = req.body;
        const result =await adoptionUsersCollection.insertOne(adoptionUser);
        res.send(result);
    })
   

    //campaigns related api
    app.get('/campaigns',async(req,res)=>{
        const filter = req.query
        const options ={
            sort :{
                lastDate : -1
            }
        };
        const cursor = campaignsCollection.find(filter,options);
        const result =await cursor.toArray();
        res.send(result);
    });
    app.get('/campaigns/:id', async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await campaignsCollection.findOne(query);
        res.send(result);
    });





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