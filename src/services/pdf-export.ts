import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Brand } from "./brand-service";

export function exportBrandsToPdf(brands: Brand[]) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Empresas colaboradoras — Miravia & Groupon", 14, 22);

  // Subtitle
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Generado el ${new Date().toLocaleDateString("es-ES")} · ${brands.length} empresas`,
    14,
    30
  );
  doc.setTextColor(0, 0, 0);

  // Table
  autoTable(doc, {
    startY: 38,
    head: [["Empresa", "Plataforma", "Email", "Teléfono", "Ubicación", "URL"]],
    body: brands.map((b) => [
      b.name,
      b.source ?? b.category,
      b.email ?? "No disponible",
      b.phone ?? "No disponible",
      b.location,
      b.storeUrl ?? "—",
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: {
      fillColor: [68, 107, 219],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [245, 247, 252] },
    margin: { left: 14, right: 14 },
  });

  doc.save("empresas-colaboradoras.pdf");
}
