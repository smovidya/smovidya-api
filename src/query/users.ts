import { PrismaPg } from "@prisma/adapter-pg-worker";
import { PrismaClient } from "@prisma/client";
import { Pool } from "@prisma/pg-worker";
import { Hono } from "hono";

type Bindings = {
  DB: D1Database;
  MY_BUCKET: R2Bucket;
};

const query = new Hono<{ Bindings: Bindings }>();

query.get("/", async (c) => {
  const connectionString = "postgresql://root:asd0949823192@smo67.cb4wya0wcaae.ap-southeast-1.rds.amazonaws.com:5432";

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  const count = await prisma.student.findMany({});
  return c.json(count);
});

export default query;
