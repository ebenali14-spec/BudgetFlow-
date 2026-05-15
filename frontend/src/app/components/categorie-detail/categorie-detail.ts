import { Component, OnInit } from '@angular/core';
import { Depense, LigneBudget, PeriodeBudgetaire } from '../../models/periode.model';
import { PeriodeService } from '../../services/periode.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-categorie-detail',
  imports: [CommonModule, DecimalPipe, FormsModule, RouterLink],
  templateUrl: './categorie-detail.html',
  styleUrl: './categorie-detail.css',
})
export class CategorieDetail implements OnInit {

  periodeId:   string = '';
  categorieId: string = '';

  periode: PeriodeBudgetaire | null = null;
  ligne:   LigneBudget | null       = null;

  depenses:    Depense[] = [];
  loadingData  = true;
  erreur       = '';
  succes       = '';

  // Formulaire ajout
  nouvelleDepense = { description: '', montant: null as number | null, date: '' };
  ajoutEnCours    = false;
  erreurForm      = '';

  // Édition
  depenseEnEdit:    Depense | null = null;
  editDescription = '';
  editMontant:     number | null  = null;

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
    this.route.paramMap.subscribe(params => {
      const periodeIdParam   = params.get('periodeId');
      const categorieIdParam = params.get('categorieId');

      if (!periodeIdParam || !categorieIdParam) {
        this.erreur = 'Paramètres de navigation invalides.';
        this.loadingData = false;
        return;
      }

      this.periodeId   = periodeIdParam;
      this.categorieId = categorieIdParam;
      this.erreur      = '';
      this.depenses    = [];
      this.depenseEnEdit = null;
      this.loadingData = true;
      this.nouvelleDepense = { description: '', montant: null, date: this.todayStr };

      this.periodeService.getPeriodeById(this.periodeId).subscribe({
        next: data => {
          this.periode = data;
          this.ligne   = data.lignes?.find(l => l.categorieId === this.categorieId) ?? null;
          this.chargerDepenses();
        },
        error: () => { this.erreur = 'Impossible de charger la période.'; this.loadingData = false; }
      });
    });
  }

  chargerDepenses(): void {
    this.periodeService.getDepensesByPeriode(this.periodeId).subscribe({
      next: deps => {
        this.depenses    = deps.filter(d => d.categorieId === this.categorieId)
                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.loadingData = false;
      },
      error: () => { this.erreur = 'Impossible de charger les dépenses.'; this.loadingData = false; }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────
  get todayStr(): string { return new Date().toISOString().split('T')[0]; }

  get couleur(): string { return this.COLORS[this.categorieId] ?? this.COLORS_CUSTOM; }

  get montantDepense(): number {
    return this.depenses.reduce((s, d) => s + d.montant, 0);
  }

  get montantRestant(): number {
    return (this.ligne?.montantAlloue ?? 0) - this.montantDepense;
  }

  get joursRestants(): number {
    if (!this.periode?.dateFin) return 1;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const fin   = new Date(this.periode.dateFin); fin.setHours(0, 0, 0, 0);
    return Math.max(1, Math.round((fin.getTime() - today.getTime()) / 86400000));
  }

  get seuilJournalier(): number {
    return Math.round((this.montantRestant / this.joursRestants) * 100) / 100;
  }

  get pourcentageConsomme(): number {
    if (!this.ligne?.montantAlloue) return 0;
    return Math.min(100, Math.round(this.montantDepense * 100 / this.ligne.montantAlloue));
  }

  // Une dépense est éditable seulement si elle a été créée aujourd'hui
  estEditable(dep: Depense): boolean {
    return dep.date === this.todayStr;
  }

  // ── Ajouter ───────────────────────────────────────────────────
  ajouterDepense(): void {
    this.erreurForm = '';
    if (!this.nouvelleDepense.description.trim()) { this.erreurForm = 'La description est requise.'; return; }
    if (!this.nouvelleDepense.montant || this.nouvelleDepense.montant <= 0) { this.erreurForm = 'Le montant doit être positif.'; return; }

    this.ajoutEnCours = true;
    const dep: Depense = {
      description: this.nouvelleDepense.description.trim(),
      montant:     this.nouvelleDepense.montant,
      date:        this.todayStr,  // toujours aujourd'hui
      estImprevue: false,
      periodeId:   this.periodeId,
      categorieId: this.categorieId,
    };

    this.periodeService.addDepense(dep).subscribe({
      next: d => {
        this.depenses.unshift(d);
        this.nouvelleDepense = { description: '', montant: null, date: this.todayStr };
        this.ajoutEnCours    = false;
        this.afficherSucces('Dépense enregistrée.');
      },
      error: () => { this.erreurForm = 'Erreur lors de l\'enregistrement.'; this.ajoutEnCours = false; }
    });
  }

  // ── Éditer ────────────────────────────────────────────────────
  ouvrirEdit(dep: Depense): void {
    if (!this.estEditable(dep)) return;
    this.depenseEnEdit  = dep;
    this.editDescription = dep.description;
    this.editMontant     = dep.montant;
  }

  annulerEdit(): void {
    this.depenseEnEdit = null;
  }

  sauvegarderEdit(): void {
    if (!this.depenseEnEdit) return;
    if (!this.editDescription.trim()) return;
    if (!this.editMontant || this.editMontant <= 0) return;

    const updated: Depense = {
      ...this.depenseEnEdit,
      description: this.editDescription.trim(),
      montant:     this.editMontant,
    };

    if (!updated.id) {
      this.erreurForm = 'Impossible de modifier : identifiant de dépense manquant.';
      return;
    }

    this.periodeService.updateDepense(updated).subscribe({
      next: d => {
        const idx = this.depenses.findIndex(x => x.id === d.id);
        if (idx !== -1) this.depenses[idx] = d;
        this.depenseEnEdit = null;
        this.afficherSucces('Dépense modifiée.');
      },
      error: () => { this.erreurForm = 'Erreur lors de la modification.'; }
    });
  }

  // ── Supprimer ─────────────────────────────────────────────────
  supprimerDepense(id: number | string): void {
    this.periodeService.deleteDepense(id).subscribe({
      next: () => { this.depenses = this.depenses.filter(d => d.id !== id); }
    });
  }

  afficherSucces(msg: string): void { this.succes = msg; setTimeout(() => this.succes = '', 2500); }

  retour(): void { this.router.navigate(['/periodes/edit', this.periodeId]); }
}
