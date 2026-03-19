package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Todo struct {
	ID        primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Completed bool               `json:"completed"`
	Body      string             `json:"body"`
}

var collection *mongo.Collection

func main() {
	fmt.Println("Hello world")

	if os.Getenv("ENV") != "production" {
		err := godotenv.Load(".env")
		if err != nil {
			fmt.Println("Error loading .env file")
		}
	}

	MONGODB_URL := os.Getenv("MONGODB_URL")
	clientOptions := options.Client().ApplyURI(MONGODB_URL)
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	defer client.Disconnect(context.TODO())

	fmt.Println("Connected to MongoDB!")
	collection = client.Database("golang_db").Collection("todos")

	app := fiber.New()

	// app.Use(cors.New(cors.Config{AllowOrigins: "http://localhost:3000/"}))

	app.Get("/api/getTodos", getTodos)
	app.Post("/api/createTodos", createTodos)
	app.Patch("/api/completeTodos/:id", completeTodos)
	app.Delete("/api/deleteTodos/:id", deleteTodos)
	app.Patch("/api/updateTodos/:id", updateTodos)

	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}

	if os.Getenv("ENV") == "production" {
		app.Static("/", "./todofrontend/build")
	}

	log.Fatal(app.Listen("0.0.0.0:" + port))
}

func getTodos(c *fiber.Ctx) error {
	todos := []Todo{}

	cursor, err := collection.Find(context.TODO(), bson.M{})

	if err != nil {
		return err
	}

	defer cursor.Close(context.TODO())

	for cursor.Next(context.TODO()) {
		var todo Todo
		if err := cursor.Decode(&todo); err != nil {
			return err
		}
		todos = append(todos, todo)
	}

	return c.JSON(todos)

}

func createTodos(c *fiber.Ctx) error {
	todo := new(Todo)

	if err := c.BodyParser(todo); err != nil {
		return err
	}

	if todo.Body == "" {
		return fiber.ErrBadRequest
	}

	insertResult, err := collection.InsertOne(context.TODO(), todo)
	if err != nil {
		return err
	}

	todo.ID = insertResult.InsertedID.(primitive.ObjectID)

	return c.Status(201).JSON(todo)

}

func updateTodos(c *fiber.Ctx) error {
	id := c.Params("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"message": "Invalid Todo ID",
		})
	}

	filter := bson.M{"_id": objectID}

	var todo Todo
	if err := c.BodyParser(&todo); err != nil {
		return err
	}

	if todo.Body == "" {
		return fiber.ErrBadRequest
	}

	update := bson.M{"$set": bson.M{"body": todo.Body, "completed": false}}

	_, err = collection.UpdateOne(context.TODO(), filter, update)

	if err != nil {
		return err
	}

	return c.Status(200).JSON(fiber.Map{
		"message": "Todo updated successfully",
	})
}

func completeTodos(c *fiber.Ctx) error {
	id := c.Params("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"message": "Invalid Todo ID",
		})
	}

	filter := bson.M{"_id": objectID}
	update := bson.M{"$set": bson.M{"completed": true}}

	_, err = collection.UpdateOne(context.TODO(), filter, update)

	if err != nil {
		return err
	}

	return c.Status(200).JSON(fiber.Map{
		"message": "Todo updated successfully",
	})
}

func deleteTodos(c *fiber.Ctx) error {
	id := c.Params("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"message": "Invalid Todo ID",
		})
	}

	filter := bson.M{"_id": objectID}

	_, err = collection.DeleteOne(context.TODO(), filter)

	if err != nil {
		return err
	}

	return c.Status(200).JSON(fiber.Map{
		"message": "Todo deleted successfully",
	})
}
