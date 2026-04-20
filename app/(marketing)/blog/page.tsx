import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — ChatGPT.cheap",
  description: "AEO insights, product updates, and research on how AI recommends brands.",
};

export default async function BlogIndexPage() {
  const posts = await getAllPosts();

  return (
    <div className="mx-auto max-w-[48rem] px-6 py-20 sm:py-24">
      <h1 className="h1-hero text-[clamp(36px,4.5vw,48px)]">Blog</h1>
      <p className="lead-text mt-2">Notes from building a profitable SMB AEO tool.</p>

      <div className="mt-12 flex flex-col">
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No posts yet.</p>
        ) : (
          posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block border-b py-6">
              <h2 className="text-xl font-semibold tracking-[-0.01em] group-hover:text-brand">
                {post.title}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground text-pretty">{post.description}</p>
              <div className="mt-2.5 flex gap-2.5 text-xs text-muted-foreground">
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
