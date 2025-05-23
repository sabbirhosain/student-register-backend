import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import database_configuration from "./src/Config/Configuration.js";
import ApiRouter from "./src/Routes/ApiRouter.js"
import morgan from "morgan";

dotenv.config();
const PORT = process.env.SERVER_PORT || 5000;

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    limit: 10, //max request 10 per minute
    message: { message: 'Too many requests from this IP, please try again after 1 minutes.'}
})

// connect the express with middleware
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
// app.use(limiter);

// CORS policy
app.use(cors());

// database connection
database_configuration()

// first version api url
app.use("/api/v1", ApiRouter);

// running the server GET request
app.get("/", (req, res) => {
    res.send("Server running Successfully!")
})

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
})