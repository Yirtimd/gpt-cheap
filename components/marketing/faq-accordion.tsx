"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ITEMS = [
  {
    q: "Why is this cheaper than Profound or Peec?",
    a: "Because we are not trying to sell to enterprise. We run a lean crawler on two providers, charge a flat monthly price, and skip the sales calls. The same core signal — where your brand shows up in AI answers — for an SMB budget.",
  },
  {
    q: "How do you query ChatGPT — API or web?",
    a: "We use the official APIs with web search enabled, so the answers reflect what an actual user would see when asking a live question. No cached results, no scraping the UI.",
  },
  {
    q: "How often will I get alerts?",
    a: "Only when something meaningful changes — mention rate drops, a new competitor appears, or your position shifts. No daily nag emails.",
  },
  {
    q: "What about Claude or Perplexity?",
    a: "Roadmap, not MVP. We are focused on ChatGPT and Gemini, which cover the overwhelming majority of consumer AI answers today.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Monthly billing, cancel from Settings, no phone calls or retention offers.",
  },
  {
    q: "Do you offer a free trial?",
    a: "No. We run real provider calls that cost money — giving away free trials would blow up our margins. Starter at $9/month is the cheapest real AEO monitoring you can buy.",
  },
  {
    q: "Can I monitor more than one brand?",
    a: "Yes, on the Pro plan you can monitor up to 3 brands with 30 queries split across them.",
  },
];

export function FaqAccordion() {
  return (
    <Accordion className="w-full">
      {ITEMS.map((item, i) => (
        <AccordionItem key={item.q} value={`item-${i}`} className="border-b py-1">
          <AccordionTrigger className="text-left font-medium hover:no-underline">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
