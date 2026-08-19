"""
Orchestrateur Principal du Skill MarkItDown
Ce script lance toute la chaîne de bout en bout :
1. Convertit les fichiers sources (dossier_source -> dossier_converti)
2. Structure les fichiers avec Gemini (dossier_converti -> dossier_final)
"""
import os
import sys

# Importation des modules (doivent être dans le même dossier)
import importlib.util

def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

if __name__ == "__main__":
    print("=== Démarrage du Workflow MarkItDown ===")
    
    # Étape 1 : Conversion
    print("\n[1/2] Lancement de la conversion Core...")
    core = load_module("conversion_core", os.path.join(os.path.dirname(__file__), "02_conversion_core.py"))
    core.convert_directory("dossier_source", "dossier_converti")
    
    # Étape 2 : Structuration Sémantique
    print("\n[2/2] Lancement de la structuration LLM (Gemini)...")
    structurer = load_module("llm_structurer", os.path.join(os.path.dirname(__file__), "03_llm_structurer.py"))
    
    dossier_converti = "dossier_converti"
    dossier_final = "dossier_final"
    os.makedirs(dossier_final, exist_ok=True)
    
    if os.path.exists(dossier_converti):
        for filename in os.listdir(dossier_converti):
            if filename.endswith(".md"):
                filepath = os.path.join(dossier_converti, filename)
                try:
                    structurer.process_markdown_file(filepath, dossier_final)
                except SystemExit:
                    print(f"Workflow interrompu : Clé API manquante ou erreur système lors du traitement de {filename}.")
                    sys.exit(1)
                except Exception as e:
                    print(f"Erreur lors du traitement de {filename}: {e}")
    else:
        print("Aucun dossier converti trouvé.")
        
    print("\n=== Workflow terminé ! Fichiers disponibles dans 'dossier_final/' ===")
