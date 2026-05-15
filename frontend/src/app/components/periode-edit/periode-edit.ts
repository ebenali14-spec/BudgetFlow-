import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { PeriodeService } from '../../services/periode.service';
import { PeriodeBudgetaire, LigneBudget } from '../../models/periode.model';

@Component({
  selector: 'app-periode-edit',
  imports: [CommonModule, DecimalPipe, FormsModule, RouterLink],
  templateUrl: './periode-edit.html',
  styleUrl: './periode-edit.css',
})
export class PeriodeEdit implements OnInit {

  readonly profil = 'PARENT';

  loadingData = true;
  loading     = false;
  submitted   = false;
  erreur      = '';
  alerte      = '';

  periodeOriginale: PeriodeBudgetaire | null = null;
  form: PeriodeBudgetaire = { id: undefined, dateDebut: '', dateFin: '', budgetTotal: 0, statut: 'ACTIF' };
  lignes: LigneBudget[]   = [];

  // true = dateDebut <= aujourd'hui ET statut ACTIF
  periodeEnCours = false;

  // ── Répartition edit (seulement si PAS en cours) ──────────────
  editMode   = false;
  editValues: Record<string, number> = {};
  manualMode = false;
  showQuestionnaire = false;
  reponses: Record<string, string>  = {};

  readonly QUESTIONS_DEFAULT: Record<string, { options: { v: string; l: string }[] }> = {
    LOGEMENT:     { options: [{v:'PROPRIETAIRE',l:'Propriétaire'},{v:'LOCATAIRE',l:'Locataire'},{v:'COLOCATION',l:'Colocation'}] },
    TRANSPORT:    { options: [{v:'VOITURE',l:'Voiture'},{v:'TRANSPORT_COMMUN',l:'Transports en commun'},{v:'VELO',l:'Vélo / Marche'}] },
    ALIMENTATION: { options: [{v:'CUISINE',l:'Je cuisine'},{v:'MIXTE',l:'Mixte'},{v:'RESTAURANT',l:'Restaurant'}] },
    LOISIRS:      { options: [{v:'PEU',l:'Peu'},{v:'MODERE',l:'Modéré'},{v:'BEAUCOUP',l:'Beaucoup'}] },
    SANTE:        { options: [{v:'BONNE',l:'Bonne santé'},{v:'COURANTE',l:'Courante'},{v:'ELEVEE',l:'Élevée'}] },
  };

  readonly SCORES: Record<string, number> = {
    LOGEMENT_PARENT_PROPRIETAIRE:45, LOGEMENT_PARENT_LOCATAIRE:35, LOGEMENT_PARENT_COLOCATION:10,
    TRANSPORT_PARENT_VOITURE:35, TRANSPORT_PARENT_TRANSPORT_COMMUN:20, TRANSPORT_PARENT_VELO:8,
    ALIMENTATION_PARENT_CUISINE:20, ALIMENTATION_PARENT_MIXTE:28, ALIMENTATION_PARENT_RESTAURANT:40,
    LOISIRS_PARENT_PEU:8, LOISIRS_PARENT_MODERE:18, LOISIRS_PARENT_BEAUCOUP:30,
    SANTE_PARENT_BONNE:5, SANTE_PARENT_COURANTE:15, SANTE_PARENT_ELEVEE:30,
  };

  readonly COLORS: Record<string, string> = {
    LOGEMENT: '#2d6a4f', TRANSPORT: '#1a5276', ALIMENTATION: '#784212',
    LOISIRS: '#6c3483', SANTE: '#1b4f72',
  };
  readonly COLORS_CUSTOM = '#b45309';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private periodeService: PeriodeService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.erreur = 'Identifiant de période manquant.';
      this.loadingData = false;
      return;
    }
    this.periodeService.getPeriodeById(id).subscribe({
      next: data => {
        this.periodeOriginale = { ...data, lignes: data.lignes ? [...data.lignes] : [] };
        this.form             = { ...data, lignes: data.lignes ? [...data.lignes] : [] };
        this.lignes           = data.lignes ? [...data.lignes] : [];

        const today     = new Date(); today.setHours(0,0,0,0);
        const dateDebut = new Date(data.dateDebut); dateDebut.setHours(0,0,0,0);
        this.periodeEnCours = data.statut === 'ACTIF' && dateDebut <= today;

        this.loadingData = false;
      },
      error: () => { this.erreur = 'Impossible de charger la période.'; this.loadingData = false; }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────
  get estLectureSeule(): boolean {
    const s = this.periodeOriginale?.statut;
    return s === 'DESACTIVE' || s === 'TERMINE';
  }

  couleurCategorie(catId: string): string { return this.COLORS[catId] ?? this.COLORS_CUSTOM; }

  get dureeCalculee(): number {
    if (!this.form.dateDebut || !this.form.dateFin) return 0;
    const d = new Date(this.form.dateFin).getTime() - new Date(this.form.dateDebut).getTime();
    return d > 0 ? Math.round(d / 86400000) : 0;
  }

  get dureeOriginale(): number {
    if (!this.periodeOriginale) return 0;
    const d = new Date(this.periodeOriginale.dateFin).getTime() - new Date(this.periodeOriginale.dateDebut).getTime();
    return d > 0 ? Math.round(d / 86400000) : 0;
  }

  get dureeChangee(): boolean { return this.dureeCalculee > 0 && this.dureeCalculee !== this.dureeOriginale; }

  get categoriesDefaultKeys(): string[] { return Object.keys(this.QUESTIONS_DEFAULT); }
  get toutesRepondues(): boolean { return this.categoriesDefaultKeys.every(k => !!this.reponses[k]); }

  // ── Navigation vers catégorie ─────────────────────────────────
  accederCategorie(ligne: LigneBudget): void {
    this.router.navigate(['/periodes', this.form.id, 'categories', ligne.categorieId]);
  }

  // ── Répartition recalcul ──────────────────────────────────────
  toggleQuestionnaire(): void { this.showQuestionnaire = !this.showQuestionnaire; }

  recalculer(): void {
    const scores: Record<string, number> = {};
    this.categoriesDefaultKeys.forEach(catId => {
      if (this.reponses[catId]) scores[catId] = this.SCORES[`${catId}_${this.profil}_${this.reponses[catId]}`] ?? 0;
    });
    this.lignes.filter(l => !this.QUESTIONS_DEFAULT[l.categorieId]).forEach(l => { scores[l.categorieId] = l.pourcentage; });
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    if (total === 0) return;
    this.lignes = Object.entries(scores).map(([catId, score]) => {
      const exist = this.lignes.find(l => l.categorieId === catId);
      const pct   = Math.round(score * 1000 / total) / 10;
      return { categorieId: catId, nom: exist?.nom ?? catId, pourcentage: pct, montantAlloue: Math.round(pct * (this.form.budgetTotal ?? 0)) / 100 };
    }).sort((a, b) => b.pourcentage - a.pourcentage);
    this.manualMode = false; this.editMode = false; this.showQuestionnaire = false;
  }

  onBudgetChange(): void {
    this.lignes = this.lignes.map(l => ({
      ...l, montantAlloue: Math.round(l.pourcentage * (this.form.budgetTotal ?? 0)) / 100,
    }));
  }

  // ── Édition manuelle % ────────────────────────────────────────
  ouvrirEditMode(): void { this.editValues = {}; this.lignes.forEach(l => { this.editValues[l.nom] = l.pourcentage; }); this.editMode = true; }
  fermerEditMode(): void { this.editMode = false; }

  get totalEdit(): number { return Math.round(Object.values(this.editValues).reduce((a, b) => a + b, 0) * 10) / 10; }
  get totalEditOk(): boolean { return Math.abs(this.totalEdit - 100) < 0.1; }

  onSliderChange(nom: string, val: string): void { this.editValues[nom] = parseFloat(val); }
  onInputChange(nom: string, val: string): void {
    let v = parseFloat(val); if (isNaN(v) || v < 0) v = 0; if (v > 100) v = 100;
    this.editValues[nom] = v;
  }

  appliquerManuel(): void {
    if (!this.totalEditOk) return;
    this.lignes = this.lignes.map(l => ({ ...l, pourcentage: this.editValues[l.nom], montantAlloue: Math.round(this.editValues[l.nom] * (this.form.budgetTotal ?? 0)) / 100 }));
    this.manualMode = true; this.editMode = false;
  }

  resetAuto(): void {
    const scores: Record<string, number> = {};
    this.categoriesDefaultKeys.forEach(catId => { if (this.reponses[catId]) scores[catId] = this.SCORES[`${catId}_${this.profil}_${this.reponses[catId]}`] ?? 0; });
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    if (total === 0) return;
    this.lignes.forEach(l => { this.editValues[l.nom] = Math.round((scores[l.categorieId] ?? 0) * 1000 / total) / 10; });
    this.manualMode = false;
  }

  getEditKeys(): string[] { return Object.keys(this.editValues); }

  // ── Réinitialiser / Sauvegarder ───────────────────────────────
  reinitialiser(): void {
    if (this.periodeOriginale) {
      this.form    = { ...this.periodeOriginale, lignes: this.periodeOriginale.lignes ? [...this.periodeOriginale.lignes] : [] };
      this.lignes  = this.periodeOriginale.lignes ? [...this.periodeOriginale.lignes] : [];
      this.submitted = false; this.erreur = ''; this.alerte = '';
      this.editMode = false; this.manualMode = false; this.showQuestionnaire = false; this.reponses = {};
    }
  }

  private valider(): boolean {
    if (!this.form.dateDebut || !this.form.dateFin) { this.erreur = 'Les dates sont obligatoires.'; return false; }
    if (this.form.dateFin <= this.form.dateDebut)   { this.erreur = 'La date de fin doit être après la date de début.'; return false; }
    if (this.dureeCalculee < 7)                     { this.erreur = 'La période doit durer au minimum 7 jours.'; return false; }
    if (!this.form.budgetTotal || this.form.budgetTotal <= 0) { this.erreur = 'Le budget doit être positif.'; return false; }
    return true;
  }

  sauvegarder(): void {
    this.submitted = true; this.erreur = '';
    if (!this.valider()) return;
    this.loading = true;
    this.periodeService.updatePeriode({ ...this.form, lignes: this.lignes }).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/periodes'], { queryParams: { updated: '1' } }); },
      error: err => { this.loading = false; this.erreur = err.error?.message || 'Erreur lors de la sauvegarde.'; }
    });
  }
}