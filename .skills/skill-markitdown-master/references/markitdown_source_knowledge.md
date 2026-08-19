# Extraction de Connaissances du Code Source MarkItDown

MarkItDown de Microsoft est conçu pour être un outil de conversion de documents robuste.

1. **Plugins OCR et LLM Vision** : Il permet l'utilisation d'un client LLM pour décrire les images trouvées dans des documents Word/PDF. Bien que le code d'origine de Microsoft donne des exemples avec OpenAI (gpt-4o), le skill `skill-markitdown-master` a été explicitement conçu (et configuré dans ses scripts) pour interagir avec **Gemini** afin de s'adapter parfaitement à l'écosystème de l'utilisateur.
2. **MCP (Model Context Protocol)** : MarkItDown inclut un serveur MCP (`markitdown.mcp`). Le script `01_ingestion_mcp.py` encapsule ce comportement pour permettre une intégration dynamique.
3. **Sécurité et Privilèges** : L'outil lit les fichiers avec les mêmes droits que le processus appelant. L'utilisation de l'image via le répertoire `docker/` est recommandée si le code s'exécute sur un serveur distant public.
