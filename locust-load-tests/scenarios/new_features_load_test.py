import random
import string
import json
import urllib.parse
from locust import HttpUser, task, between, tag

# Configuration Supabase depuis .env.local
SUPABASE_URL = "https://onfpbuqsgfvrmykpddjm.supabase.co"
SUPABASE_KEY = "sb_publishable_mq-felDxRIUi2XBsTjdmLQ_9zSve25t"
PROJECT_REF = "onfpbuqsgfvrmykpddjm"

# Identifiants de l'administrateur
ADMIN_EMAIL = "admin.general@favorcompany.ci"
ADMIN_PASSWORD = "Admin!"

# Identifiants de l'agent commercial de test
AGENT_EMAIL = "manager.cocody@favorcompany.ci"
AGENT_PASSWORD = "FavorManager2026!#1"

class VisitorUser(HttpUser):
    """
    Simule un utilisateur standard (client ou prospect) qui navigue sur le site
    et dont le tracker d'analytics local envoie régulièrement des pings
    de visites et de tunnels d'onboarding à l'API locale /api/analytics.
    """
    weight = 98  # 98% des utilisateurs simulés seront des visiteurs
    wait_time = between(2, 5)

    def on_start(self):
        # Générer des IDs de visiteur et session uniques
        self.visitor_id = "vis_" + "".join(random.choices(string.ascii_lowercase + string.digits, k=12))
        self.session_id = "ses_" + "".join(random.choices(string.ascii_lowercase + string.digits, k=12))
        
        # Sélection aléatoire de caractéristiques pour simuler différents profils
        self.device = random.choice(["mobile", "tablette", "ordinateur"])
        self.region = random.choice([
            "Lagunes (Abidjan)", "Gbêkê (Bouaké)", "Bas-Sassandra (San-Pédro)",
            "Haut-Sassandra (Daloa)", "Poro (Korhogo)", "Lacs (Yamoussoukro)"
        ])
        self.browser = random.choice(["Chrome", "Safari", "Firefox", "Edge"])
        self.current_path = "/"
        self.duration_tracker = 0

    def send_analytics_event(self, event_type, path, duration=0, step_name=None):
        """Helper pour envoyer des requêtes de tracking à l'API locale"""
        payload = {
            "visitorId": self.visitor_id,
            "sessionId": self.session_id,
            "eventType": event_type,
            "path": path,
            "details": {
                "device": self.device,
                "region": self.region,
                "browser": self.browser
            },
            "duration": duration
        }
        if step_name:
            payload["details"]["stepName"] = step_name

        headers = {"Content-Type": "application/json"}
        # Requête vers l'API locale du site Next.js
        self.client.post("/api/analytics", json=payload, headers=headers, name="/api/analytics")

    @task(3)
    def visit_home(self):
        """Simule la visite de la page d'accueil"""
        self.client.get("/", name="Home Page")
        self.send_analytics_event("page_view", "/")
        self.current_path = "/"

    @task(2)
    def visit_catalog(self):
        """Simule la visite du catalogue de biens"""
        self.client.get("/biens", name="Catalog Page")
        self.send_analytics_event("page_view", "/biens")
        self.current_path = "/biens"

    @task(2)
    def visit_bien_details_and_onboard(self):
        """Simule la visite d'une fiche de bien (déclenche une étape d'onboarding)"""
        slugs = [
            "villa-duplex-riviera-4ch",
            "appartement-2ch-marcory",
            "terrain-cocody-1000m2-01",
            "terrain-bingerville-500m2",
            "local-commercial-treichville",
            "bureau-open-space-plateau"
        ]
        chosen_slug = random.choice(slugs)
        path = f"/biens/{chosen_slug}"
        
        self.client.get(path, name="/biens/[slug]")
        # Tracking d'étape onboarding fiche_bien
        self.send_analytics_event("onboarding_step", path, step_name="fiche_bien")
        self.current_path = path

    @task(1)
    def simulate_page_exit_duration(self):
        """Simule l'événement de sortie de page (envoie la durée passée)"""
        if self.duration_tracker > 0:
            self.send_analytics_event(
                event_type="page_duration",
                path=self.current_path,
                duration=random.randint(5, 45)
            )
        self.duration_tracker += 1


class AdminUser(HttpUser):
    """
    Simule un administrateur connecté (Super Admin) accédant aux pages lourdes
    de gestion et d'analytics (gérant les graphiques et les permissions RBAC).
    """
    weight = 2  # 2% des utilisateurs simulés seront des administrateurs
    wait_time = between(5, 10)

    def on_start(self):
        # Authentification Supabase
        auth_url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
        headers = {
            "apikey": SUPABASE_KEY,
            "Content-Type": "application/json"
        }
        credentials = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        
        # Appel direct à l'API Supabase
        with self.client.post(auth_url, json=credentials, headers=headers, name="Supabase Auth Sign-In", catch_response=True) as response:
            if response.status_code == 200:
                data = response.json()
                access_token = data.get("access_token")
                refresh_token = data.get("refresh_token")
                
                # Modélisation du cookie de session d'authentification attendu par @supabase/ssr
                cookie_value = json.dumps([access_token, refresh_token])
                encoded_cookie = urllib.parse.quote(cookie_value)
                
                cookie_name = f"sb-{PROJECT_REF}-auth-token"
                self.client.cookies.set(cookie_name, encoded_cookie, domain="localhost")
                
                print(f"[+] Admin {ADMIN_EMAIL} authentifié avec succès et cookie positionné.")
            else:
                print(f"[-] Échec authentification admin : {response.status_code} {response.text}")

    @task(3)
    def view_admin_analytics_dashboard(self):
        """Accès à la page d'analytiques et RBAC d'administration"""
        self.client.get("/admin/analytics", name="/admin/analytics")

    @task(1)
    def view_system_settings(self):
        """Accès à la page de configuration des paramètres système"""
        self.client.get("/admin/parametres", name="/admin/parametres")


class CommercialUser(HttpUser):
    """
    Simule un agent commercial (manager) accédant aux pages du CRM et du catalogue,
    consulte la liste des prospects, les fiches visites et les réservations.
    """
    weight = 5  # 5% des utilisateurs simulés seront des agents commerciaux
    wait_time = between(4, 8)

    def on_start(self):
        # Authentification Supabase
        auth_url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
        headers = {
            "apikey": SUPABASE_KEY,
            "Content-Type": "application/json"
        }
        credentials = {
            "email": AGENT_EMAIL,
            "password": AGENT_PASSWORD
        }
        
        # Appel direct à l'API Supabase
        with self.client.post(auth_url, json=credentials, headers=headers, name="Supabase Auth Sign-In (Agent)", catch_response=True) as response:
            if response.status_code == 200:
                data = response.json()
                access_token = data.get("access_token")
                refresh_token = data.get("refresh_token")
                
                # Modélisation du cookie de session d'authentification attendu par @supabase/ssr
                cookie_value = json.dumps([access_token, refresh_token])
                encoded_cookie = urllib.parse.quote(cookie_value)
                
                cookie_name = f"sb-{PROJECT_REF}-auth-token"
                self.client.cookies.set(cookie_name, encoded_cookie, domain="localhost")
                
                print(f"[+] Agent {AGENT_EMAIL} authentifié avec succès.")
            else:
                print(f"[-] Échec authentification agent : {response.status_code} {response.text}")

    @task(3)
    def view_crm_leads(self):
        """Accès à la page de gestion des prospects (CRM)"""
        self.client.get("/admin/leads", name="/admin/leads")

    @task(2)
    def view_reservations(self):
        """Accès à la page de suivi des réservations"""
        self.client.get("/admin/reservations", name="/admin/reservations")

    @task(1)
    def view_visites(self):
        """Accès à la page de gestion des visites"""
        self.client.get("/admin/visites", name="/admin/visites")
