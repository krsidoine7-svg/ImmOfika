#!/usr/bin/env python3
"""
Convertisseur de Fiches de Procédures Markdown (.md) en Documents Word (.docx)
Charte Graphique Officielle : Favor Company International (Promoteur Immobilier Agréé)
Couleurs : Bleu Nuit (#1A2A4A), Doré Prestige (#C9A84C / #B8860B)
"""

import sys
import os
import re
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

# Couleurs Officielles Favor Company
COLOR_NAVY = RGBColor(0x1A, 0x2A, 0x4A)      # #1A2A4A
COLOR_GOLD = RGBColor(0xC9, 0xA8, 0x4C)      # #C9A84C
COLOR_DARK_GOLD = RGBColor(0xB8, 0x86, 0x0B) # #B8860B
COLOR_TEXT = RGBColor(0x1E, 0x29, 0x3B)      # #1E293B
COLOR_GRAY = RGBColor(0x64, 0x74, 0x8B)      # #64748B

HEX_NAVY = "1A2A4A"
HEX_GOLD = "C9A84C"
HEX_F8F6F1 = "F8F6F1"
HEX_LIGHT_GRAY = "F1F5F9"

def set_cell_background(cell, hex_color):
    """Définit la couleur de fond d'une cellule de tableau."""
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Ajuste les marges internes d'une cellule."""
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def add_header_footer(doc):
    """Ajoute l'en-tête et le pied de page officiels Favor Company."""
    section = doc.sections[0]
    section.top_margin = Inches(0.8)
    section.bottom_margin = Inches(0.8)
    section.left_margin = Inches(0.8)
    section.right_margin = Inches(0.8)

    # En-tête
    header = section.header
    hp = header.paragraphs[0]
    hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    hrun = hp.add_run("FAVOR COMPANY INTERNATIONAL — PROCÉDURE SPÉCIFIQUE")
    hrun.font.name = "Arial"
    hrun.font.size = Pt(8.5)
    hrun.font.bold = True
    hrun.font.color.rgb = COLOR_GOLD

    # Pied de page
    footer = section.footer
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    frun = fp.add_run("Promoteur Immobilier Agréé — Document Officiel d'Architecture & Flux")
    frun.font.name = "Arial"
    frun.font.size = Pt(8)
    frun.font.italic = True
    frun.font.color.rgb = COLOR_GRAY

def convert_md_to_docx(md_path, docx_path):
    if not os.path.exists(md_path):
        print(f"Erreur : Le fichier Markdown {md_path} n'existe pas.")
        sys.exit(1)

    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    doc = Document()
    add_header_footer(doc)

    # Styles généraux
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Arial'
    normal_style.font.size = Pt(10.5)
    normal_style.font.color.rgb = COLOR_TEXT

    in_table = False
    table_data = []

    i = 0
    while i < len(lines):
        line = lines[i].rstrip('\r\n')

        # Gestion des tableaux Markdown
        if '|' in line and (line.strip().startswith('|') or line.strip().endswith('|')):
            in_table = True
            cells = [c.strip() for c in line.strip('|').split('|')]
            # Ignorer la ligne de séparation |---|---|
            if not all(re.match(r'^:?-+:?$', c) for c in cells):
                table_data.append(cells)
            i += 1
            continue

        if in_table and ('|' not in line or not line.strip()):
            # Générer le tableau Word
            if table_data:
                rows_count = len(table_data)
                cols_count = max(len(r) for r in table_data) if table_data else 1
                table = doc.add_table(rows=rows_count, cols=cols_count)
                table.alignment = WD_TABLE_ALIGNMENT.CENTER

                for r_idx, row in enumerate(table_data):
                    for c_idx, val in enumerate(row):
                        if c_idx < cols_count:
                            cell = table.cell(r_idx, c_idx)
                            cell.text = val
                            set_cell_margins(cell)
                            
                            # En-tête du tableau
                            if r_idx == 0:
                                set_cell_background(cell, HEX_NAVY)
                                for p in cell.paragraphs:
                                    for r in p.runs:
                                        r.font.bold = True
                                        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                                        r.font.size = Pt(9.5)
                            else:
                                if r_idx % 2 == 1:
                                    set_cell_background(cell, "F8FAFC")
                                else:
                                    set_cell_background(cell, "FFFFFF")
                                for p in cell.paragraphs:
                                    for r in p.runs:
                                        r.font.size = Pt(9)
                doc.add_paragraph() # Spacing
            in_table = False
            table_data = []

        if not line.strip():
            i += 1
            continue

        # Titre H1 (# )
        if line.startswith('# '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(18)
            p.paragraph_format.space_after = Pt(8)
            run = p.add_run(line[2:].strip())
            run.font.name = 'Arial'
            run.font.size = Pt(20)
            run.font.bold = True
            run.font.color.rgb = COLOR_NAVY

        # Titre H2 (## )
        elif line.startswith('## '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(6)
            run = p.add_run(line[3:].strip())
            run.font.name = 'Arial'
            run.font.size = Pt(14)
            run.font.bold = True
            run.font.color.rgb = COLOR_GOLD

        # Titre H3 (### )
        elif line.startswith('### '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(4)
            title_text = line[4:].strip().replace('🔹 ', '').replace('🟢 ', '').replace('🔴 ', '')
            run = p.add_run(title_text)
            run.font.name = 'Arial'
            run.font.size = Pt(12)
            run.font.bold = True
            run.font.color.rgb = COLOR_NAVY

        # Titre H4 (#### )
        elif line.startswith('#### '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(3)
            title_text = line[5:].strip().replace('🔹 ', '').replace('🟢 ', '').replace('🔴 ', '')
            run = p.add_run(title_text)
            run.font.name = 'Arial'
            run.font.size = Pt(11)
            run.font.bold = True
            run.font.italic = True
            run.font.color.rgb = COLOR_DARK_GOLD

        # Callouts / Alertes (> [!NOTE], etc.)
        elif line.startswith('> '):
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.4)
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(6)
            callout_text = line[2:].strip()
            run = p.add_run(callout_text)
            run.font.italic = True
            run.font.size = Pt(9.5)
            run.font.color.rgb = COLOR_DARK_GOLD

        # Puces (* ou -)
        elif line.strip().startswith('* ') or line.strip().startswith('- '):
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_after = Pt(3)
            bullet_text = re.sub(r'^[\*\-]\s+', '', line.strip())
            
            # Gestion basique du gras **texte**
            parts = re.split(r'(\*\*.*?\*\*)', bullet_text)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    r = p.add_run(part[2:-2])
                    r.font.bold = True
                else:
                    p.add_run(part)

        # Blocs de code / Mermaid (```)
        elif line.startswith('```'):
            code_block = []
            i += 1
            while i < len(lines) and not lines[i].startswith('```'):
                code_block.append(lines[i])
                i += 1
            
            # Ajouter le bloc de code avec fond gris
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.2)
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(6)
            code_text = ''.join(code_block)
            run = p.add_run(code_text)
            run.font.name = 'Consolas'
            run.font.size = Pt(8.5)
            run.font.color.rgb = COLOR_NAVY

        # Paragraphe normal
        else:
            p = doc.add_paragraph()
            p.paragraph_format.space_after = Pt(4)
            parts = re.split(r'(\*\*.*?\*\*)', line)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    r = p.add_run(part[2:-2])
                    r.font.bold = True
                else:
                    p.add_run(part)

        i += 1

    # Traiter le dernier tableau si présent
    if in_table and table_data:
        table = doc.add_table(rows=len(table_data), cols=max(len(r) for r in table_data))
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        for r_idx, row in enumerate(table_data):
            for c_idx, val in enumerate(row):
                cell = table.cell(r_idx, c_idx)
                cell.text = val
                set_cell_margins(cell)
                if r_idx == 0:
                    set_cell_background(cell, HEX_NAVY)
                    for p in cell.paragraphs:
                        for r in p.runs:
                            r.font.bold = True
                            r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    doc.save(docx_path)
    print(f" Document Word généré avec succès : {docx_path}")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python md_to_docx.py <input_md_file> <output_docx_file>")
        sys.exit(1)
    
    convert_md_to_docx(sys.argv[1], sys.argv[2])
