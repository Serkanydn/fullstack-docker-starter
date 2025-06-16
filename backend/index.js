import express from "express";
import { MongoClient } from "mongodb";
import rateLimit from "express-rate-limit";
import cors from "cors";

const allowedOrigins = [
  "http://chat.dreamchat.local",
  "http://admin.dreamchat.local",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];

const app = express();
const port = process.env.PORT || 5000;

const uri = process.env.MONGO_URI || "mongodb://mongo:27017";
const client = new MongoClient(uri);

const _cors = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS hatası: Erişime izin verilmeyen origin"));
    }
  },
  credentials: true,
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Çok fazla istek attınız, lütfen daha sonra tekrar deneyin.",
});

app.use(_cors);
app.use(limiter);

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

app.get("/users", (req, res) => res.json([{ name: "Alice" }, { name: "Bob" }]));

app.get("/whoami", (req, res) => {
  res.json({ instance: process.env.INSTANCE_NAME || "default" });
});

app.listen(port, () => {
  console.log(`API http://localhost:${port} adresinde`);
});
