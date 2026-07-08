import express from "express"
import { connectDB } from "./config/db.js"
import dotenv from "dotenv"

dotenv.config();

const app = express();
app.use(express.json());

connectDB();

app.listen(process.env.PORT, () =>
{
    console.log(`Server started at ${process.env.PORT}`);
});