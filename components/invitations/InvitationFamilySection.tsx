import type { InvitationContent } from "@/types/invitation";

type FamilySectionData = NonNullable<InvitationContent["family_section"]>;

interface Props {
  section: FamilySectionData;
  accent: string;
  textColor: string;
  borderColor: string;
}

export default function InvitationFamilySection({ section, accent, textColor, borderColor }: Props) {
  if (!section.enabled) return null;

  const groups = (section.groups ?? [])
    .map((group) => ({
      ...group,
      people: (group.people ?? []).filter((person) => person.name?.trim()),
    }))
    .filter((group) => group.people.length > 0);

  if (!groups.length) return null;

  const heading = section.heading?.trim();

  return (
    <section className="invitation-family-section mx-auto my-7 w-full max-w-2xl px-2">
      {heading && (
        <h2
          className="invitation-family-heading mx-auto mb-6 max-w-xl text-center font-[var(--font-display)] text-lg leading-relaxed sm:text-xl"
          style={{ color: accent }}
        >
          {heading}
        </h2>
      )}
      <div className={groups.length > 1 ? "mx-auto grid w-full max-w-[34rem] grid-cols-2 items-stretch gap-0" : "mx-auto grid w-full max-w-[34rem] grid-cols-1"}>
        {groups.map((group, groupIndex) => (
          <div
            key={groupIndex}
            className="invitation-family-group flex min-w-0 flex-col items-center px-3 text-center sm:px-6"
            style={groupIndex > 0 && groups.length > 1 ? { borderLeft: `1px solid ${borderColor}99` } : undefined}
          >
            {group.title?.trim() && (
              <h3
                className="invitation-family-group-title mb-4 w-full text-center text-[9px] font-semibold uppercase tracking-[0.16em] leading-relaxed sm:text-[10px] sm:tracking-[0.2em]"
                style={{ color: accent }}
              >
                {group.title.trim()}
              </h3>
            )}
            <div className="flex w-full flex-col items-center gap-5">
              {group.people.map((person, personIndex) => (
                <div key={personIndex} className="min-w-0 w-full text-center">
                  {person.role?.trim() && (
                    <p className="mb-1 text-[8px] uppercase tracking-[0.14em] text-current opacity-70 sm:text-[9px] sm:tracking-[0.18em]">
                      {person.role.trim()}
                    </p>
                  )}
                  <p
                    className="mx-auto max-w-full break-words font-[var(--font-display)] text-sm leading-relaxed sm:text-base"
                    style={{ color: textColor, overflowWrap: "anywhere" }}
                  >
                    {person.name.trim()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
