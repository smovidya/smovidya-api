import { Hono } from "hono";
import { env } from "hono/adapter";
import { detectType } from "../utils";
import { sha256 } from "hono/utils/crypto";

type Bindings = {
  DB: D1Database;
  MY_BUCKET: R2Bucket;
};

type Data = {
  body: string;
  width?: string;
  height?: string;
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

images.put("/upload", async (c) => {
  const data = await c.req.json<Data>();
  const base64 = data.body;
  if (!base64) return c.notFound();

  const type = detectType(base64);
  const body = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  let key;
  if (data.width && data.height) {
    key =
      (await sha256(body)) +
      `_${data.width}x${data.height}` +
      "." +
      type?.suffix;
  } else {
    key = (await sha256(body)) + "." + type?.suffix;
  }

  await c.env.MY_BUCKET.put(key, body, {
    httpMetadata: { contentType: type?.mimeType },
  });

  return c.text(key);
});

images.get("/:key", (c) => {
  const key = c.req.param("key");
  const { R2_PUB } = env<{ R2_PUB: string }>(c);
  return c.json({ message: R2_PUB + key });
});

export default images;
