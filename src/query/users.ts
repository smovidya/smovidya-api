import { Hono } from "hono";
import { PrismaClient, User } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

type Bindings = {
  DB: D1Database;
  MY_BUCKET: R2Bucket;
};

const query = new Hono<{ Bindings: Bindings }>();

query.get("/users/:id", async (c) => {
  const userId = c.req.param("id");
  try {
    let { results } = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?")
      .bind(userId)
      .all();
    return c.json(results);
  } catch (e) {
    return c.json({ err: e }, 500);
  }
});

query.get("/count", async (c) => {
  const adapter = new PrismaD1(c.env.DB);
  const prisma = new PrismaClient({ adapter });
  const count = await prisma.user.count();
  return c.json({ count: count });
});

query.post("/users", async (c) => {
  const data = await c.req.json<User>();
  const adapter = new PrismaD1(c.env.DB);
  const prisma = new PrismaClient({ adapter });
  const count = await prisma.user.create({data: {
    name: data.name,
    email: data.email || "",
  }});
  return c.json({ count: count });
});

export default query;
