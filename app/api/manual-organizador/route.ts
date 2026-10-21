import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PW = 612, PH = 792, M = 48, CW = PW - 2 * M;
const C = {
  navy: rgb(0.14, 0.20, 0.25), gold: rgb(0.65, 0.49, 0.28),
  goldPale: rgb(0.97, 0.94, 0.88), paper: rgb(1, 0.994, 0.98),
  pale: rgb(0.98, 0.97, 0.94), border: rgb(0.88, 0.85, 0.79),
  ink: rgb(0.19, 0.17, 0.15), muted: rgb(0.36, 0.33, 0.30),
  green: rgb(0.20, 0.40, 0.29), greenPale: rgb(0.92, 0.96, 0.93),
};
function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/), lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? line + " " + word : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth || !line) line = candidate;
    else { lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines;
}

export async function GET() {
  const pdf = await PDFDocument.create();
  pdf.setTitle("Manual del panel del organizador");
  pdf.setSubject("Guía rápida para gestionar invitados, invitaciones y confirmaciones");
  pdf.setAuthor("Melissarte · Invitaciones Digitales");
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);
  let page = null as unknown as PDFPage;
  let y = PH - 60, pageNo = 0;

  function startPage() {
    page = pdf.addPage([PW, PH]); pageNo++;
    page.drawRectangle({ x: 0, y: 0, width: PW, height: PH, color: C.paper });
    page.drawText("MELISSARTE  /  INVITACIONES DIGITALES", { x: M, y: PH - 35, size: 8, font: bold, color: C.navy, characterSpacing: 0.8 });
    page.drawText("MANUAL RÁPIDO", { x: PW - M - 94, y: PH - 35, size: 7.5, font: bold, color: C.gold, characterSpacing: 0.6 });
    page.drawLine({ start: { x: M, y: PH - 45 }, end: { x: PW - M, y: PH - 45 }, thickness: 1, color: C.border });
    y = PH - 62;
  }
  function finishPage() {
    page.drawLine({ start: { x: M, y: 38 }, end: { x: PW - M, y: 38 }, thickness: 0.7, color: C.border });
    page.drawText("Manual rápido del panel del organizador  •  " + pageNo, { x: M, y: 22, size: 8, font: regular, color: C.muted });
  }
  function paragraph(text: string, opt: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; x?: number; width?: number; lineHeight?: number; after?: number } = {}) {
    const size = opt.size ?? 9.5, font = opt.font ?? regular, color = opt.color ?? C.ink;
    const x = opt.x ?? M, width = opt.width ?? CW, lineHeight = opt.lineHeight ?? size * 1.38;
    for (const line of wrapText(text, font, size, width)) {
      page.drawText(line, { x, y, size, font, color }); y -= lineHeight;
    }
    y -= opt.after ?? 4;
  }
  function section(title: string) {
    y -= 3; page.drawText(title, { x: M, y, size: 12.5, font: bold, color: C.navy }); y -= 5;
    page.drawLine({ start: { x: M, y }, end: { x: PW - M, y }, thickness: 1.1, color: C.gold }); y -= 11;
  }
  function callout(title: string, body: string, kind: "gold" | "green" = "gold") {
    const fill = kind === "green" ? C.greenPale : C.goldPale, stripe = kind === "green" ? C.green : C.gold;
    const lines = wrapText(body, regular, 9, CW - 36), height = 23 + lines.length * 11 + 8;
    page.drawRectangle({ x: M, y: y - height, width: CW, height, color: fill, borderColor: C.border, borderWidth: 0.6 });
    page.drawRectangle({ x: M, y: y - height, width: 4, height, color: stripe });
    page.drawText(title, { x: M + 14, y: y - 15, size: 9.3, font: bold, color: C.navy });
    let lineY = y - 28;
    for (const line of lines) { page.drawText(line, { x: M + 14, y: lineY, size: 9, font: regular, color: C.ink }); lineY -= 11; }
    y -= height + 9;
  }
  function step(number: number, title: string, body: string) {
    y -= 1;
    page.drawCircle({ x: M + 8, y: y - 2, size: 8, color: C.gold });
    page.drawText(String(number), { x: M + (number > 9 ? 3 : 5.5), y: y - 5, size: 7.2, font: bold, color: rgb(1, 1, 1) });
    page.drawText(title, { x: M + 24, y: y - 4, size: 9.4, font: bold, color: C.ink }); y -= 13;
    paragraph(body, { size: 8.8, x: M + 24, width: CW - 24, lineHeight: 10.5, after: 3, color: C.muted });
  }
  function bullet(text: string) {
    page.drawCircle({ x: M + 4, y: y + 2, size: 2.2, color: C.gold });
    paragraph(text, { size: 9.1, x: M + 14, width: CW - 14, lineHeight: 12, after: 3 });
  }
  function table(headers: string[], rows: string[][], widths: number[]) {
    y -= 2; const hh = 22;
    page.drawRectangle({ x: M, y: y - hh, width: CW, height: hh, color: C.navy });
    let x = M;
    headers.forEach((header, i) => {
      const lines = wrapText(header, bold, 7.8, widths[i] - 14), sy = y - (lines.length > 1 ? 8 : 13);
      lines.forEach((line, li) => page.drawText(line, { x: x + 7, y: sy - li * 8.3, size: 7.8, font: bold, color: rgb(1, 1, 1) }));
      x += widths[i];
    });
    y -= hh;
    rows.forEach((row, ri) => {
      const cells = row.map((cell, i) => wrapText(cell || "—", regular, 7.9, widths[i] - 14));
      const maxLines = Math.max(1, ...cells.map(lines => lines.length)), rh = Math.max(20, maxLines * 9.2 + 8);
      page.drawRectangle({ x: M, y: y - rh, width: CW, height: rh, color: ri % 2 === 0 ? rgb(1, 1, 1) : C.pale, borderColor: C.border, borderWidth: 0.35 });
      let cx = M;
      cells.forEach((lines, i) => {
        lines.forEach((line, li) => page.drawText(line, { x: cx + 7, y: y - 12 - li * 9.2, size: 7.9, font: regular, color: C.ink }));
        cx += widths[i];
      });
      y -= rh;
    });
    y -= 7;
  }

  startPage();
  page.drawText("GUÍA RÁPIDA  ·  PASO A PASO", { x: M, y, size: 8.5, font: bold, color: C.gold, characterSpacing: 1.2 });
  y -= 30; page.drawText("Manual del panel", { x: M, y, size: 27, font: bold, color: C.navy });
  y -= 31; page.drawText("del organizador", { x: M, y, size: 27, font: bold, color: C.navy }); y -= 19;
  paragraph("Cómo registrar invitados, enviar invitaciones por WhatsApp y controlar las respuestas, sin complicaciones.", { size: 10.2, color: C.muted, lineHeight: 14, after: 9 });
  callout("Lo más importante", "El panel prepara el mensaje, pero no lo envía por sí solo. Debes pulsar Enviar en WhatsApp y después marcar la invitación como enviada dentro del panel.");
  section("1. Entiende los números del panel");
  table(["Indicador", "Qué significa"], [
    ["Invitaciones", "Registros en la lista: cada uno puede ser una persona, pareja o familia."],
    ["Pases asignados", "Lugares reservados en total, incluyendo acompañantes."],
    ["Personas que asistirán", "Personas que ya confirmaron que asistirán."],
    ["Por responder", "Invitaciones que todavía no tienen una respuesta registrada."],
    ["Pendientes de envío", "Invitaciones que aún no has marcado como enviadas."],
  ], [154, 362]);
  section("2. Agrega una invitación manualmente");
  step(1, "Pulsa “Agregar invitados”.", "Se abrirá el formulario de registro.");
  step(2, "Escribe el nombre y selecciona el país.", "Captura el teléfono de 10 dígitos; la lada se añade según el país seleccionado.");
  step(3, "Completa el grupo familiar (opcional).", "Por ejemplo, “Familia López”. Es una etiqueta para organizarte.");
  step(4, "Indica los pases y guarda.", "Cuenta al invitado y sus acompañantes. Puedes asignar de 1 a 99 pases; después pulsa “Agregar invitado”.");
  callout("Ejemplo", "Si invitas a Ana y a su pareja, crea una invitación con el nombre de Ana y asigna 2 pases.");
  finishPage();

  startPage();
  section("3. Importa invitados desde Excel o CSV");
  paragraph("Si ya tienes una lista, puedes subirla para ahorrar tiempo. Lo más fácil es empezar con la plantilla que descarga el propio panel.", { size: 9.4, after: 5 });
  step(1, "Descarga la plantilla de ejemplo.", "Abre “Agregar invitados” y pulsa “Descargar plantilla de ejemplo”.");
  step(2, "Llena una fila por invitación.", "No crees una fila por acompañante: escribe el total de personas en la columna Pases.");
  paragraph("Ejemplo de cómo organizar el archivo:", { size: 9.1, font: bold, after: 1 });
  table(["Nombre", "Teléfono", "Grupo familiar", "Pases"], [
    ["María López", "8112345678", "Familia López", "3"],
    ["Juan Pérez", "8187654321", "Amigos", "2"],
    ["Laura Ruiz", "5512345678", "Trabajo", "1"],
  ], [116, 119, 177, 104]);
  section("Qué debe llevar el archivo");
  bullet("Nombre: obligatorio. Puede ser una persona, pareja o familia.");
  bullet("Teléfono: obligatorio. Con 10 dígitos se toma como número de México y se agrega +52. Para otros países, incluye la lada.");
  bullet("Grupo familiar: opcional.");
  bullet("Pases: número entero de 1 a 99. Si lo dejas vacío, se asigna 1.");
  callout("Formato compatible", "Puedes subir .xlsx o .csv. Si subes un Excel, el panel lee la primera hoja. Conserva los encabezados de la plantilla.");
  section("3.1 Revisa antes de importar");
  step(3, "Pulsa “Subir archivo Excel o CSV”.", "Selecciona el archivo desde tu computadora.");
  step(4, "Revisa la vista previa.", "Verás cuántas filas están listas y cuáles necesitan corrección.");
  table(["Aviso", "Cómo solucionarlo"], [
    ["Falta el nombre", "Completa la columna Nombre."],
    ["Teléfono inválido", "Revisa los dígitos y la lada internacional."],
    ["Pases inválidos", "Usa un número entero del 1 al 99."],
    ["Teléfono repetido", "Comprueba si ya aparece en el archivo o en el panel."],
  ], [155, 361]);
  step(5, "Pulsa “Agregar X invitaciones”.", "Solo se importan las filas correctas. Si algunas fallan, vuelve a subir únicamente las que faltan para evitar duplicados.");
  finishPage();

  startPage();
  section("4. Envía la invitación por WhatsApp");
  step(1, "Comprueba que la invitación esté publicada.", "El panel necesita tener disponible el enlace para preparar el mensaje personalizado.");
  step(2, "Busca al invitado y pulsa el ícono verde de WhatsApp.", "Se abrirá WhatsApp con un mensaje que incluye su nombre, enlace personal y número de pases.");
  step(3, "Verifica el destinatario y pulsa Enviar en WhatsApp.", "Abrir WhatsApp no significa que el mensaje ya se haya enviado.");
  step(4, "Vuelve al panel y pulsa el círculo con la marca de verificación.", "El estado cambiará a “Enviada”. Hazlo solo después de enviar el mensaje.");
  callout("Importante: “Enviada” no confirma entrega ni lectura.", "Es una marca de seguimiento que actualizas tú. Si abriste WhatsApp pero no enviaste el mensaje, deja el estado como “Sin enviar”.");
  paragraph("¿Quieres compartir el enlace por otro medio?", { size: 9.4, font: bold, after: 1 });
  paragraph("Pulsa el ícono de copiar enlace (dos hojas). Luego podrás pegar ese enlace personal en otro mensaje. Asegúrate de usar el enlace del invitado correcto.", { size: 9.1, after: 6 });
  section("5. Entiende los estados de cada invitación");
  table(["Estado", "Qué quiere decir"], [
    ["Por responder", "Todavía no hay una respuesta de asistencia registrada."],
    ["Confirmó · 2", "Indicó que asistirá y registró 2 personas. La cantidad puede variar."],
    ["No asistirá", "Respondió que no podrá asistir."],
    ["Enviada", "Marcaste en el panel que ya enviaste el mensaje."],
    ["Sin enviar", "Todavía no marcaste el envío como realizado."],
  ], [154, 362]);
  callout("Son dos cosas distintas", "El estado de envío y la respuesta de asistencia son independientes. Una invitación puede estar enviada y seguir “Por responder”, o confirmar por otro medio aunque figure pendiente de envío.", "green");
  section("6. Qué hace cada ícono");
  table(["Ícono / acción", "Para qué sirve"], [
    ["WhatsApp", "Prepara el mensaje personalizado del invitado."],
    ["Copiar enlace", "Copia el enlace personal para compartirlo por otro medio."],
    ["Marca de verificación", "Cambia entre “Enviada” y “Sin enviar”."],
    ["Lápiz", "Permite editar nombre, teléfono, grupo o pases."],
    ["Papelera", "Elimina el registro después de pedirte confirmación."],
  ], [165, 351]);
  finishPage();

  startPage();
  section("7. Busca y organiza tu lista");
  bullet("Buscar: escribe el nombre, teléfono o grupo familiar.");
  bullet("Filtrar respuestas: muestra todas, las que están por responder, las que confirmaron o las que no asistirán.");
  bullet("Filtrar envíos: muestra todos, los pendientes o los que marcaste como enviados.");
  bullet("Combinar: puedes buscar y aplicar ambos filtros a la vez. Para ver todo de nuevo, borra la búsqueda y elige “Todos”.");
  bullet("Actualizar: pulsa las flechas circulares para volver a cargar la información.");
  bullet("Páginas: se muestran hasta 25 invitaciones por página; usa las flechas del final para avanzar o regresar.");
  section("8. Problemas comunes");
  table(["Qué ocurre", "Qué puedes probar"], [
    ["No aparece la lista", "Pulsa Actualizar. Si sigue sin cargar, revisa tu conexión e inténtalo otra vez."],
    ["WhatsApp no se abre", "Permite las ventanas emergentes del navegador y revisa que la invitación esté publicada."],
    ["No acepta el teléfono", "Verifica los 10 dígitos, la lada seleccionada y que el número no esté registrado ya."],
    ["El archivo muestra avisos", "Corrige las filas señaladas y vuelve a subir solo las que faltan."],
    ["El invitado no ha respondido", "“Por responder” indica que no hay respuesta registrada; no confirma si leyó el mensaje."],
  ], [145, 371]);
  section("9. Rutina recomendada");
  step(1, "Revisa nombres, teléfonos y pases.", "Agrega nuevos invitados o importa la lista.");
  step(2, "Envía los mensajes desde WhatsApp.", "Verifica siempre el destinatario antes de pulsar Enviar.");
  step(3, "Marca cada envío en el panel.", "Hazlo únicamente después de enviar el mensaje.");
  step(4, "Da seguimiento a las respuestas.", "Filtra por “Por responder” y revisa “Personas que asistirán”.");
  step(5, "Mantén los datos actualizados.", "Edita los registros cuando cambien el teléfono o los pases.");
  callout("Recuerda estas tres ideas", "Una invitación puede incluir varios pases. Preparar el mensaje no es enviarlo. “Enviada” y “Confirmó” son estados diferentes.");
  paragraph("Privacidad: el enlace del panel permite administrar la lista del evento. Guárdalo y compártelo solo con quienes ayudan a organizarlo.", { size: 8.2, font: italic, color: C.muted, lineHeight: 10.5, after: 0 });
  finishPage();

  const bytes = await pdf.save({ useObjectStreams: true });
  return new Response(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Manual-del-panel-del-organizador.pdf"',
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
