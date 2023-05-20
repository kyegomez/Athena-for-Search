import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import clientPromise from "@/components/mongodb";

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