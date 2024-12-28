const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// !-------------------middleware--------------------------------
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h13ev.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    //!-------------------------------DB--------------------------------
    const LostAndFoundCollection = client.db("lost-found").collection("data");
    const recoveredCollection = client.db("lost-found").collection("recovered");

    //!-------------------------------LostAndFound------------------------

    app.get("/allItems", async (req, res) => {
      const cursor = LostAndFoundCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/allItems/six", async (req, res) => {
      const cursor = LostAndFoundCollection.find().sort({ date: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.post("/addItems", async (req, res) => {
      const newData = req.body;
      console.log("Adding new addItems", newData);

      const result = await LostAndFoundCollection.insertOne(newData);
      res.send(result);
    });
    app.get("/items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await LostAndFoundCollection.findOne(query);
      res.send(result);
    });
    app.get("/myItem", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = LostAndFoundCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //  ----------------------Delete Item---------------------

    app.get("/myItems", async (req, res) => {
      const cursor = LostAndFoundCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.delete("/myItems/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await LostAndFoundCollection.deleteOne(query);
      res.send(result);
    });
    // ----------------------Update Item----------------------------
    app.get("/myItems/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await LostAndFoundCollection.findOne(query);
      res.send(result);
    });

    app.put("/myItems/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: req.body,
      };

      const result = await LostAndFoundCollection.updateOne(
        filter,
        updatedDoc,
        options
      );

      res.send(result);
    });

    // !-----------------------------Recovered----------------------------
    app.post("/AddRecovered", async (req, res) => {
      const newData = req.body;
      console.log("Adding new addItems", newData);

      const result = await recoveredCollection.insertOne(newData);
      res.send(result);
    });

    app.get("/RecoveredItems", async (req, res) => {
      const cursor = recoveredCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Lost-Found server is running");
});

app.listen(port, () => {
  console.log(`server is waiting at: ${port}`);
});
