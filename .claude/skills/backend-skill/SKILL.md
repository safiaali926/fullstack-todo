---
name: backend-skill
description: Build scalable backend systems by generating routes, handling requests and responses, and connecting to databases.
---

# Backend Skill – API & Server Logic

## Instructions

1. **Route Generation**
   - Define RESTful endpoints
   - Use proper HTTP methods (GET, POST, PUT, DELETE)
   - Group routes by resource

2. **Request Handling**
   - Validate request data
   - Parse body and query parameters
   - Handle authentication middleware

3. **Response Handling**
   - Return proper status codes
   - Send consistent JSON responses
   - Handle errors gracefully

4. **Database اتصال (Connection)**
   - Connect to SQL or NoSQL database
   - Use ORM/ODM (Prisma, Sequelize, Mongoose)
   - Manage connection pooling

5. **Business Logic**
   - Separate controllers and services
   - Avoid fat routes
   - Write reusable functions

## Best Practices
- Follow MVC or clean architecture  
- Never expose sensitive data  
- Use environment variables  
- Add logging and monitoring  
- Write unit tests for APIs  

## Example Structure
```ts
// routes/user.ts
router.get("/users", async (req, res) => {
  const users = await userService.getAll();
  res.status(200).json(users);
});

// controller/user.controller.ts
export async function createUser(req, res) {
  const user = await userService.create(req.body);
  res.status(201).json(user);
}
