import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/env";
import * as schema from "./schema";

const sql = neon(env.DATABASE_URL!);
export const database = drizzle({ client: sql, schema });
