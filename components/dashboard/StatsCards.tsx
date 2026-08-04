type Props = {
  totalEvents: number;
};

export default function StatsCards({
  totalEvents,
}: Props) {
  return (
    <section className="rounded-3xl border border-[#E7DCC8] bg-[#FDFBF8] p-8 text-center shadow-sm">
      <p className="text-5xl font-semibold text-[#B08D57]">
        {totalEvents}
      </p>

      <p className="mt-2 text-[#7D7467]">
        Evento{totalEvents !== 1 ? "s" : ""} registrado
        {totalEvents !== 1 ? "s" : ""}
      </p>
    </section>
  );
}