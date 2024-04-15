import { Hono } from "hono";
import { env } from "hono/adapter";

type Bindings = {
  DB: D1Database;
  MY_BUCKET: R2Bucket;
};

const images = new Hono<{ Bindings: Bindings }>();

images.post("/upload", async (c) => {
  const body = await c.req.parseBody();
  const file = body["filename"];
  try {
    if (file && file instanceof File && file.type === "image/png") {
      await c.env.MY_BUCKET.put("test.png", file);
      return c.json({ message: "success" + file.type });
    }
  } catch (e) {
    return c.json({ err: e }, 500);
  }
});

images.get("/:key", (c) => {
  const key = c.req.param("key");
  const { R2_PUB } = env<{ R2_PUB: string }>(c);
  return c.json({ message: R2_PUB + key });
});

export default images;
