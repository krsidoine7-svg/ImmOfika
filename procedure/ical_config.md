# Procédure de Configuration & Synchronisation Google Agenda (iCal)

Ce document décrit la procédure étape par étape permettant aux agents immobiliers d'intégrer leur Google Calendar privé dans l'application **FavorCI**. Cela permet de bloquer automatiquement les créneaux occupés sur le site de réservation client sans exposer les détails privés des événements.

---

## 📅 Étape 1 : Récupérer l'adresse secrète iCal (.ics) depuis Google Calendar

L'obtention de cette URL doit obligatoirement s'effectuer depuis un **ordinateur** (la version mobile de Google Agenda ne fournit pas les liens d'intégration).

1. Ouvrez votre navigateur et accédez à **[Google Agenda](https://calendar.google.com/)**.
2. Dans la colonne latérale gauche, recherchez la section **"Mes agendas"**.
3. Survolez avec votre souris l'agenda que vous souhaitez lier (généralement votre agenda principal avec votre nom/email).
4. Cliquez sur les **trois petits points verticaux** (Options) qui apparaissent, puis sélectionnez **"Paramètres et partage"**.
5. Dans le menu de gauche des paramètres, cliquez sur la section **"Intégrer l'agenda"** (ou faites défiler la page centrale vers le bas).
6. Localisez le champ intitulé **"Adresse secrète au format iCal"**.
7. ⚠️ **IMPORTANT :** Copiez l'adresse complète figurant dans ce champ (elle commence par `https://calendar.google.com/calendar/ical/...` et se termine par `basic.ics`).
   * *Note : Ne copiez jamais l'adresse publique, sous peine d'échec ou d'exposition non sécurisée de vos créneaux.*

---

## 💻 Étape 2 : Lier le calendrier sur FavorCI

1. Connectez-vous à votre espace d'administration sur **FavorCI**.
2. Accédez à la page **"Mon Agenda"** dans la barre latérale.
3. Repérez le panneau **"Synchronisation Google Calendar"**.
4. Collez l'URL secrète copiée dans le champ **"Adresse secrète iCal (.ics)"**.
5. Cliquez sur **"Sauvegarder & Synchroniser"**.

---

## 🛡️ Sécurité & Confidentialité des données

* **Lecture Seule** : L'intégration est unidirectionnelle. FavorCI ne peut en aucun cas écrire, modifier ou supprimer des événements sur votre Google Agenda.
* **Masquage du contenu** : Seul l'état de disponibilité (Libre / Occupé) est lu par le système. Les titres de vos réunions, les descriptions, les invités ou les lieux ne sont jamais lus ni affichés publiquement.
* **Intégrité de l'agenda** : Si vous supprimez le lien iCal de FavorCI, vos créneaux redeviendront instantanément réservables et toutes les traces de synchronisation seront archivées.

---

## ⚙️ Détails Techniques de la base de données

* **Table PostgreSQL** : `agent_calendriers`
* **Persistance** : Seule l'URL secrète `.ics` et la date de dernière synchronisation sont sauvegardées en base de données.
* **Pas de stockage d'événements** : Les événements du calendrier Google ne sont pas dupliqués dans la base de données de FavorCI. Ils sont analysés en temps réel et mis en cache mémoire (RAM du serveur) pendant **15 minutes** pour assurer une réactivité maximale du site.
* **Soft Delete** : La suppression du calendrier utilise un soft delete (`deleted_at` mis à jour avec le timestamp de suppression).
