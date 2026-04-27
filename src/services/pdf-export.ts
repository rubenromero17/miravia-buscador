import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Brand } from "./brand-service";

/**
 * Exporta el listado de empresas a un PDF cuidadosamente formateado:
 * - Orientación horizontal (landscape) para más espacio.
 * - Cabecera con título, fecha y total.
 * - Tabla con anchos de columna fijos, texto multilinea y URLs clicables.
 * - Pie de página con numeración "Página X / Y".
 * - Filas alternas y cabecera con color del tema.
 */
export function exportBrandsToPdf(brands: Brand[]) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 10;

  // ====== CABECERA ======
  const drawHeader = () => {
    // Banda superior
    doc.setFillColor(68, 107, 219);
    doc.rect(0, 0, pageWidth, 18, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Empresas colaboradoras — Plataformas de descuentos", marginX, 11.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const dateText = new Date().toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const right = `${brands.length.toLocaleString("es-ES")} empresas · ${dateText}`;
    doc.text(right, pageWidth - marginX, 11.5, { align: "right" });

    doc.setTextColor(0, 0, 0);
  };

  // ====== DATOS ======
  const body = brands.map((b, i) => [
    String(i + 1),
    b.name || "—",
    b.source ?? b.category ?? "—",
    b.location || "—",
    b.email || "No disponible",
    b.phone || "No disponible",
    b.storeUrl || "—",
  ]);

  // Anchos calculados para que la tabla ocupe todo el ancho útil
  const usable = pageWidth - marginX * 2; // ~277 mm en A4 landscape
  const colWidths = {
    0: 8, // #
    1: 60, // Empresa
    2: 24, // Plataforma
    3: 36, // Ubicación
    4: 55, // Email
    5: 30, // Teléfono
    6: usable - (8 + 60 + 24 + 36 + 55 + 30), // URL (resto)
  };

  autoTable(doc, {
    head: [["#", "Empresa", "Plataforma", "Ubicación", "Email", "Teléfono", "Web"]],
    body,
    startY: 22,
    margin: { left: marginX, right: marginX, top: 22, bottom: 14 },
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: { top: 1.8, right: 2, bottom: 1.8, left: 2 },
      overflow: "linebreak",
      valign: "middle",
      lineColor: [225, 230, 240],
      lineWidth: 0.1,
      textColor: [30, 35, 50],
    },
    headStyles: {
      fillColor: [68, 107, 219],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
      cellPadding: { top: 2.5, right: 2, bottom: 2.5, left: 2 },
    },
    alternateRowStyles: { fillColor: [246, 248, 253] },
    columnStyles: {
      0: { cellWidth: colWidths[0], halign: "right", textColor: [120, 125, 140] },
      1: { cellWidth: colWidths[1], fontStyle: "bold" },
      2: { cellWidth: colWidths[2] },
      3: { cellWidth: colWidths[3] },
      4: { cellWidth: colWidths[4], textColor: [40, 80, 180] },
      5: { cellWidth: colWidths[5] },
      6: { cellWidth: colWidths[6], textColor: [40, 80, 180] },
    },
    didDrawPage: () => {
      drawHeader();

      // Pie de página
      const pageCount = doc.getNumberOfPages();
      const current = doc.getCurrentPageInfo().pageNumber;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(130, 135, 150);
      doc.text(
        "Partner Explorer — exportación generada automáticamente",
        marginX,
        pageHeight - 6
      );
      doc.text(
        `Página ${current} / ${pageCount}`,
        pageWidth - marginX,
        pageHeight - 6,
        { align: "right" }
      );
      doc.setTextColor(0, 0, 0);
    },
    // Hacer las URLs y emails clicables
    didDrawCell: (data) => {
      if (data.section !== "body") return;
      const raw = brands[data.row.index];
      if (!raw) return;

      const { x, y, width, height } = data.cell;

      if (data.column.index === 4 && raw.email) {
        doc.link(x, y, width, height, { url: `mailto:${raw.email}` });
      }
      if (data.column.index === 6 && raw.storeUrl) {
        doc.link(x, y, width, height, { url: raw.storeUrl });
      }
    },
  });

  // Actualiza la numeración total una vez conocido el nº de páginas
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    // Reescribir solo el bloque "Página X / Y" para asegurar el total correcto
    doc.setFillColor(255, 255, 255);
    doc.rect(pageWidth - marginX - 35, pageHeight - 10, 35, 6, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(130, 135, 150);
    doc.text(`Página ${i} / ${total}`, pageWidth - marginX, pageHeight - 6, {
      align: "right",
    });
  }

  doc.save(
    `empresas-colaboradoras-${new Date().toISOString().slice(0, 10)}.pdf`
  );
}
