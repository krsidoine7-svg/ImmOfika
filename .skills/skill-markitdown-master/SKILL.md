---
name: skill-markitdown-master
description: Transforme l'agent en expert absolu de la structuration de données pour l'entraînement d'IA et la génération de quiz. Ce skill convertit n'importe quel fichier (Word, PDF, Excel) en Markdown pur via la librairie 'markitdown', injecte des métadonnées YAML, et ajoute des tags structurels (ex [IMPORTANT: Concept Clé], [SCÉNARIO]) via l'API Gemini (Vision/OCR inclus). Utilisez ce skill systématiquement lorsque l'utilisateur veut convertir des cours, de la documentation, ou préparer des données pour des quiz.
---

# Skill : Expert MarkItDown & Structuration de Données

Ce skill permet à l'agent de traiter des lots de documents complexes et de les restructurer de manière optimale pour des LLMs.

## Règles de Comportement (Guidelines)

1.  **Workflow d'Ingestion** : 
    - L'agent doit toujours séparer les fichiers entrants (dossier source) des fichiers générés (dossier de sortie).
    - L'agent utilisera les scripts présents dans le dossier `scripts/` pour opérer les conversions de manière hybride (MCP ou conversion directe).

2.  **Formatage Markdown (Optimisation LLM)** :
    - Nettoyer le bruit visuel (caractères invisibles, espaces multiples).
    - Utiliser les règles de propreté stipulées dans `references/markdown_guidelines.md`.

3.  **Balisage et Métadonnées (Génération de Quiz)** :
    - Le LLM doit être utilisé (via `scripts/03_llm_structurer.py`) pour générer un bloc YAML Frontmatter en haut de chaque fichier (`Date`, `Thème Principal`, `Mots-clés`).
    - L'agent doit identifier et entourer les définitions clés de la balise `[IMPORTANT: Concept Clé]`.
    - L'agent doit identifier les cas pratiques et les entourer de `[EXEMPLE]` ou `[SCÉNARIO]`.

4.  **Exécution (Scripts & Docker)** :
    - Exécuter les scripts Python locaux par défaut pour plus de rapidité.
    - Si une isolation est requise, utiliser l'image via le dossier `docker/`.
    - Si le serveur MarkItDown MCP est requis pour intégrer dynamiquement les capacités à l'agent, s'y référer via `references/markitdown_source_knowledge.md`.

5.  **Interconnexions avec les Compétences de l'Écosystème Favor Company** :
    - **`immo-ci`** (`.skills/immo-ci/SKILL.md`) : Transmettre les documents contractuels et légaux convertis pour enrichissement conforme au droit ivoirien et OHADA.
    - **`copywriting`** (`.skills/copywriting/SKILL.md`) : Transmettre les textes marketing bruts extraits de documents pour retravail et optimisation de conversion.
    - **`securite-favor` & `memoire-favor`** : Masquer automatiquement les données confidentielles (`{{...}}`) lors du balisage sémantique.
    - **Formats sources (`docx`, `pdf`, `xlsx`)** : S'appuyer sur la bibliothèque `.skills/skills-main` pour traiter les documents source.

## Architecture du Skill
Pour exécuter les tâches, référez-vous aux scripts et documents suivants :
- `scripts/01_ingestion_mcp.py` : Pour interagir avec le Model Context Protocol de MarkItDown.
- `scripts/02_conversion_core.py` : Pour la conversion massive de fichiers locaux (le moteur pur).
- `scripts/03_llm_structurer.py` : Pour faire appel à Gemini (pour l'OCR et la structuration sémantique du texte).
