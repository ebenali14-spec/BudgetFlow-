import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PeriodeService } from '../../services/periode.service';
import { CategorieService } from '../../services/categorieService/categorie-service';

interface CategorieUI {
  id: string;
  nom: string;
  estParDefaut: boolean;
  reponse?: string;       // catégories default
  frequence?: string;     // catégories perso
  essentialite?: string;
  montantNiveau?: string;
  exclue: boolean;
  scoreManuel?: number;   // score custom si édition manuelle
}

interface LigneRepartition {
  categorieId: string;
  nom: string;
  pourcentage: number;
  montantAlloue: number;
}

@Component({
  selector: 'app-periode-create',
  imports: [CommonModule, DecimalPipe, FormsModule, RouterLink],
  templateUrl: './periode-create.html',
  styleUrl: './periode-create.css',
})
export class PeriodeCreate implements OnInit {

  readonly userId = 1;

  // ── Step 1 : infos de base ────────────────────────────────────
  form = {
    dateDebut:   '',
    dateFin:     '',
    budgetTotal: null as number | null,
    statut:      'ACTIF' as string,
  };
  submitted    = false;
  erreur       = '';
  loading      = false;

  // ── Step 2 : questionnaire ────────────────────────────────────
  profil: 'ETUDIANT' | 'PARENT' | 'SEUL' = 'PARENT';
  categories: CategorieUI[] = [];

  // modal ajout catégorie perso
  modalVisible   = false;
  modalErreur    = '';
  nouvelleCategorie = { nom: '', frequence: '', essentialite: '', montantNiveau: '' };

  // ── Step 3 : répartition ──────────────────────────────────────
  repartition: LigneRepartition[] = [];
  repartitionPrete = false;

  // mode édition manuelle
  editMode    = false;
  editValues: Record<string, number> = {};  // cat → %
  manualMode  = false;  // true si l'user a appliqué une modif manuelle

  readonly COLORS: Record<string, string> = {
    LOGEMENT:     '#2d6a4f',
    TRANSPORT:    '#1a5276',
    ALIMENTATION: '#784212',
    LOISIRS:      '#6c3483',
    SANTE:        '#1b4f72',
  };
  readonly COLORS_CUSTOM = '#b45309';

  readonly QUESTIONS_DEFAULT: Record<string, { label: string; options: { v: string; l: string }[] }> = {
    LOGEMENT:     { label: 'Votre situation de logement ?',        options: [{v:'PROPRIETAIRE',l:'Propriétaire'},{v:'LOCATAIRE',l:'Locataire'},{v:'COLOCATION',l:'Colocation'}] },
    TRANSPORT:    { label: 'Votre moyen de transport principal ?', options: [{v:'VOITURE',l:'Voiture'},{v:'TRANSPORT_COMMUN',l:'Transports en commun'},{v:'VELO',l:'Vélo / Marche'}] },
    ALIMENTATION: { label: 'Vos habitudes alimentaires ?',         options: [{v:'CUISINE',l:'Je cuisine'},{v:'MIXTE',l:'Mixte'},{v:'RESTAURANT',l:'Restaurant'}] },
    LOISIRS:      { label: 'Vos dépenses en loisirs ?',           options: [{v:'PEU',l:'Peu'},{v:'MODERE',l:'Modéré'},{v:'BEAUCOUP',l:'Beaucoup'}] },
    SANTE:        { label: 'Vos dépenses de santé ?',             options: [{v:'BONNE',l:'Bonne santé'},{v:'COURANTE',l:'Courante'},{v:'ELEVEE',l:'Élevée'}] },
  };

  readonly SCORES: Record<string, number> = {
    LOGEMENT_PARENT_PROPRIETAIRE:35, LOGEMENT_PARENT_LOCATAIRE:35, LOGEMENT_PARENT_COLOCATION:10,
    LOGEMENT_ETUDIANT_PROPRIETAIRE:35, LOGEMENT_ETUDIANT_LOCATAIRE:30, LOGEMENT_ETUDIANT_COLOCATION:20,
    LOGEMENT_SEUL_PROPRIETAIRE:38, LOGEMENT_SEUL_LOCATAIRE:30, LOGEMENT_SEUL_COLOCATION:18,
    TRANSPORT_PARENT_VOITURE:35, TRANSPORT_PARENT_TRANSPORT_COMMUN:20, TRANSPORT_PARENT_VELO:8,
    TRANSPORT_ETUDIANT_VOITURE:25, TRANSPORT_ETUDIANT_TRANSPORT_COMMUN:15, TRANSPORT_ETUDIANT_VELO:5,
    TRANSPORT_SEUL_VOITURE:28, TRANSPORT_SEUL_TRANSPORT_COMMUN:15, TRANSPORT_SEUL_VELO:6,
    ALIMENTATION_PARENT_CUISINE:20, ALIMENTATION_PARENT_MIXTE:28, ALIMENTATION_PARENT_RESTAURANT:40,
    ALIMENTATION_ETUDIANT_CUISINE:15, ALIMENTATION_ETUDIANT_MIXTE:22, ALIMENTATION_ETUDIANT_RESTAURANT:35,
    ALIMENTATION_SEUL_CUISINE:15, ALIMENTATION_SEUL_MIXTE:22, ALIMENTATION_SEUL_RESTAURANT:35,
    LOISIRS_PARENT_PEU:8, LOISIRS_PARENT_MODERE:18, LOISIRS_PARENT_BEAUCOUP:30,
    LOISIRS_ETUDIANT_PEU:5, LOISIRS_ETUDIANT_MODERE:15, LOISIRS_ETUDIANT_BEAUCOUP:28,
    LOISIRS_SEUL_PEU:10, LOISIRS_SEUL_MODERE:20, LOISIRS_SEUL_BEAUCOUP:32,
    SANTE_PARENT_BONNE:5, SANTE_PARENT_COURANTE:15, SANTE_PARENT_ELEVEE:30,
    SANTE_ETUDIANT_BONNE:3, SANTE_ETUDIANT_COURANTE:10, SANTE_ETUDIANT_ELEVEE:20,
    SANTE_SEUL_BONNE:5, SANTE_SEUL_COURANTE:12, SANTE_SEUL_ELEVEE:22,
    CUSTOM_RAREMENT:5, CUSTOM_PARFOIS:15, CUSTOM_SOUVENT:28,
    CUSTOM_OPTIONNELLE:5, CUSTOM_UTILE:15, CUSTOM_ESSENTIELLE:30,
    CUSTOM_FAIBLE:5, CUSTOM_MOYEN:15, CUSTOM_ELEVE:28,
  };

  constructor(
    private periodeService: PeriodeService,
    private categorieService: CategorieService,
    private router: Router
  ) {}

// Ajoute cette propriété
dejaUnePeriodeActive = false;

// Dans ngOnInit, après le chargement des catégories, ajoute :
ngOnInit(): void {
  this.categorieService.getAll().subscribe({
    next: data => {
      this.categories = data.map(c => ({
        id: c.id, nom: c.nom,
        estParDefaut: c.estParDefaut,
        exclue: false,
      }));
    },
    error: () => this.erreur = 'Impossible de charger les catégories.'
  });

  // Vérif période active existante
  this.periodeService.hasActivePeriode(this.userId).subscribe({
    next: existe => this.dejaUnePeriodeActive = existe
  });
}

  // ── Helpers ───────────────────────────────────────────────────
  get todayStr() { return new Date().toISOString().split('T')[0]; }

  get dureeCalculee(): number {
    if (!this.form.dateDebut || !this.form.dateFin) return 0;
    const d = new Date(this.form.dateFin).getTime() - new Date(this.form.dateDebut).getTime();
    return d > 0 ? Math.round(d / 86400000) : 0;
  }

  get categoriesActives(): CategorieUI[] {
    return this.categories.filter(c => !c.exclue);
  }

  get toutesRepondues(): boolean {
    if (!this.form.dateDebut || !this.form.dateFin ||
        !this.form.budgetTotal || this.form.budgetTotal <= 0 ||
        this.dureeCalculee < 7) return false;
    return this.categoriesActives.every(c =>
      c.estParDefaut
        ? !!c.reponse
        : !!c.frequence && !!c.essentialite && !!c.montantNiveau
    );
  }

  couleurCategorie(catId: string): string {
    return this.COLORS[catId] ?? this.COLORS_CUSTOM;
  }

  setProfil(p: 'ETUDIANT' | 'PARENT' | 'SEUL') {
    this.profil = 'PARENT';
    this.categories.forEach(c => { c.reponse = undefined; c.frequence = undefined; c.essentialite = undefined; c.montantNiveau = undefined; });
    this.repartitionPrete = false;
    this.manualMode = false;
    this.editMode = false;
  }

  onReponseChange() {
    this.repartitionPrete = false;
    this.manualMode = false;
  }

  toggleExclure(cat: CategorieUI) {
    cat.exclue = !cat.exclue;
    this.repartitionPrete = false;
    this.manualMode = false;
  }

  // ── Score local ───────────────────────────────────────────────
  private calculerScores(): Record<string, number> {
    const scores: Record<string, number> = {};
    for (const c of this.categoriesActives) {
      if (c.estParDefaut) {
        const key = `${c.id}_${this.profil}_${c.reponse}`;
        scores[c.id] = this.SCORES[key] ?? 0;
      } else {
        const s = (this.SCORES[`CUSTOM_${c.frequence}`] ?? 0)
                + (this.SCORES[`CUSTOM_${c.essentialite}`] ?? 0)
                + (this.SCORES[`CUSTOM_${c.montantNiveau}`] ?? 0);
        scores[c.nom] = s;
      }
    }
    return scores;
  }

  calculerRepartition() {
    const scores = this.calculerScores();
    const total  = Object.values(scores).reduce((a, b) => a + b, 0);
    if (total === 0) return;

    this.repartition = this.categoriesActives.map(c => {
      const key   = c.estParDefaut ? c.id : c.nom;
      const score = scores[key] ?? 0;
      const pct   = Math.round(score * 1000 / total) / 10;
      return {
        categorieId:  c.id,
        nom:          c.nom,
        pourcentage:  pct,
        montantAlloue: Math.round(pct * (this.form.budgetTotal ?? 0)) / 100,
      };
    }).sort((a, b) => b.pourcentage - a.pourcentage);

    this.repartitionPrete = true;
    this.editMode = false;
    this.manualMode = false;
  }

  // ── Édition manuelle ──────────────────────────────────────────
  ouvrirEditMode() {
    this.editValues = {};
    this.repartition.forEach(l => { this.editValues[l.nom] = l.pourcentage; });
    this.editMode = true;
  }

  fermerEditMode() { this.editMode = false; }

  get totalEdit(): number {
    return Math.round(Object.values(this.editValues).reduce((a, b) => a + b, 0) * 10) / 10;
  }

  get totalEditOk(): boolean { return Math.abs(this.totalEdit - 100) < 0.1; }

  onSliderChange(nom: string, val: string) {
    this.editValues[nom] = parseFloat(val);
  }

  onInputChange(nom: string, val: string) {
    let v = parseFloat(val);
    if (isNaN(v) || v < 0) v = 0;
    if (v > 100) v = 100;
    this.editValues[nom] = v;
  }

  appliquerManuel() {
    if (!this.totalEditOk) return;
    this.repartition = this.repartition.map(l => ({
      ...l,
      pourcentage:  this.editValues[l.nom],
      montantAlloue: Math.round(this.editValues[l.nom] * (this.form.budgetTotal ?? 0)) / 100,
    }));
    this.manualMode = true;
    this.editMode   = false;
  }

  resetAuto() {
    const scores = this.calculerScores();
    const total  = Object.values(scores).reduce((a, b) => a + b, 0);
    this.repartition.forEach(l => {
      const key = this.categoriesActives.find(c => c.nom === l.nom)?.id ?? l.nom;
      const pct = Math.round((scores[key] ?? 0) * 1000 / total) / 10;
      this.editValues[l.nom] = pct;
    });
    this.manualMode = false;
  }

  // ── Modal catégorie perso ─────────────────────────────────────
  ouvrirModal() {
    this.nouvelleCategorie = { nom: '', frequence: '', essentialite: '', montantNiveau: '' };
    this.modalErreur = '';
    this.modalVisible = true;
  }

  fermerModal() { this.modalVisible = false; }

  ajouterCategorie() {
    const { nom, frequence, essentialite, montantNiveau } = this.nouvelleCategorie;
    if (!nom.trim()) { this.modalErreur = 'Le nom est requis.'; return; }
    if (!frequence || !essentialite || !montantNiveau) { this.modalErreur = 'Répondez aux 3 questions.'; return; }
    if (this.categories.find(c => c.nom.toLowerCase() === nom.trim().toLowerCase())) {
      this.modalErreur = 'Cette catégorie existe déjà.'; return;
    }
    this.categories.push({
      id: nom.trim(), nom: nom.trim(),
      estParDefaut: false,
      frequence, essentialite, montantNiveau,
      exclue: false,
    });
    this.modalVisible = false;
    this.repartitionPrete = false;
  }

  // ── Valider et créer ──────────────────────────────────────────
  private valider(): boolean {
    if (!this.form.dateDebut || !this.form.dateFin) { this.erreur = 'Les dates sont obligatoires.'; return false; }
    if (this.form.dateFin <= this.form.dateDebut)   { this.erreur = 'La date de fin doit être après la date de début.'; return false; }
    if (this.dureeCalculee < 7)                     { this.erreur = 'La période doit durer au minimum 7 jours.'; return false; }
    if (!this.form.budgetTotal || this.form.budgetTotal <= 0) { this.erreur = 'Le budget doit être positif.'; return false; }
    if (!this.repartitionPrete)                     { this.erreur = 'Calculez la répartition avant de valider.'; return false; }
    return true;
  }

  creerPeriode() {
  this.submitted = true;
  this.erreur    = '';

  // Bloquer si période active existante et statut ACTIF
  if (this.dejaUnePeriodeActive && this.form.statut === 'ACTIF') {
    this.erreur = 'Vous avez déjà une période active. Désactivez-la avant d\'en créer une nouvelle.';
    return;
  }
    if (!this.valider()) return;

    this.loading = true;
    const payload = {
      dateDebut:     this.form.dateDebut,
      dateFin:       this.form.dateFin,
      budgetTotal:   this.form.budgetTotal,
      statut:        this.form.statut,
      utilisateurId: this.userId,
      lignes:        this.repartition,
    };

    this.periodeService.createPeriode(payload).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/periodes'], { queryParams: { created: '1' } }); },
      error: err => { this.loading = false; this.erreur = err.error?.message || 'Erreur lors de la création.'; }
    });
  }

  getEditKeys(): string[] { return Object.keys(this.editValues); }
}