const express = require('express');
const app = express();

const loggerMiddleware = (req, res, next) => {
  console.log(`${new Date()} --- Request [${req.method}] ${req.url}`);
  next();
};

app.use(loggerMiddleware);

const userRoutes = require("./routes/userRoutes");
app.use("/users", userRoutes);

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});