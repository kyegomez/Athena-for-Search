import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from "pg";

//define the connection details
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB,
    password: process.env.DB_PASSWORD,
    port: 5432
})


interface UserData {
    userQuery: string;
    athenaResponse: string;
    sources: string[];
    time: string;
}


//function to insert user data into the database

export async function insertUserData(userData: UserData) {
    const { userQuery, athenaResponse, sources, time } = userData;


    //create a query to insert the user data
    const query = {
        text: `INSERT INTO athena-search(user_query, athena_response, sources, time)
                VALUES(${userQuery}, ${athenaResponse}, ${sources}, ${time}})`,
        values: [userQuery, athenaResponse, sources, time],
    }

    //use the connection pool to execute the query

    const client = await pool.connect()
    try {
        await client.query(query);
    } finally {
        client.release();
    }
}



//api endpoint]
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        //extract the user data from the request body
        const {userQuery, athenaResponse, sources, time} = req.body;

        //call the insertUserData function with the user data
        await insertUserData({ userQuery, athenaResponse, sources, time});

        //return a response to teh client side indicating success
        res.status(200).json({message: 'user data successfully inserted'});
    } catch (error) {
        //retun a response to the cliuent side indicating failure
        res.status(500).json({message: "An error occured while inserting user data"})
    }
}