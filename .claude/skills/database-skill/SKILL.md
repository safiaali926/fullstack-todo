---
name: database-skill
description: Design and manage databases with table creation, migrations, schema design, and optimization.
---

# Database Skill – Schema Design & Migrations

## Instructions

1. **Schema Design**
   - Identify entities and relationships
   - Normalize data (avoid duplication)
   - Choose correct data types

2. **Create Tables**
   - Define primary keys
   - Use foreign keys for relations
   - Add indexes for performance

3. **Migrations**
   - Track schema changes over time
   - Write reversible migrations
   - Apply migrations safely in production

4. **Constraints & Integrity**
   - Use NOT NULL, UNIQUE, CHECK
   - Enforce referential integrity
   - Prevent orphan records

5. **Performance Optimization**
   - Use indexes wisely
   - Avoid N+1 queries
   - Analyze slow queries

## Best Practices
- Keep schemas simple and consistent  
- Use snake_case or camelCase consistently  
- Never edit production data manually  
- Always backup before migrations  
- Document schema changes  

## Example Structure
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
