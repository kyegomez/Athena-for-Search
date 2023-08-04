/* eslint-disable import/no-anonymous-default-export */
// import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

import clientPromise from "@/components/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { query, answer, sources } = req.body;

    const client = await clientPromise;
    console.log("Connected to db");

    const db = client.db("test");
    const eventData = db.collection("athena-for-search");
    const result = await eventData.insertOne({
      query: query,
      athenaResponse: answer,
      sources: sources,
    });

    // Do not close the connection in a serverless environment
    // await client.close();
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error in insert.tsx:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Internal error", error });
  }
}