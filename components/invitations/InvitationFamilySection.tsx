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
    <section className="invitation-family-section mx-auto mt-6 mb-5 w-full max-w-3xl px-1">
      {heading && (
        <h2
          className="invitation-family-heading mb-5 text-center font-[var(--font-display)] text-lg sm:text-xl"
          style={{ color: accent }}
        >
          {heading}
        </h2>
      )}
      <div className={groups.length > 1 ? "grid grid-cols-2 items-start gap-3 sm:gap-6" : "mx-auto grid max-w-xl grid-cols-1"}>
        {groups.map((group, groupIndex) => (
          <div
            key={groupIndex}
            className="invitation-family-group min-w-0 px-1 text-center sm:px-3"
            style={groupIndex > 0 && groups.length > 1 ? { borderLeft: `1px solid ${borderColor}` } : undefined}
          >
            {group.title?.trim() && (
              <h3
                className="invitation-family-group-title mb-3 text-[9px] font-semibold uppercase tracking-[0.18em] sm:text-[10px] sm:tracking-[0.22em]"
                style={{ color: accent }}
              >
                {group.title.trim()}
              </h3>
            )}
            <div className="flex flex-col items-center gap-4">
              {group.people.map((person, personIndex) => (
                <div key={personIndex} className="min-w-0 w-full text-center">
                  {person.role?.trim() && (
                    <p className="mb-1 text-[8px] uppercase tracking-[0.14em] text-current opacity-70 sm:text-[9px] sm:tracking-[0.18em]">
                      {person.role.trim()}
                    </p>
                  )}
                  <p
                    className="break-words font-[var(--font-display)] text-sm leading-snug sm:text-base"
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
