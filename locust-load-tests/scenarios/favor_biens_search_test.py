import random
from locust import HttpUser, task, between

class FavorBiensSearchScenario(HttpUser):
    """
    Scénario spécifique à Favor Company International (Promoteur Immobilier Agréé).
    Simule des utilisateurs réels visitant le site web et recherchant des biens immobiliers
    avec des critères de filtrage dynamiques sur l'API, puis consultant les fiches de biens.
    """
    wait_time = between(1, 3)

    TYPES = ['terrain', 'villa', 'appartement', 'bureau', 'commerce', 'entrepôt']
    VILLES = ['Abidjan', 'Bingerville', 'Anyama', 'Grand-Bassam', 'Bouaké', 'San-Pédro']
    TRANSACTIONS = ['vente', 'location']
    STATUTS = ['disponible', 'reserve']

    # Liste de slugs découverts dynamiquement
    discovered_slugs = []

    @task(3)
    def visit_homepage(self):
        """Simule la visite de la page d'accueil"""
        self.client.get("/")

    @task(2)
    def visit_catalog_page(self):
        """Simule la visite de la page catalogue de biens"""
        self.client.get("/biens")

    @task(5)
    def search_biens_api(self):
        """
        Simule l'exécution de requêtes de filtrage complexes sur l'API /api/biens.
        Les paramètres aléatoires forcent la base de données à s'exécuter sans utiliser
        de cache de requêtes statiques (Query Cache Bypass).
        """
        params = []
        if random.random() < 0.7:
            params.append(f"type={random.choice(self.TYPES)}")
        if random.random() < 0.6:
            params.append(f"ville={random.choice(self.VILLES)}")
        if random.random() < 0.7:
            params.append(f"transaction={random.choice(self.TRANSACTIONS)}")
        if random.random() < 0.4:
            params.append(f"statut={random.choice(self.STATUTS)}")
        if random.random() < 0.5:
            prix_min = random.choice([0, 10000000, 25000000, 50000000])
            prix_max = random.choice([100000000, 250000000, 500000000])
            params.append(f"prixMin={prix_min}")
            params.append(f"prixMax={prix_max}")
        if random.random() < 0.3:
            params.append(f"surfaceMin={random.randint(50, 300)}")
        if random.random() < 0.4:
            keyword = random.choice(["villa", "terrain", "Cocody", "Marcory", "Bassam", "luxe", "promotion"])
            params.append(f"search={keyword}")

        params.append(f"page={random.randint(1, 3)}")
        params.append("limit=12")

        query_string = "&".join(params)
        url = f"/api/biens?{query_string}"

        with self.client.get(url, name="/api/biens?filters", catch_response=True) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    biens = data.get("biens", [])
                    if biens:
                        for bien in biens:
                            slug = bien.get("slug")
                            if slug and slug not in self.discovered_slugs:
                                self.discovered_slugs.append(slug)
                        if len(self.discovered_slugs) > 100:
                            self.discovered_slugs = self.discovered_slugs[-100:]
                    response.success()
                except Exception as e:
                    response.failure(f"JSON parsing error: {e}")
            else:
                response.failure(f"HTTP Error {response.status_code}")

    @task(4)
    def visit_bien_detail(self):
        """
        Simule la consultation d'une fiche de bien individuelle.
        Utilise un slug découvert via l'API de recherche ou un slug de repli.
        """
        if self.discovered_slugs:
            slug = random.choice(self.discovered_slugs)
            self.client.get(f"/biens/{slug}", name="/biens/[slug]")
        else:
            # Fallback sur des slugs de biens par défaut du seeding
            fallback_slugs = [
                "villa-duplex-luxueuse-de-prestige-a-vendre-cocody-ambassades",
                "terrain-residentiel-cloture-de-450-m2-a-vendre-bingerville",
                "appartement-haut-standing-3-pieces-en-location-plateau"
            ]
            slug = random.choice(fallback_slugs)
            self.client.get(f"/biens/{slug}", name="/biens/[slug]")
