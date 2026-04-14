import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, WidthType, Footer, BorderStyle, ExternalHyperlink, ImageRun } from "docx";

export async function generateMatrixDocxBlob(projectName: string, tasks: any[], companyLogoBase64?: string | null) {
  const tableRows: TableRow[] = [];
  
  // Encabezado
  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({ margins: { top: 150, bottom: 150, left: 150, right: 150 }, children: [new Paragraph({ children: [new TextRun({ text: "PASO / MANIOBRA", bold: true, color: "ffffff", size: 20, font: "Arial" })] })], shading: { fill: "1e293b" } }),
        new TableCell({ margins: { top: 150, bottom: 150, left: 150, right: 150 }, children: [new Paragraph({ children: [new TextRun({ text: "PELIGRO", bold: true, color: "ffffff", size: 20, font: "Arial" })] })], shading: { fill: "1e293b" } }),
        new TableCell({ margins: { top: 150, bottom: 150, left: 150, right: 150 }, children: [new Paragraph({ children: [new TextRun({ text: "RIESGO / INCIDENTE", bold: true, color: "ffffff", size: 20, font: "Arial" })] })], shading: { fill: "1e293b" } }),
        new TableCell({ margins: { top: 150, bottom: 150, left: 150, right: 150 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "EVAL.", bold: true, color: "ffffff", size: 20, font: "Arial" })] })], shading: { fill: "1e293b" } }),
        new TableCell({ margins: { top: 150, bottom: 150, left: 150, right: 150 }, children: [new Paragraph({ children: [new TextRun({ text: "CONTROLES ESTABLECIDOS", bold: true, color: "ffffff", size: 20, font: "Arial" })] })], shading: { fill: "1e293b" } }),
      ],
    })
  );

  // Llenar datos
  tasks.forEach((t) => {
    // Protección contra descripciones muy largas o no definidas
    const rowTitle = t.taskOriginalName || t.result.task || 'Paso Operacional';
    
    t.result.risks.forEach((risk: any) => {
      let riskShade = "ffffff";
      let riskColor = "0f172a";
      
      const p = risk.probability;
      const s = risk.severity;
      let exactLevel = "MEDIO";
      if (p && s) {
        if (p===1 && s===1) exactLevel = 'Muy bajo';
        else if (p===1 && s===2) exactLevel = 'Muy bajo';
        else if (p===1 && s===3) exactLevel = 'Bajo';
        else if (p===1 && s===4) exactLevel = 'Medio';
        else if (p===1 && s===5) exactLevel = 'Medio';
        else if (p===2 && s===1) exactLevel = 'Muy bajo';
        else if (p===2 && s===2) exactLevel = 'Bajo';
        else if (p===2 && s===3) exactLevel = 'Medio';
        else if (p===2 && s===4) exactLevel = 'Medio';
        else if (p===2 && s===5) exactLevel = 'Alto';
        else if (p===3 && s===1) exactLevel = 'Bajo';
        else if (p===3 && s===2) exactLevel = 'Medio';
        else if (p===3 && s===3) exactLevel = 'Medio';
        else if (p===3 && s===4) exactLevel = 'Alto';
        else if (p===3 && s===5) exactLevel = 'Muy alto';
        else if (p===4 && s===1) exactLevel = 'Medio';
        else if (p===4 && s===2) exactLevel = 'Medio';
        else if (p===4 && s===3) exactLevel = 'Alto';
        else if (p===4 && s===4) exactLevel = 'Muy alto';
        else if (p===4 && s===5) exactLevel = 'Extremo';
        else if (p===5 && s===1) exactLevel = 'Medio';
        else if (p===5 && s===2) exactLevel = 'Alto';
        else if (p===5 && s===3) exactLevel = 'Muy alto';
        else if (p===5 && s===4) exactLevel = 'Extremo';
        else if (p===5 && s===5) exactLevel = 'Extremo';
      }

      const lvl = exactLevel.toUpperCase();
      if (lvl.includes("EXTREMO")) {
        riskShade = "fecdd3"; 
        riskColor = "9f1239"; 
      } else if (lvl.includes("MUY ALTO")) {
        riskShade = "fee2e2"; 
        riskColor = "dc2626"; 
      } else if (lvl.includes("ALTO")) {
        riskShade = "ffedd5"; 
        riskColor = "ea580c"; 
      } else if (lvl.includes("MEDIO")) {
        riskShade = "fef9c3"; 
        riskColor = "a16207"; 
      } else if (lvl.includes("BAJO")) {
        riskShade = "dcfce3"; 
        riskColor = "16a34a"; 
      }

      tableRows.push(
        new TableRow({
          children: [
            new TableCell({ margins: { top: 150, bottom: 150, left: 150, right: 150 }, children: [new Paragraph({ children: [new TextRun({ text: rowTitle, bold: true, color: "000000", size: 20, font: "Arial" })] })] }),
            new TableCell({ margins: { top: 150, bottom: 150, left: 150, right: 150 }, children: [new Paragraph({ children: [new TextRun({ text: risk.hazard, color: "000000", size: 20, font: "Arial" })] })] }),
            new TableCell({ margins: { top: 150, bottom: 150, left: 150, right: 150 }, children: [new Paragraph({ children: [new TextRun({ text: risk.incident, color: "000000", size: 20, font: "Arial" })] })] }),
            new TableCell({ 
                margins: { top: 150, bottom: 150, left: 150, right: 150 },
                shading: { fill: riskShade },
                children: [
                   new Paragraph({ 
                       alignment: AlignmentType.CENTER,
                       children: [new TextRun({ text: lvl || "N/A", bold: true, color: "000000", size: 18, font: "Arial" })] 
                   })
                ] 
            }),
            new TableCell({ 
                margins: { top: 150, bottom: 150, left: 150, right: 150 },
                children: risk.controls.map((c: string) => new Paragraph({ 
                    children: [new TextRun({ text: c, color: "000000", size: 20, font: "Arial" })],
                    bullet: { level: 0 },
                    spacing: { after: 100 }
                })) 
            }),
          ]
        })
      );
    });
  });

  const doc = new Document({
    styles: {
      characterStyles: [
        {
            id: "Hyperlink",
            name: "Hyperlink",
            basedOn: "Default Paragraph Font",
            run: {
                color: "000000",
                underline: { type: "single" },
            },
        },
      ],
    },
    sections: [
      {
        properties: {},
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, after: 60 },
                border: {
                  top: { color: "cccccc", space: 1, style: BorderStyle.SINGLE, size: 6 }
                },
                children: [
                  new TextRun({ text: "Generado a través de ", size: 16, color: "000000" }),
                  new TextRun({ text: "MiperAI", bold: true, size: 16, color: "000000" }),
                  new TextRun({ text: " - Una herramienta de ", size: 16, color: "000000" }),
                  new TextRun({ text: "AT-SIT Telecom", bold: true, size: 16, color: "000000" }),
                  new TextRun({ text: "  |  ", size: 16, color: "000000" }),
                  new ExternalHyperlink({
                    link: "mailto:atsittelecom@gmail.com",
                    children: [new TextRun({ text: "📧 atsittelecom@gmail.com", style: "Hyperlink", size: 16, color: "000000" })]
                  }),
                  new TextRun({ text: "  |  ", size: 16, color: "000000" }),
                  new ExternalHyperlink({
                    link: "https://wa.me/56993351620",
                    children: [new TextRun({ text: "📱 WhatsApp: +56 9 9335 1620", style: "Hyperlink", size: 16, color: "000000" })]
                  })
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new ExternalHyperlink({
                    children: [new TextRun({ text: "🌐 Portafolio AT-SIT", style: "Hyperlink", color: "000000", size: 16 })],
                    link: "https://at-sit-portafolio.vercel.app/"
                  }),
                  new TextRun({ text: "    •    ", size: 16, color: "000000" }),
                  new ExternalHyperlink({
                    children: [new TextRun({ text: "📷 Instagram (@pdiazg37)", style: "Hyperlink", color: "000000", size: 16 })],
                    link: "https://www.instagram.com/pdiazg37/"
                  }),
                  new TextRun({ text: "    •    ", size: 16, color: "000000" }),
                  new ExternalHyperlink({
                    children: [new TextRun({ text: "🎵 TikTok (@pato.diaz84)", style: "Hyperlink", color: "000000", size: 16 })],
                    link: "https://www.tiktok.com/@pato.diaz84"
                  })
                ]
              })
            ]
          })
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 150 },
            children: [
              ...(companyLogoBase64 ? [
                  new ImageRun({
                     data: Uint8Array.from(atob(companyLogoBase64.replace(/^data:image\/\w+;base64,/, "")), c => c.charCodeAt(0)),
                     transformation: { width: 100, height: 100 },
                     type: companyLogoBase64.includes('image/jpeg') || companyLogoBase64.includes('image/jpg') ? 'jpg' : 'png'
                  }),
              ] : []),
              new TextRun({ text: "Matriz de Identificación de Peligros y Evaluación de Riesgos (MiperAI)", bold: true, size: 32, color: "000000", font: "Arial", break: companyLogoBase64 ? 1 : 0 })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            border: {
              bottom: { color: "e2e8f0", space: 15, style: BorderStyle.SINGLE, size: 12 }
            },
            children: [
              new TextRun({ text: "📋 Proyecto Operacional: ", size: 24, color: "000000", font: "Arial" }),
              new TextRun({ text: projectName, size: 24, bold: true, color: "000000", font: "Arial" }),
            ]
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            margins: { top: 150, bottom: 150, right: 150, left: 150 },
            borders: {
               top: { color: "cbd5e1", size: 6, style: BorderStyle.SINGLE },
               bottom: { color: "cbd5e1", size: 6, style: BorderStyle.SINGLE },
               left: { color: "cbd5e1", size: 6, style: BorderStyle.SINGLE },
               right: { color: "cbd5e1", size: 6, style: BorderStyle.SINGLE },
               insideHorizontal: { color: "cbd5e1", size: 6, style: BorderStyle.SINGLE },
               insideVertical: { color: "cbd5e1", size: 6, style: BorderStyle.SINGLE },
            },
            rows: tableRows,
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}
