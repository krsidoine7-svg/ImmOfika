FROM python:3.10-slim

WORKDIR /app

# Installation de MarkItDown et des dépendances de l'IA
COPY scripts/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copie de l'intégralité du code et des scripts
COPY scripts/ /app/scripts/

# Commande par défaut : lancer la conversion classique
CMD ["python", "scripts/02_conversion_core.py"]
