const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
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
    const usersCollection = client.db("petAdoptionDB").collection("users");




    //JWT related api
    app.post('/jwt',async(req,res)=>{
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'});
        res.send({token});
    })
    // middlewares (verifyToken)
    const verifyToken =(req,res,next)=>{
        if(!req.headers.authorization){
        return res.status(401).send({message:'unauthorized access'});
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,decoded)=>{
        if(err){
          return res.status(401).send({message: 'unauthorized access'})
        }
        req.decoded=decoded;
        next();
      })
    }




     // verify Admin
    const verifyAdmin = async(req,res, next)=>{
    const email = req.decoded.email;
    const query = {email:email}
    const user = await usersCollection.findOne(query);
    const isAdmin = user?.role === 'admin'
    if(!isAdmin){
    return res.status(403).send({message : ' forbidden access'});
    }
        next();
    }




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
    app.post('/petListing',async(req,res)=>{
        const pets = req.body;
        const result =await petListingCollection.insertOne(pets);
        res.send(result);
    });
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
    app.post('/campaigns',async(req,res)=>{
        const donationCampaign = req.body;
        const result =await campaignsCollection.insertOne(donationCampaign);
        res.send(result);
    })
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




    // user related api
    app.get('/users/admin/:email',verifyToken, async(req,res)=>{
        const email = req.params.email;
        if(email !== req.decoded.email){
          return res.status(403).send({message : "forbidden access"})
        }
        const query = {email:email}
        const user = await usersCollection.findOne(query);
        let admin = false;
        if(user){
          admin= user?.role === 'admin';
        }
        res.send({admin});
      });
    app.post('/users',async(req,res)=>{
        const user = req.body;
      const query ={email: user.email}
      const existingUser = await usersCollection.findOne(query);
      if(existingUser){
        return res.send({message: 'This User already exists', insertedId : null})
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    app.get('/users', verifyToken,verifyAdmin, async(req,res)=>{
        const result = await usersCollection.find().toArray();
        res.send(result);
    });
    app.delete('/users/:id',verifyToken,verifyAdmin,async(req,res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)};
        const result = await usersCollection.deleteOne(query);
        res.send(result);
    });
    app.patch('/users/admin/:id',verifyToken,verifyAdmin, async(req,res)=>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const updatedDoc = {
          $set :{
            role : 'admin'
          }
        }
        const result = await usersCollection.updateOne(filter,updatedDoc);
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