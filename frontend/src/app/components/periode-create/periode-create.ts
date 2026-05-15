import { Component, OnInit } from '@angular/core';
import { PeriodeService } from '../../services/periode.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategorieService } from '../../services/categorieService/categorie-service';

interface CategorieQuestion {
  id: string;
  nom: string;
  estParDefaut: boolean;
  reponse?: string;      // pour default : la valeur choisie ex "LOCATAIRE"
  frequence?: string;    // pour perso
  essentialite?: string; // pour perso
  montant?: string;      // pour perso
  exclue: boolean;
}

interface LigneRepartition {
  categorie: string;
  pourcentage: number;
  montant: number;
}

@Component({
  selector: 'app-periode-create',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './periode-create.html',
  styleUrl: './periode-create.css',
})
export class PeriodeCreate implements OnInit {
  userId = 1;
  profil = 'PARENT';

  form = {
    dateDebut:   '',
    dateFin:     '',
    budgetTotal: null as number | null,
    statut:      'ACTIF'
  };

  categories: CategorieQuestion[] = [];
  repartition: LigneRepartition[] = [];
  repartitionChargee = false;
  loadingRepartition = false;

  nouvelleCategorie = { nom: '', frequence: '', essentialite: '', montant: '' };
  ajoutCategorieVisible = false;
  erreurAjout = '';

  erreur    = '';
  loading   = false;
  submitted = false;

  // questions + options pour chaque catégorie default
  // la clé = id de la catégorie en BD (ex: "LOGEMENT")
  // la valeur de chaque option = ce qu'on concatène dans la clé du MAP backend
  readonly questionsDefault: Record<string, { label: string; options: { value: string; label: string }[] }> = {
    LOGEMENT: {
      label: 'Votre situation de logement ?',
      options: [
        { value: 'PROPRIETAIRE', label: 'Propriétaire' },
        { value: 'LOCATAIRE',    label: 'Locataire'    },
        { value: 'COLOCATION',   label: 'Colocation'   }
      ]
    },
    TRANSPORT: {
      label: 'Votre moyen de transport principal ?',
      options: [
        { value: 'VOITURE',          label: 'Voiture'                },
        { value: 'TRANSPORT_COMMUN', label: 'Transports en commun'   },
        { value: 'VELO',             label: 'Vélo / Marche'          }
      ]
    },
    ALIMENTATION: {
      label: 'Vos habitudes alimentaires ?',
      options: [
        { value: 'CUISINE',    label: 'Je cuisine'  },
        { value: 'MIXTE',      label: 'Mixte'       },
        { value: 'RESTAURANT', label: 'Restaurant'  }
      ]
    },
    LOISIRS: {
      label: 'Vos dépenses en loisirs ?',
      options: [
        { value: 'PEU',      label: 'Peu'      },
        { value: 'MODERE',   label: 'Modéré'   },
        { value: 'BEAUCOUP', label: 'Beaucoup' }
      ]
    },
    SANTE: {
      label: 'Vos dépenses de santé ?',
      options: [
        { value: 'BONNE',    label: 'Bonne santé' },
        { value: 'COURANTE', label: 'Courante'    },
        { value: 'ELEVEE',   label: 'Élevée'      }
      ]
    }
  };

  readonly optionsFrequence    = [
    { value: 'RAREMENT', label: 'Rarement' },
    { value: 'PARFOIS',  label: 'Parfois'  },
    { value: 'SOUVENT',  label: 'Souvent'  }
  ];
  readonly optionsEssentialite = [
    { value: 'OPTIONNELLE', label: 'Optionnelle' },
    { value: 'UTILE',       label: 'Utile'       },
    { value: 'ESSENTIELLE', label: 'Essentielle' }
  ];
  readonly optionsMontant = [
    { value: 'FAIBLE', label: 'Faible (< 50 DT)'   },
    { value: 'MOYEN',  label: 'Moyen (50–150 DT)'  },
    { value: 'ELEVE',  label: 'Élevé (> 150 DT)'   }
  ];

  constructor(
    private periodeService: PeriodeService,
    private categorieService: CategorieService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerCategories();
  }

  chargerCategories(): void {
    this.categorieService.getAll().subscribe({
      next: (data) => {
        this.categories = data.map(c => ({
          id:           c.id,
          nom:          c.nom,
          estParDefaut: c.estParDefaut,
          exclue:       false
        }));
      },
      error: () => this.erreur = 'Impossible de charger les catégories.'
    });
  }

  get todayStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  get dureeCalculee(): number {
    if (!this.form.dateDebut || !this.form.dateFin) return 0;
    const diff = new Date(this.form.dateFin).getTime() - new Date(this.form.dateDebut).getTime();
    return diff > 0 ? Math.round(diff / (1000 * 60 * 60 * 24)) : 0;
  }

  get categoriesActives(): CategorieQuestion[] {
    return this.categories.filter(c => !c.exclue);
  }

  get formulaireComplet(): boolean {
    if (!this.form.dateDebut || !this.form.dateFin ||
        !this.form.budgetTotal || this.form.budgetTotal <= 0 ||
        this.dureeCalculee < 7) return false;

    return this.categoriesActives.every(c => {
      if (c.estParDefaut) return !!c.reponse;
      return !!c.frequence && !!c.essentialite && !!c.montant;
    });
  }

  private buildReponses(): string[] {
    return this.categoriesActives.map(c => {
      if (c.estParDefaut) {
        // ex: "LOGEMENT_ETUDIANT_LOCATAIRE"
        return `${c.id}_${this.profil}_${c.reponse}`;
      } else {
        // ex: "Animaux_CUSTOM_SOUVENT_CUSTOM_ESSENTIELLE_CUSTOM_MOYEN"
        return `${c.nom}_CUSTOM_${c.frequence}_CUSTOM_${c.essentialite}_CUSTOM_${c.montant}`;
      }
    });
  }

  calculerRepartition(): void {
    this.loadingRepartition = true;
    this.erreur = '';

    const payload = {
      reponses:    this.buildReponses(),
      budgetTotal: this.form.budgetTotal
    };

    this.periodeService.calculerRepartition(payload).subscribe({
      next: (res) => {
        this.loadingRepartition = false;
        this.repartitionChargee = true;
        this.repartition = Object.keys(res.pourcentages)
          .map(cat => ({
            categorie:   cat,
            pourcentage: res.pourcentages[cat],
            montant:     res.montants[cat]
          }))
          .sort((a, b) => b.pourcentage - a.pourcentage);
      },
      error: () => {
        this.loadingRepartition = false;
        this.erreur = 'Erreur lors du calcul de la répartition.';
      }
    });
  }

  onReponseChange(): void {
    this.repartitionChargee = false;
  }

  afficherAjoutCategorie(): void {
    this.ajoutCategorieVisible = true;
    this.nouvelleCategorie = { nom: '', frequence: '', essentialite: '', montant: '' };
    this.erreurAjout = '';
  }

  ajouterCategorie(): void {
    const { nom, frequence, essentialite, montant } = this.nouvelleCategorie;
    if (!nom.trim()) { this.erreurAjout = 'Le nom est requis.'; return; }
    if (!frequence || !essentialite || !montant) { this.erreurAjout = 'Répondez aux 3 questions.'; return; }
    if (this.categories.find(c => c.nom.toLowerCase() === nom.trim().toLowerCase())) {
      this.erreurAjout = 'Cette catégorie existe déjà.'; return;
    }
    this.categories.push({
      id: nom.trim(), nom: nom.trim(),
      estParDefaut: false,
      frequence, essentialite, montant,
      exclue: false
    });
    this.ajoutCategorieVisible = false;
    this.repartitionChargee    = false;
  }

  annulerAjout(): void {
    this.ajoutCategorieVisible = false;
    this.erreurAjout = '';
  }

  private valider(): boolean {
    if (!this.form.dateDebut || !this.form.dateFin) {
      this.erreur = 'Les dates sont obligatoires.'; return false;
    }
    if (this.form.dateDebut < this.todayStr) {
      this.erreur = 'La date de début ne peut pas être dans le passé.'; return false;
    }
    if (this.form.dateFin <= this.form.dateDebut) {
      this.erreur = 'La date de fin doit être après la date de début.'; return false;
    }
    if (this.dureeCalculee < 7) {
      this.erreur = 'La période doit durer au minimum 7 jours.'; return false;
    }
    if (!this.form.budgetTotal || this.form.budgetTotal <= 0) {
      this.erreur = 'Le budget doit être positif.'; return false;
    }
    if (!this.repartitionChargee) {
      this.erreur = 'Calculez la répartition avant de valider.'; return false;
    }
    return true;
  }

  creerPeriode(): void {
    this.submitted = true;
    this.erreur    = '';
    if (!this.valider()) return;

    this.loading = true;
    const payload = {
      dateDebut:     this.form.dateDebut,
      dateFin:       this.form.dateFin,
      budgetTotal:   this.form.budgetTotal,
      statut:        this.form.statut,
      utilisateurId: this.userId
    };

    this.periodeService.createPeriode(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/periodes'], { queryParams: { created: '1' } });
      },
      error: (err) => {
        this.loading = false;
        this.erreur = err.error?.message || err.error?.erreur || 'Erreur lors de la création.';
      }
    });
  }
}