import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  postImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      return { userId: "temp-user-id" };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url }; 
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
