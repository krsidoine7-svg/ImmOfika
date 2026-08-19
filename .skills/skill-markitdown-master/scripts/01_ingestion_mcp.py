"""
Ce script documente comment utiliser le serveur MCP natif de MarkItDown.
Il permet à l'agent de se connecter facilement à la librairie et de rendre l'IA plus puissante.
"""
import subprocess
import sys

def start_mcp_server():
    print("Démarrage du serveur MCP MarkItDown (Stdio)...")
    # MarkItDown possède un point d'entrée pour son serveur MCP
    try:
        subprocess.run([sys.executable, "-m", "markitdown_mcp"])
    except Exception as e:
        print(f"Erreur lors du lancement du serveur MCP: {e}")

if __name__ == "__main__":
    start_mcp_server()
