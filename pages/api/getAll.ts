import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/components/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    console.log("Connected to db");

    const db = client.db("test");
    const eventData = db.collection("athena-for-search");
    const result = await eventData.find({}).toArray();

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error in getAll.tsx:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Internal error", error });
  }
}