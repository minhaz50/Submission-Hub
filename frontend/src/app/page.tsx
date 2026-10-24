import Image from "next/image";
import Link from "next/link";
import { Filter, Gauge, ShieldCheck, Copy } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Copy, title: "No duplicates", text: "A repository can only be submitted once, even if the link is written differently." },
  { icon: Gauge, title: "Spam protection", text: "Students can submit up to 5 projects every 10 minutes." },
  { icon: Filter, title: "Fast review queue", text: "Mentors filter and page through submissions, with the work done on the server." },
  { icon: ShieldCheck, title: "Role based access", text: "Students and mentors only see the pages and data meant for them." },
];

export default function Home() {
  return (
    <div>
      <header className="mx-auto flex h-24 max-w-6xl items-center justify-between px-4">
        <span className="flex items-center gap-2 font-bold">
          <Image src="/logo.svg" alt="" width={28} height={28} />
          Markup
        </span>
        <div className="flex items-center gap-4 sm:gap-8">
          <Link href="/login" className="text-xs font-extrabold uppercase tracking-wider hover:text-primary sm:text-sm">
            Log in / Sign up
          </Link>
          <Button asChild variant="brutal">
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">Submit your project. Get it reviewed.</h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            Students send in a repo and a live link. Mentors approve or reject them from one simple dashboard.
          </p>
          <div className="mt-10 flex flex-wrap gap-6">
            <Button asChild size="lg" variant="brutal">
              <Link href="/signup">Submit a project</Link>
            </Button>
            <Button asChild size="lg" variant="brutal">
              <Link href="/login">Mentor login</Link>
            </Button>
          </div>
        </div>
        <Image src="/hero.svg" alt="Dashboard showing approved, pending and rejected projects" width={480} height={360} priority className="w-full" />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <Reveal>
          <h2 className="text-3xl font-bold">Why it works</h2>
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 120}>
              <div className="h-full rounded-xl border border-border bg-card p-5">
                <f.icon className="size-6 text-primary" />
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-primary px-4 py-20 text-center text-primary-foreground">
        <Reveal>
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to hand it in?</h2>
          <Button asChild size="lg" variant="brutalLight" className="mt-8">
            <Link href="/signup">Create account</Link>
          </Button>
        </Reveal>
      </section>
    </div>
  );
}
