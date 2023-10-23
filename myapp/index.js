const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require('bcrypt');
const cors = require("cors")


const app = express();
app.use(cors())
app.use(express.json());

const dbPath = path.join(__dirname, "tickets.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3009, () => {
      console.log("Server Running at http://localhost:3009/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/", async (request, response) => {
  response.send("Hello World!")
})

app.post("/users/", async (request, response) => {
    const { username, password } = request.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const selectUserQuery = `
      SELECT 
        * 
      FROM 
        user 
      WHERE 
        username = '${username}';`;
    const dbUser = await db.get(selectUserQuery);
    if (dbUser === undefined) {
      const createUserQuery = `
     INSERT INTO
      user (username, password)
     VALUES
      (
       '${username}',
       '${hashedPassword}'
      )`;
      await db.run(createUserQuery);
      response.send("User created successfully");
    } else {
      response.status(400);
      response.send("User already exists");
    }
  });

  app.post("/login/", async (request, response) => {
    const { username, password } = request.body;
    const selectUserQuery = `
      SELECT
        *
      FROM
        user
      WHERE 
        username = '${username}';`;
    const dbUser = await db.get(selectUserQuery);
  
    if (dbUser === undefined) {
      response.status(400);
      response.send("Invalid User");
    } else {
      const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
      if (isPasswordMatched === true) {
        response.send("Login Success!");
      } else {
        response.status(400);
        response.send("Invalid Password");
      }
    }
  });
  
