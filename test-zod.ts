import { z } from "zod";

const schema = z.object({
  requiredTierId: z.number().int().positive().nullable().optional(),
});

console.log(schema.safeParse({ requiredTierId: null }));
console.log(schema.safeParse({ requiredTierId: undefined }));
console.log(schema.safeParse({ requiredTierId: 0 }));
console.log(schema.safeParse({ requiredTierId: NaN }));
console.log(schema.safeParse({ requiredTierId: "" }));
