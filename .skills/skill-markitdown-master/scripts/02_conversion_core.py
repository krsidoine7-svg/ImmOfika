"""
Moteur pur de conversion basé sur MarkItDown.
Ce script lit un dossier source et convertit tous les fichiers supportés en Markdown brut.
"""
import os
from markitdown import MarkItDown

def convert_directory(source_dir, output_dir):
    md = MarkItDown()
    os.makedirs(output_dir, exist_ok=True)
    
    for filename in os.listdir(source_dir):
        filepath = os.path.join(source_dir, filename)
        if os.path.isfile(filepath):
            try:
                result = md.convert(filepath)
                out_path = os.path.join(output_dir, f"{os.path.splitext(filename)[0]}.md")
                with open(out_path, "w", encoding="utf-8") as f:
                    f.write(result.text_content)
                print(f"Conversion réussie : {filename}")
            except Exception as e:
                print(f"Erreur lors de la conversion de {filename}: {e}")

if __name__ == "__main__":
    convert_directory("dossier_source", "dossier_converti")
