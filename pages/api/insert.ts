/* eslint-disable import/no-anonymous-default-export */
// import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

// const prisma = new PrismaClient();

// //create 
// const createDoc = async (Query: string, Answer: string, Sources: string) => {
//   const doc = await prisma.athena_for_search.create({
//       data: {
//           Query,
//           Answer,
//           Sources,
//       }
//   });
//   return doc;
// };

// export default async function handle(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     switch (req.method) {
//       case 'POST': {
//         //create new doc
//         const { query, athenaResponse, sources } = req.body;
//         const doc = await createDoc(query, athenaResponse, sources);
//         return res.json(doc);
//       }
//       default: 
//         break;
//     }
//   } catch (error: any) {
//     return res.status(500).json({ message: error.message });
//   }
// };


// import { MongoClient, Collection, Db, Document, InsertOneResult } from 'mongodb';
// import clientPromise from '@/components/mongodb';
// import Test from '@/models/testModel';


// import { connectMongo
//  } from '@/utils/connectMongo';
// import { Model } from 'mongoose';
// type RequestBody = {
//   searchQuery: string;
//   answer: string;
//   setSearchQuery: any
// }



// interface TestResponse {
//   test: Model<any, {}, {}, {}, any>;
// }
// import clientPromise from "@/components/mongodb";

// export default async function handler(req: NextApiRequest, res:NextApiResponse) {

//   try {
//     const { query, answer, sources } = req.body;

//     const client = await clientPromise;
//     console.log(`connected to db`)
//     const db = client.db('test');
//     const eventData = db.collection('athena-for-search');
//     const result = await eventData.insertOne({ 
//       query: query,
//       athenaResponse: answer,
//       sources: sources, 
//     });
//     await client.close();
//     res.status(200).json(result);
//   } catch (error: any) {
//     console.error('Error in insert.tsx:', error);
//     console.error('Error details:', {
//       name: error.name,
//       message: error.message,
//       stack: error.stack,
//     });
//     res.status(500).json({ message: 'Internal error', error });
//   }
// }

// import { NextApiRequest, NextApiResponse } from "next";







//================================= //=================================//=================================//=================================//=================================
// import mongoose from "mongoose";

// if (!process.env.MONGODB_URL) {
//   throw new Error('Invalid environment variable: "MONGODB_URI"');
// }

// const uri = process.env.MONGODB_URL;

// const connectToDb = async () => {
//   if (mongoose.connection.readyState === 0) {
//     await mongoose.connect(uri);
//   }
// };

// const AthenaSchema = new mongoose.Schema({
//   query: String,
//   athenaResponse: String,
//   sources: [String],
// });

// const AthenaModel = mongoose.models.Athena || mongoose.model("athena-for-search", AthenaSchema);


// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     const { query, answer, sources } = req.body;

//     console.log("Request body:", { query, answer, sources });

//     await connectToDb();
//     console.log("Connected to db");


//     const result = await AthenaModel.create({
//       query: query,
//       athenaResponse: answer,
//       sources: sources,
//     });

//     console.log("Document inserted:", result);

//     res.status(200).json(result);
//   } catch (error: any) {
//     console.error("Error in insert.tsx:", error);
//     console.error("Error details:", {
//       name: error.name,
//       message: error.message,
//       stack: error.stack,
//       errors: error.errors,
//     });
//     res.status(500).json({ message: "Internal error", error });
//   }
// }













//================================= //=================================//=================================//=================================//=================================

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