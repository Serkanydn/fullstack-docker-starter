import express from "express";
import { MongoClient } from "mongodb";

const app = express();
const port = process.env.PORT || 5000;

const uri = process.env.MONGO_URI || "mongodb://mongo:27017";
const client = new MongoClient(uri);

app.get("/", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("dreamchat");
    const collection = db.collection("visits");

    await collection.insertOne({ visitedAt: new Date() });

    const count = await collection.countDocuments();
    res.send(`Ziyaret sayısı hop2 : ${count}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Mongo bağlantı hatası");
  }
});

app.get("/health", (req, res) => res.send("OK"));
app.get("/users", (req, res) => res.json([{ name: "Alice" }, { name: "Bob" }]));

app.listen(port, () => {
  console.log(`API http://localhost:${port} adresinde`);
});
