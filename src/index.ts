import { Hono } from "hono";
import query from "./query/users";
import images from "./query/image";

// This ensures c.env.DB is correctly typed
type Bindings = {
  DB: D1Database;
  MY_BUCKET: R2Bucket;
};

const app = new Hono<{ Bindings: Bindings }>();

app.route('/images', images);
app.route('/query', query);

// Export our Hono app: Hono automatically exports a
// Workers 'fetch' handler for you
export default app;
