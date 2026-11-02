import type { LegalSection } from "@/content/legal/types";

// The numbered sections in one white card, separated by hairlines.
export function LegalSections({ sections }: { sections: LegalSection[] }) {
  return (
    <div className="flex flex-col divide-y divide-line-3 rounded-2xl border border-line-2 bg-white px-5 py-2 md:px-8">
      {sections.map((section, index) => (
        <section key={section.id} id={section.id} aria-labelledby={`${section.id}-h`} className="flex scroll-mt-6 flex-col gap-2 py-5.5">
          <h2 id={`${section.id}-h`} className="m-0 flex gap-2.5 text-[19px] leading-[1.45] font-semibold">
            <span className="text-brand">{index + 1}.</span>
            {section.title}
          </h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="m-0 text-[15px] leading-[1.75] text-ink-body">
              {paragraph}
            </p>
          ))}
          {section.bullets.length > 0 && (
            <ul className="m-0 flex flex-col gap-1.5 pl-5.5 text-[15px] leading-[1.7] text-ink-body">
              {section.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
