const { Router } = require("express");

const UsersController = require("../controllers/UsersController");

const usersRoutes = Router();

const usersController = new UsersController();

function myMiddleware(request, response, next){
  console.log("você passou pelo Middleware!")

  /*if(!request.body.isAdmin) */
  if(!request.body){
    return response.json({message: "user unauthorized"});
  }

  next();
}

usersRoutes.post("/", myMiddleware, usersController.create)
usersRoutes.put("/:id", usersController.update);

module.exports = usersRoutes;