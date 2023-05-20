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

export default clientPromise;