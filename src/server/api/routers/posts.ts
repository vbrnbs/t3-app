import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const PostsRouter = createTRPCRouter({

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.post.findMany();
  }),
});
