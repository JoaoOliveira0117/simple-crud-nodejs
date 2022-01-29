const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  if (!username) {
    return response.status(404).json({ error: "User not found" });
  }

  next();
}

app.post("/users", (request, response) => {
  const user = {
    id: uuidv4(),
    name: request.body.name,
    username: request.body.username,
    todos: request.body.todos || [],
  };

  const userExists = users.find((u) => u.username === user.username);

  if (userExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  users.push(user);
  return response.json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const user = users.find((u) => u.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const user = users.find((u) => u.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  const todo = {
    id: uuidv4(),
    title: request.body.title,
    done: false,
    deadline: new Date(request.body.deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const user = users.find((u) => u.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  const todo = user.todos.find((t) => t.id === request.params.id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  const newTodo = {
    ...todo,
    title: request.body.title,
    deadline: new Date(request.body.deadline),
  };

  const todoIndex = user.todos.findIndex((t) => t.id !== request.params.id);
  user.todos.splice(todoIndex, 1);
  user.todos.push(newTodo);
  const userIndex = users.findIndex((u) => u.sername !== user.username);
  users.splice(userIndex, 1);

  users.push(user);

  return response.json(newTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const user = users.find((u) => u.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  const todo = user.todos.find((t) => t.id === request.params.id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  const newTodo = {
    ...todo,
    done: true,
  };

  const newTodoList = user.todos.filter((t) => t.id !== newTodo.id);
  newTodoList.push(newTodo);
  const newUser = { ...user, todos: newTodoList };
  const userIndex = users.findIndex((u) => u.sername !== user.username);
  users.splice(userIndex, 1);

  users.push(newUser);

  return response.json(newTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const user = users.find((u) => u.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  const todo = user.todos.find((t) => t.id === request.params.id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  const todoIndex = user.todos.findIndex((t) => t.id !== request.params.id);
  user.todos.splice(todoIndex, 1);
  const userIndex = users.findIndex((u) => u.sername !== user.username);
  users.splice(userIndex, 1);

  users.push(user);

  return response.status(204).json({ message: "Success" });
});

module.exports = app;
