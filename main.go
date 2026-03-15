package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
)

type Todo struct {
	ID        int    `json:"id"`
	Completed bool   `json:"completed"`
	Body      string `json:"body"`
}

func main() {
	fmt.Println("Hello World")
	app := fiber.New()

	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	PORT := os.Getenv("PORT")
	if PORT == "" {
		log.Fatal("$PORT must be set")
	}

	todos := []Todo{}

	app.Get("/api/getTodos", func(c *fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{
			"data": todos,
		})
	})

	app.Post("/api/createTodos", func(c *fiber.Ctx) error {
		todo := &Todo{}

		if err := c.BodyParser(todo); err != nil {
			return err
		}

		if todo.Body == "" {
			fmt.Println("Body cannot be empty", todo)
			return c.Status(400).JSON(fiber.Map{
				"message": "Body cannot be empty",
			})
		}

		for _, t := range todos {
			if t.Body == todo.Body {
				return c.Status(400).JSON(fiber.Map{
					"message": "Todo already exists",
				})
			}
		}

		todo.ID = len(todos) + 1
		todos = append(todos, *todo)

		return c.Status(200).JSON(todo)

	})

	app.Patch("/api/updateTodos/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")

		for i, t := range todos {
			if fmt.Sprint(t.ID) == id {
				todos[i] = Todo{
					ID:        t.ID,
					Completed: true,
					Body:      t.Body,
				}
				return c.Status(200).JSON(todos[i])
			}
		}

		return c.Status(404).JSON(fiber.Map{
			"message": "Todo Not Found",
		})
	})

	app.Delete("/api/deleteTodos/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")

		for i, t := range todos {
			if fmt.Sprint(t.ID) == id {
				todos = append(todos[:i], todos[i+1:]...)
				return c.Status(200).JSON(todos)
			}
		}
		return c.Status(404).JSON(fiber.Map{
			"message": "Todo Not Found",
		})
	})
	log.Fatal(app.Listen(":" + PORT)) // server running on port 4000

}
