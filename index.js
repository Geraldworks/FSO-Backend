require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

// This will require the module from the file,
const PhoneNumber = require("./models/phoneNumber");

const app = express();

// const logger = morgan("tiny");

// Custom logger
const customLogger = morgan((tokens, req, res) => {
  let logs = [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, "content-length"),
    "-",
    tokens["response-time"](req, res),
    "ms",
  ];

  if (tokens.method(req, res) === "POST") {
    logs = logs.concat(JSON.stringify(req.body));
  }

  return logs.join(" ");
});

// Middleware
app.use(express.static("dist"));
app.use(cors());
app.use(express.json());
app.use(customLogger);

// let persons = [
//   {
//     id: 1,
//     name: "Arto Hellas",
//     number: "040-123456",
//   },
//   {
//     id: 2,
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//   },
//   {
//     id: 3,
//     name: "Dan Abramov",
//     number: "12-43-234345",
//   },
//   {
//     id: 4,
//     name: "Mary Poppendieck",
//     number: "39-23-6423122",
//   },
// ];

// GET info

app.get("/info", (request, response) => {
  PhoneNumber.find({}).then((result) => {
    response.send(
      `
    <p>Phonebook has info for ${result.length} people</p>
    <p>${new Date()}</p>
    `
    );
  });
});

// GET all Persons
app.get("/api/persons", (request, response) => {
  PhoneNumber.find({}).then((result) => {
    response.json(result);
  });
});

// GET single Person (TBC)
app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

// POST single Person
app.post("/api/persons", (request, response) => {
  const content = request.body;

  // Checking for validity of content
  if (!content.name) {
    return response.status(400).json({
      error: "name missing",
    });
  } else if (!content.number) {
    return response.status(400).json({
      error: "number missing",
    });
  } 
  // else if (persons.find((person) => person.name === content.name)) {
  //   return response.status(400).json({
  //     error: "name must be unique",
  //   });
  // }

  const person = new PhoneNumber({
    name: content.name,
    number: content.number,
  });
  person.save().then((savedPerson) => {
    response.json(savedPerson)
  })
});

// DELETE single Person (TBC)
app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

// Catch all
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
