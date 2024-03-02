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

// GET single Person
app.get("/api/persons/:id", (request, response, next) => {
  PhoneNumber.findById(request.params.id)
    .then((phoneNumber) => response.json(phoneNumber))
    .catch((error) => next(error));
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

  const person = new PhoneNumber({
    name: content.name,
    number: content.number,
  });
  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;
  const phoneNumber = {
    name: body.name,
    number: body.number,
  };

  PhoneNumber.findByIdAndUpdate(request.params.id, phoneNumber, { new: true })
    .then((updatedPhoneNumber) => {
      response.json(updatedPhoneNumber);
    })
    .catch((error) => next(error));
});

// DELETE single Person
app.delete("/api/persons/:id", (request, response, next) => {
  PhoneNumber.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// Catch all
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
