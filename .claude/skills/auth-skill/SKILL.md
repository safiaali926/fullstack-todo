---
name: auth-skill
description: Implement secure authentication systems with signup, signin, password hashing, JWT tokens, and Better Auth integration.
---

# Auth Skill – Secure Authentication Systems

## Instructions

1. **User Signup**
   - Validate input (email, password strength)
   - Hash password before storing
   - Prevent duplicate accounts

2. **User Signin**
   - Compare hashed passwords
   - Handle invalid credentials
   - Rate-limit login attempts

3. **Password Security**
   - Use strong hashing (bcrypt / argon2)
   - Never store plain text passwords
   - Add salt automatically

4. **JWT Tokens**
   - Generate access token on login
   - Set expiration time
   - Store token securely (HTTP-only cookies or memory)

5. **Better Auth Integration**
   - Use Better Auth providers
   - Enable social login if needed
   - Centralize session management

## Best Practices
- Enforce strong password rules  
- Use HTTPS only  
- Rotate JWT secrets  
- Implement refresh tokens  
- Log auth events (without sensitive data)  

## Example Structure

### Signup
```ts
app.post("/signup", async (req, res) => {
  const hashed = await bcrypt.hash(req.body.password, 10);
  const user = await db.user.create({
    email: req.body.email,
    password: hashed,
  });
  res.json(user);
});
