import { Hono } from "hono";
import query from "./query/users";
import images from "./query/image";
import { cors } from "hono/cors";
import auth from "./auth/auth";

// This ensures c.env.DB is correctly typed
type Bindings = {
  DB: D1Database;
  MY_BUCKET: R2Bucket;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("/*", cors());

app.route("/images", images);
app.route("/query", query);
app.route("/auth", auth);

// Export our Hono app: Hono automatically exports a
// Workers 'fetch' handler for you
export default app;
