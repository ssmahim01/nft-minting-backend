require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;

// Call express
const app = express();

// Use app
app.use(express.json());
app.use(cors());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.DB_URI, {
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

        const database = client.db("nftDB");
        const nftCollection = database.collection("nfts");

        // GET NFT data by id
        app.get("/nft/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };

            const findResult = await nftCollection.findOne(query);
            if (!findResult) {
                return res.status(404).send({ message: "NFT Not Found" })
            }

            res.send(findResult);
        });

        // Store (POST) NFT data
        app.post("/nft", async (req, res) => {
            const nftData = req.body;
            const insertResult = await nftCollection.insertOne(nftData);
            if (!insertResult) {
                return res.status(404).send({ message: "Failed to store the NFT" });
            }

            res.send(insertResult);
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

// Get data in the root
app.get("/", async (req, res) => {
    res.send("NFT Minting server is running...");
});

// Listen at specific port
app.listen(port, () => {
    console.log(`NFT server running at port ${port}`);
});