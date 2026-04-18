"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ITEMS = [
  {
    q: "How is this different from Profound, Peec, or AthenaHQ?",
    a: "Those tools target enterprise with $500+/mo pricing. We serve the long tail — freelancers, solo founders, and SMBs who need AEO monitoring without an enterprise budget.",
  },
  {
    q: "Which AI providers do you monitor?",
    a: "OpenAI (ChatGPT via Responses API) and Google Gemini, both with web search enabled. Claude and Perplexity are on the roadmap.",
  },
  {
    q: "How accurate is the mention detection?",
    a: "We use a separate LLM-based judge with structured output for every response, with 1x–3x replication depending on your plan. Majority voting reduces false positives compared to regex matching.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes — monthly billing, cancel or downgrade anytime via the customer portal. No annual lock-in, no hidden fees.",
  },
  {
    q: "How often are runs executed?",
    a: "Starter runs weekly. Growth and Pro run daily. Each run tests all your active queries across both providers.",
  },
  {
    q: "Do you support custom prompts or only pre-set ones?",
    a: "You write the exact prompts yourself. We recommend 3–5 well-crafted queries that match real customer intent — we will help you calibrate after the first week.",
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
