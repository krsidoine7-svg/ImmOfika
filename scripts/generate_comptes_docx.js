/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  AlignmentType,
  HeadingLevel
} = require('docx');

// Emplacements des fichiers
const mdPath = path.join(__dirname, '../COMPTES_ACCES_FAVORCI.md');
const docxPath = path.join(__dirname, '../COMPTES_ACCES_FAVORCI.docx');

if (!fs.existsSync(mdPath)) {
  console.error("Le fichier source n'existe pas :", mdPath);
  process.exit(1);
}

const mdContent = fs.readFileSync(mdPath, 'utf8');
const lines = mdContent.split('\n');

const docChildren = [];

// En-tête prestigieux (Title block en Navy/Or)
docChildren.push(
  new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [9026],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.SINGLE, size: 24, color: "C9A84C" }, // Bordure inférieure Or
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE }
            },
            width: { size: 9026, type: WidthType.DXA },
            shading: { fill: "1A2A4A", type: ShadingType.CLEAR }, // Fond Bleu Marine
            margins: { top: 240, bottom: 240, left: 240, right: 240 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "🔐 RÉPERTOIRE DES COMPTES OFFICIELS",
                    bold: true,
                    font: "Arial",
                    size: 32, // 16pt
                    color: "FFFFFF"
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Favor Company International — Promoteur Immobilier Agréé",
                    italic: true,
                    font: "Arial",
                    size: 20, // 10pt
                    color: "C9A84C"
                  })
                ],
                spacing: { before: 100 }
              })
            ]
          })
        ]
      })
    ]
  })
);
docChildren.push(new Paragraph({ children: [new TextRun("")] })); // Spacer

// Styles de tableau moderne
const borderLight = { style: BorderStyle.SINGLE, size: 2, color: "E2E8F0" };
const tableBorders = {
  top: borderLight,
  bottom: borderLight,
  left: { style: BorderStyle.NONE },
  right: { style: BorderStyle.NONE }
};

// Largeurs des colonnes de table (Total = 9026 DXA pour correspondre à la largeur utile A4)
const colWidths = [2400, 2600, 1800, 1400, 826];

function makeHeaderCell(text, width) {
  return new TableCell({
    borders: {
      top: { style: BorderStyle.SINGLE, size: 8, color: "1A2A4A" },
      bottom: { style: BorderStyle.SINGLE, size: 12, color: "C9A84C" }, // Bordure basse or sous l'en-tête
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE }
    },
    width: { size: width, type: WidthType.DXA },
    shading: { fill: "1A2A4A", type: ShadingType.CLEAR },
    margins: { top: 140, bottom: 140, left: 160, right: 160 },
    children: [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({
            text: text.trim().replace(/\*\*/g, ""),
            color: "FFFFFF",
            bold: true,
            font: "Arial",
            size: 20
          })
        ]
      })
    ]
  });
}

function makeCell(text, width, isEvenRow) {
  const cleanText = text.trim().replace(/`/g, "").replace(/\*\*/g, "");
  const linesOfCell = cleanText.split(/<br\s*\/?>/i);
  
  // Alternance de couleur de fond (Zèbrage discret)
  const fill = isEvenRow ? "F8F9FA" : "FFFFFF";
  
  return new TableCell({
    borders: tableBorders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: fill, type: ShadingType.CLEAR },
    margins: { top: 120, bottom: 120, left: 160, right: 160 },
    children: linesOfCell.map((line, idx) => {
      const trimmedLine = line.trim();
      const isItalic = trimmedLine.startsWith("*") && trimmedLine.endsWith("*");
      const cleanLine = trimmedLine.replace(/^\*/, "").replace(/\*$/, "");
      
      // Style monospace pour les e-mails et les mots de passe
      const isCode = text.includes("`") || cleanLine.includes("@") || cleanLine.includes("!");
      
      return new Paragraph({
        children: [
          new TextRun({
            text: cleanLine.trim(),
            font: isCode ? "Consolas" : "Arial",
            size: isCode ? 18 : 20,
            bold: idx === 0 && text.includes("**"),
            italic: isItalic,
            color: isCode ? "1A2A4A" : "333333"
          })
        ],
        spacing: { before: 20, after: 20 }
      });
    })
  });
}

let currentTableRows = [];
let inTable = false;

// Ignorer les deux premières lignes car elles sont déjà dans l'en-tête prestigieux
for (let i = 2; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (line.startsWith('|')) {
    if (line.includes(':---') || line.includes('---:')) {
      continue;
    }
    
    const rawCells = line.split('|').slice(1, -1);
    if (rawCells.length > 0) {
      if (!inTable) {
        inTable = true;
        currentTableRows = [];
        currentTableRows.push(
          new TableRow({
            children: rawCells.map((c, colIdx) => makeHeaderCell(c, colWidths[colIdx] || 1500))
          })
        );
      } else {
        const isEven = (currentTableRows.length % 2 === 0);
        currentTableRows.push(
          new TableRow({
            children: rawCells.map((c, colIdx) => makeCell(c, colWidths[colIdx] || 1500, isEven))
          })
        );
      }
    }
  } else {
    if (inTable) {
      docChildren.push(
        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: colWidths,
          rows: currentTableRows
        })
      );
      docChildren.push(new Paragraph({ children: [new TextRun("")] })); // Spacer
      inTable = false;
    }
    
    if (line.startsWith('# ') || line.startsWith('## ')) {
      const cleanHeading = line.replace(/^#+\s*/, "").replace(/👑|👔|👤|🔐|💡/g, "").trim();
      const isSubHeading = line.startsWith('## 1.') || line.startsWith('## 2.') || line.startsWith('## 3.') || line.startsWith('## ');
      
      docChildren.push(
        new Paragraph({
          heading: isSubHeading ? HeadingLevel.HEADING_1 : HeadingLevel.TITLE,
          children: [
            new TextRun({
              text: cleanHeading,
              bold: true,
              font: "Arial",
              size: isSubHeading ? 26 : 32,
              color: "1A2A4A"
            })
          ],
          spacing: { before: 240, after: 120 }
        })
      );
    } else if (line.startsWith('**') || line.startsWith('*')) {
      const textVal = line.replace(/\*\*/g, "").replace(/\*/g, "").trim();
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: textVal,
              font: "Arial",
              size: 22,
              bold: line.startsWith('**')
            })
          ],
          spacing: { after: 120 }
        })
      );
    } else if (line.startsWith('>') || line.startsWith('> [!IMPORTANT]')) {
      const rawText = line.replace(/^>\s*(\[!IMPORTANT\])?\s*/i, "").trim();
      let calloutLines = [rawText];
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith('>')) {
        i++;
        calloutLines.push(lines[i].trim().replace(/^>\s*/, ""));
      }
      
      docChildren.push(
        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [9026],
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.SINGLE, size: 24, color: "C9A84C" } // Bordure gauche dorée prestigieuse
                  },
                  width: { size: 9026, type: WidthType.DXA },
                  shading: { fill: "F8F6F1", type: ShadingType.CLEAR },
                  margins: { top: 160, bottom: 160, left: 200, right: 160 },
                  children: calloutLines.map(cl => new Paragraph({
                    children: [
                      new TextRun({
                        text: cl.replace(/\*\*/g, "").trim(),
                        font: "Arial",
                        size: 20,
                        italic: true
                      })
                    ],
                    spacing: { after: 60 }
                  }))
                })
              ]
            })
          ]
        })
      );
      docChildren.push(new Paragraph({ children: [new TextRun("")] }));
    } else if (line.match(/^\d+\./)) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.replace(/\*\*/g, "").trim(),
              font: "Arial",
              size: 22
            })
          ],
          spacing: { after: 120 },
          indent: { left: 360 }
        })
      );
    } else if (line !== '' && line !== '---') {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              font: "Arial",
              size: 22
            })
          ],
          spacing: { after: 120 }
        })
      );
    }
  }
}

if (inTable) {
  docChildren.push(
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: colWidths,
      rows: currentTableRows
    })
  );
}

// Création du document global
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22, color: "333333" } } }
  },
  sections: [{
    properties: {
      page: {
        size: {
          width: 11906, // A4
          height: 16838 // A4
        },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: docChildren
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(docxPath, buffer);
  console.log('Document Word généré avec succès à :', docxPath);
}).catch(err => {
  console.error('Erreur lors de la génération du document :', err);
  process.exit(1);
});
