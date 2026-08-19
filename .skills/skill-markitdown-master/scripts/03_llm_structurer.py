"""
Structuration sémantique avec Gemini.
Ce script prend le Markdown brut, extrait les thèmes, ajoute le YAML Frontmatter,
et insère les tags structurants pour la génération de quiz.
"""
import os
import sys
# pyrefly: ignore [missing-import]
import google.generativeai as genai

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("ERREUR: La variable d'environnement GEMINI_API_KEY n'est pas définie.")
    print("Veuillez définir votre clé API avant de lancer la structuration.")
    sys.exit(1)

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-pro')

PROMPT_TEMPLATE = '''
Voici un texte Markdown issu d'un cours.
Agis comme un expert de la structuration de données d'apprentissage. Fais exactement ce qui suit :
1. Ajoute un bloc YAML Frontmatter au tout début avec : 'Date', 'Theme', 'Mots-cles'.
2. Entoure toutes les définitions clés et concepts cruciaux de la balise [IMPORTANT: Concept Clé].
3. Entoure tous les exemples de la balise [EXEMPLE].
4. Entoure toutes les situations pratiques ou cas d'usage de la balise [SCÉNARIO].
5. Conserve la propreté du Markdown. Ne supprime aucune information vitale.

Texte original :
{text}
'''

def process_markdown_file(filepath, output_dir):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    response = model.generate_content(PROMPT_TEMPLATE.format(text=content))
    
    out_path = os.path.join(output_dir, os.path.basename(filepath))
    os.makedirs(output_dir, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(response.text)
    print(f"Structuration terminée : {os.path.basename(filepath)}")

if __name__ == "__main__":
    # Utilisation typique : process_markdown_file("dossier_converti/cours.md", "dossier_final")
    pass
