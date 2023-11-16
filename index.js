const express = require("express");
const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const path = require("path");
const app = express();
const methodOverride = require("method-override");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));


//this is the connection to the database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "personal_diary",
  password: "mysqlnitish24",
});

//home page for the project
app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.post("/checkuser", (req, res) => {
  const user = req.body;
  let q = `SELECT * FROM user_details WHERE username='${user.username}';`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      if (result.length === 0) {
        res.send("No such User avilable");//sends an error message that user is not avilable
      } else {
        let userPassword = user.Password.trim();
        let checkPassword = result[0].password.trim();
        if (userPassword === checkPassword) {
          let q3 = `select id from user_details where username = '${user.username}'`;
          try {
            connection.query(q3, (err, result) => {
              if (err) throw err;
              let userId = result[0].id;
              res.render("main.ejs", { user, userId });
            });
          } catch (err) {
            console.log(err);
          }
        } else {
          //if user enters wrong data it shows error 
          res.send("You have entered wrong data please enter again");
        }
      }
    });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

//to register and check if there are duplicate data in database
app.get("/registeruser", (req, res) => {
  res.render("register.ejs");
});

//to register and check if there are duplicate data in database
app.post("/registeruser", (req, res) => {
  const id = faker.string.uuid();
  let user = req.body;
  let q = `SELECT * FROM user_details WHERE email='${user.email}';`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      if (result.length === 1) {
        res.render("already.ejs");
      }
      let q2 = `INSERT INTO user_details (id, username, email, password) VALUES ('${id}','${user.username}', '${user.email}', '${user.password}');`;
      try {
        connection.query(q2, (err, result) => {
          if (err) throw err;
          res.render("success.ejs");
        });
      } catch (err) {
        console.log(err);
        res.send(err);
      }
    });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

//to update a post
app.post("/main/allentries/:id", (req, res) => {
  let id = req.params.id;
  let q = `select * from diary_entries where '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      res.render("entries.ejs", { result });
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/main/allentries/:id/edit", (req, res) => {
  let id = req.params.id;
  let q = `SELECT * FROM diary_entries WHERE id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      let user = result[0];
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    console.log(err);
  }
});

app.patch("/main/allentries/:id", (req, res) => {
  let q = `UPDATE diary_entries SET content='${req.body.content}' WHERE id = '${req.params.id}'`;
  try {
    connection.query(q, (err, result) => {
      let q2 = `SELECT userid FROM diary_entries WHERE id = '${req.params.id}'`;
      try {
        connection.query(q2, (err, result) => {
          let q3 = `select * from diary_entries where '${result[0].userid}'`;
          try {
            connection.query(q3, (err, result) => {
              if (err) throw err;
              res.render("entries.ejs", { result });
            });
          } catch (err) {
            console.log(err);
          }
        });
      } catch (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log(err);
  }
});

//this route is used to delete a particular entry in the diary
app.delete("/main/allentries/:id", (req, res) => {
  let q = `SELECT userid FROM diary_entries WHERE id = '${req.params.id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let id = result[0].userid;
      let q2 = `DELETE FROM diary_entries WHERE id = '${req.params.id}'`;
      try {
        connection.query(q2, (err, result) => {
          let q3 = `select * from diary_entries where '${id}'`;
          try {
            connection.query(q3, (err, result) => {
              if (err) throw err;
              res.render("entries.ejs", { result });
            });
          } catch (err) {
            console.log(err);
          }
        });
      } catch (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log(err);
  }
});

//this route is used to take a new entry into the database
app.post("/main/newentry/:id", (req, res) => {
  let mainid = req.params.id;
  res.render("newentry.ejs", { mainid });
});

app.post("/main/newentry/:id/new", (req, res) => {
  let contentid = faker.string.uuid();
  let userid = req.params.id;
  let q = `INSERT INTO diary_entries(id,userid,entrydate,content) VALUES ('${contentid}','${userid}','${req.body.diaryDate}','${req.body.content}')`;
  try {
    connection.query(q, (err, result) => {
      let q3 = `select * from diary_entries where '${userid}'`;
      try {
        connection.query(q3, (err, result) => {
          if (err) throw err;
          res.render("entries.ejs", { result });
        });
      } catch (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log(err);
  }
});

app.listen(8080, () => {
  console.log("server is listening");
});
