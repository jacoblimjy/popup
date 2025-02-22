const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const childrenRoutes = require("./routes/childrenRoutes");

const app = express();

const loggerMiddleware = (req, res, next) => {
  console.log(`${new Date()} --- Request [${req.method}] ${req.url}`);
  next();
};

app.use(loggerMiddleware);
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/children", childrenRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
