require("dotenv").config();
const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;

// Call express
const app = express();
app.use(express.json());
app.use(cors());

app.get("/", async(req, res) => {
    res.send("NFT Minting server is running...");
});

app.listen(port, () => {
    console.log(`NFT server running at port ${port}`);
});