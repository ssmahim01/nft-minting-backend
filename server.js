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
        // Connect to MongoDB
        await client.connect();
        console.log("Connected to MongoDB");

        // Database and collection
        const database = client.db("nftDB");
        const nftCollection = database.collection("nfts");

        // GET NFT data by id
        app.get("/nft/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };

                const nft = await nftCollection.findOne(query);
                if (!nft) {
                    return res.status(404).json({ message: "NFT Not Found" })
                }

                res.json(nft);
            } catch (error) {
                res.status(500).json({ message: "Server error", error })
            }
        });

        // GET NFT Gallery by wallet address
        app.get("/nfts/:walletAddress", async (req, res) => {
            try {
                const walletAddress = req.params.walletAddress;
                const query = { walletAddress: walletAddress };
                const nfts = await nftCollection.find(query).toArray();

                if (!nfts.length === 0) {
                    return res.status(404).json({ message: "NFT Gallery Not Found" })
                }

                res.json(nfts);
            } catch (error) {
                res.status(500).json({ message: "Server error", error })
            }
        });

        // Store (POST) NFT data
        app.post("/nft", async (req, res) => {
            try {
                const nftData = req.body;
                const insertResult = await nftCollection.insertOne(nftData);
                if (!insertResult.acknowledged) {
                    return res.status(400).json({ message: "Failed to store the NFT" });
                }

                res.status(201).json({message: "NFT stored successfully", nftId: insertResult.insertedId});
            } catch (error) {
                res.status(500).json({ message: "Server error", error })
            }
        });

        // Ping to confirm successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Ping successful, MongoDB is connected!");
    } catch(error){
        console.error("MongoDB Connection Error:", error);
    }finally {
        // Ensures that the client will close when finish/error
        // await client.close();
    }
}
run().catch(console.dir);

// Root route
app.get("/", async (req, res) => {
    res.send("NFT Minting server is running...");
});

// Start the server
app.listen(port, () => {
    console.log(`NFT server running at port ${port}`);
});