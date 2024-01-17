import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URL) {
  throw new Error('Invalid environment variable: "MONGODB_URI"');
}

declare const global: {
  [key: string]: any;
};

const uri = process.env.MONGODB_URL;

let client;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URL) {
  throw new Error("Please add your Mongo URI to .env.local");
}

if (process.env.NODE_ENV === "production") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect().then((connectedClient) => {
      console.log("Connected to MongoDB in production");
      return connectedClient;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect().then((connectedClient) => {
    console.log("Connected to MongoDB in development");
    return connectedClient;
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      query: { id },
    } = req;

    if (typeof id !== "string") {
      res.status(400).json({ message: "Invalid ID" });
      return;
    }

    const client = await clientPromise;
    console.log("Connected to db");

    const db = client.db("test");
    const eventData = db.collection("athena-for-search");
    const result: any = await eventData.findOne({ _id: new ObjectId(id) });

    const formattedResult = {
      query: result.query,
      athenaResponse: result.athenaResponse,
      sources: result.sources,
    };

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
    res.status(200).json(formattedResult);
  } catch (error: any) {
    console.error("Error in get/[id].ts:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Internal error", error });
  }
}