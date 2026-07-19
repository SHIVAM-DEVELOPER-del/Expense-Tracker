import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";

import userRouter from "./routes/userRoute.js";
import incomeRouter from "./routes/incomeRoute.js";
import expenseRouter from "./routes/expenseRoute.js";
import dashboardRouter from "./routes/dashboardRoute.js";

const app = express();
const port = process.env.PORT || 4000;

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database
connectDB();

// Routes
app.use("/api/user", userRouter);
app.use("/api/income", incomeRouter);
app.use("/api/expense", expenseRouter);
app.use("/api/dashboard", dashboardRouter);

app.get("/", (req, res) => {
  res.send("API WORKING");
});

app.listen(port, () => {
  console.log(`Server Started on Port ${port}`);
});