import { Card, CardContent } from "@/components/ui/card";

type Props = {
  totalEvents: number;
};

export default function StatsCards({
  totalEvents,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            Eventos
          </p>

          <p className="text-4xl font-bold">
            {totalEvents}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            Fotos
          </p>

          <p className="text-4xl font-bold">
            0
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            Almacenamiento
          </p>

          <p className="text-4xl font-bold">
            0 MB
          </p>
        </CardContent>
      </Card>
    </div>
  );
}