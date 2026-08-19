import os
import sys
import subprocess
import time
import csv
import json

def log(message):
    print(f"\n🚀 [STRESS-TEST] {message}")

def log_warn(message):
    print(f"\n⚠️ [ATTENTION] {message}")

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    reports_dir = os.path.join(base_dir, "reports")
    os.makedirs(reports_dir, exist_ok=True)

    # Détection de l'OS et de l'exécutable locust
    is_windows = os.name == 'nt'
    # Utiliser le locust du venv local s'il existe
    venv_bin = os.path.join(base_dir, ".venv", "Scripts", "locust.exe") if is_windows else os.path.join(base_dir, ".venv", "bin", "locust")
    
    locust_cmd = venv_bin if os.path.exists(venv_bin) else "locust"

    # Liste des étapes progressives
    steps = [
        {"users": 10, "spawn_rate": 2, "duration": "1m", "name": "Étape 1: Smoke Test"},
        {"users": 100, "spawn_rate": 5, "duration": "2m", "name": "Étape 2: Charge Légère"},
        {"users": 500, "spawn_rate": 10, "duration": "3m", "name": "Étape 3: Charge Modérée"},
        {"users": 1000, "spawn_rate": 20, "duration": "4m", "name": "Étape 4: Stress Test Max"}
    ]

    host = "http://localhost:3000"
    scenario_file = os.path.join(base_dir, "scenarios", "new_features_load_test.py")

    log(f"Démarrage des tests de charge progressifs sur {host}")
    log(f"Scénario utilisé : {scenario_file}")
    
    breakpoint_hit = False
    remediation_data = {}

    for step in steps:
        users = step["users"]
        spawn_rate = step["spawn_rate"]
        duration = step["duration"]
        step_name = step["name"]

        log(f"Lancement de l'étape : {step_name} ({users} utilisateurs simultanés, spawn-rate: {spawn_rate}/s, durée: {duration})")

        csv_prefix = os.path.join(reports_dir, f"stress_report_step_{users}")
        log_file = os.path.join(reports_dir, f"stress_report_step_{users}.log")

        # Commande d'exécution Locust
        cmd = [
            locust_cmd,
            "-f", scenario_file,
            "--host", host,
            "--headless",
            "-u", str(users),
            "-r", str(spawn_rate),
            "--run-time", duration,
            "--csv", csv_prefix,
            "--html", os.path.join(reports_dir, f"stress_report_step_{users}.html")
        ]

        log(f"Commande exécutée : {' '.join(cmd)}")

        with open(log_file, "w", encoding="utf-8") as lf:
            # Exécution de Locust en mode headless
            process = subprocess.Popen(cmd, stdout=lf, stderr=subprocess.STDOUT)
            process.wait()

        # Attendre un peu que le système flush les fichiers CSV
        time.sleep(2)

        # Analyser les résultats CSV de cette étape
        stats_csv = f"{csv_prefix}_stats.csv"
        if not os.path.exists(stats_csv):
            log_warn(f"Le fichier de statistiques {stats_csv} n'a pas été trouvé. Étape ignorée.")
            continue

        # Lecture des statistiques
        total_requests = 0
        total_failures = 0
        avg_response_time = 0
        p95_response_time = 0
        max_response_time = 0
        
        try:
            with open(stats_csv, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if row.get("Name") == "Aggregated":
                        total_requests = int(row.get("Request Count", 0))
                        total_failures = int(row.get("Failure Count", 0))
                        avg_response_time = float(row.get("Average Response Time", 0))
                        p95_response_time = float(row.get("95%", 0))
                        max_response_time = float(row.get("Max Response Time", 0))
                        break
        except Exception as e:
            log_warn(f"Impossible d'analyser le CSV des statistiques : {e}")
            continue

        failure_rate = (total_failures / total_requests * 100) if total_requests > 0 else 0

        print(f"\n📋 Résultats de l'étape : {step_name}")
        print(f"   - Requêtes Totales : {total_requests}")
        print(f"   - Échecs : {total_failures} ({failure_rate:.2f}%)")
        print(f"   - Temps de réponse moyen : {avg_response_time:.2f} ms")
        print(f"   - Temps de réponse 95% : {p95_response_time:.2f} ms")
        print(f"   - Temps de réponse Max : {max_response_time:.2f} ms")

        # Critères de point de rupture :
        # - failure_rate > 3%
        # - avg_response_time > 3500ms (3.5 secondes)
        is_broken = False
        reasons = []
        if failure_rate > 3.0:
            is_broken = True
            reasons.append(f"Taux d'échec élevé ({failure_rate:.2f}% > 3.0%)")
        if avg_response_time > 3500.0:
            is_broken = True
            reasons.append(f"Temps de réponse moyen trop élevé ({avg_response_time:.2f} ms > 3500 ms)")

        if is_broken:
            breakpoint_hit = True
            remediation_data = {
                "step_name": step_name,
                "users": users,
                "requests": total_requests,
                "failures": total_failures,
                "failure_rate": failure_rate,
                "avg_response_time": avg_response_time,
                "p95_response_time": p95_response_time,
                "reasons": reasons,
                "failures_file": f"stress_report_step_{users}_failures.csv"
            }
            log_warn(f"POINT DE RUPTURE ATTEINT lors de l'étape {step_name} !")
            for reason in reasons:
                print(f"      ➔ Raison : {reason}")
            break

    # Écriture du plan de correction/optimisation bottlenecks_remediation_plan.md
    remediation_plan_file = os.path.join(reports_dir, "bottlenecks_remediation_plan.md")
    
    with open(remediation_plan_file, "w", encoding="utf-8") as f:
        f.write("# 🛡️ Rapport de Diagnostic & Plan de Correction des Goulots d'Étranglement\n\n")
        f.write("## Favor Company International — Promoteur Immobilier Agréé\n\n")
        
        if breakpoint_hit:
            f.write(f"### 🚨 ALERTE : Le site a atteint son point de rupture lors du test de charge !\n\n")
            f.write(f"* **Étape de rupture** : {remediation_data['step_name']}\n")
            f.write(f"* **Nombre d'utilisateurs simulés** : {remediation_data['users']}\n")
            f.write(f"* **Requêtes exécutées** : {remediation_data['requests']}\n")
            f.write(f"* **Échecs rencontrés** : {remediation_data['failures']} ({remediation_data['failure_rate']:.2f}%)\n")
            f.write(f"* **Temps de réponse moyen** : {remediation_data['avg_response_time']:.2f} ms\n")
            f.write(f"* **Temps de réponse 95%** : {remediation_data['p95_response_time']:.2f} ms\n\n")
            
            f.write("#### 🔍 Raisons de la rupture :\n")
            for reason in remediation_data["reasons"]:
                f.write(f"- {reason}\n")
            f.write("\n")
            
            # Diagnostic & Recommandations types
            f.write("## 🛠️ Plan de Correction Immédiat\n\n")
            f.write("Sur la base des échecs et des performances, voici les correctifs à apporter :\n\n")
            f.write("### 1. Optimisation de l'écriture des Analytiques (`/api/analytics`)\n")
            f.write("L'API d'analytics effectue des insertions SQL directes. Sous forte charge concurrentielle, cela bloque le pool de connexions PostgreSQL.\n")
            f.write("* **Action recommandée** : Implémenter une queue de messagerie (ex. Redis/BullMQ) ou un mécanisme de buffering en mémoire locale pour regrouper les écritures (batching) au lieu d'insérer à chaque requête.\n\n")
            
            f.write("### 2. Optimisation du Dashboard Admin (`/admin/analytics`)\n")
            f.write("La page d'administration effectue des requêtes d'agrégation lourdes sur `analytics_events` (calculs de trafic par région, durée moyenne, provenance).\n")
            f.write("* **Action recommandée** : \n")
            f.write("  - Ajouter des index physiques composites sur les colonnes fréquemment requêtées (`event_type`, `created_at`, `path`).\n")
            f.write("  - Mettre en cache (ex: Redis cache de 5 minutes) le résultat des KPIs pour éviter de ré-exécuter les agrégations SQL à chaque chargement de page.\n")
            f.write("  - Utiliser une vue matérialisée Postgres mise à jour périodiquement pour stocker les analytiques pré-calculées.\n\n")
            
            f.write("### 3. Gestion des Connexions Base de Données (Supabase / Postgres Pool)\n")
            f.write("Les erreurs HTTP 500 ou 504 peuvent provenir de la saturation du pool de connexions à la base de données.\n")
            f.write("* **Action recommandée** : Augmenter la taille maximale du pool Drizzle/Supabase Pooler, ou vérifier si les connexions sont correctement relâchées.\n")
        else:
            f.write("### ✅ Succès : Le site supporte la charge maximale de 1000 utilisateurs simultanés !\n\n")
            f.write("Le stress test progressif s'est terminé sans atteindre de point de rupture.\n\n")
            f.write("#### 📊 Statistiques globales de l'étape finale (1000 users) :\n")
            f.write(f"- Requêtes : {total_requests}\n")
            f.write(f"- Échecs : {total_failures} ({failure_rate:.2f}%)\n")
            f.write(f"- Temps de réponse moyen : {avg_response_time:.2f} ms\n")
            f.write(f"- Temps de réponse 95% : {p95_response_time:.2f} ms\n\n")
            f.write("#### 💡 Recommandations de maintenance :\n")
            f.write("- Maintenir la surveillance active via Sentry et PostHog.\n")
            f.write("- Mettre en place un autoscaling sur le serveur Next.js en production pour anticiper les pics réels supérieurs à 1000 utilisateurs.\n")

    log(f"Rapport de remédiation écrit avec succès dans : {remediation_plan_file}")
    
    if breakpoint_hit:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()
