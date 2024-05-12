import { Hono } from "hono";
import { detectType } from "../utils";
import { sha256 } from "hono/utils/crypto";
import { cache } from "hono/cache";

type Bindings = {
  DB: D1Database;
  MY_BUCKET: R2Bucket;
};

type Data = {
  body: string;
  width?: string;
  height?: string;
};

const maxAge = 60 * 60 * 24 * 90;
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

  return c.json({key});
});

images.get(
  '*',
  cache({
    cacheName: 'r2-image-worker'
  })
);

images.get('/:key', async (c) => {
  const key = c.req.param('key')

  const object = await c.env.MY_BUCKET.get(key)
  if (!object) return c.notFound()
  const data = await object.arrayBuffer()
  const contentType = object.httpMetadata?.contentType ?? ''
  return c.body(data, 200, {
    'Cache-Control': `public, max-age=${maxAge}`,
    'Content-Type': contentType
  })
})

export default images;
