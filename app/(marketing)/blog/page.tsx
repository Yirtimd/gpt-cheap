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
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">Blog</h1>
      <p className="mb-10 text-muted-foreground">AEO insights, product updates, and research.</p>

      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No posts yet.</p>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="block group">
                <h2 className="text-xl font-medium group-hover:underline">{post.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{post.description}</p>
                <time className="mt-2 block text-xs text-muted-foreground" dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
