export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-2xl px-6 py-16 [&_h1]:mb-2 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-medium [&_p]:my-3 [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-muted-foreground [&_li]:my-1 [&_a]:text-primary [&_a]:underline">
      {children}
    </article>
  );
}
