import { Hono } from "hono";

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

export default query;
