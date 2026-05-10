import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PeriodeService } from '../../services/periode.service';
import { PeriodeBudgetaire } from '../../models/periode.model';

@Component({
  selector: 'app-periodes',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './periodes.component.html',
  styleUrl: './periodes.component.css'
})
export class PeriodesComponent implements OnInit {

  userId = 1;

  // All periods fetched from the backend
  periodes: PeriodeBudgetaire[] = [];

  // Filtered list shown on screen
  periodesFiltrees: PeriodeBudgetaire[] = [];

  modalOuvert: 'create' | 'edit' | 'delete' | null = null;
  periodeSelectionnee: PeriodeBudgetaire | null = null;
  erreur: string = '';
  succes: string = '';

  // Filter values
  filtreType: 'toutes' | 'reelles' | 'simulations' = 'toutes';
  filtreAnnee: number | null = null;
  anneeDisponibles: number[] = []; // list of years found in the data

  form: any = {
    dateDebut: '',
    dateFin: '',
    budgetTotal: null,
    statut: 'ACTIVE',
    estSimulation: false
  };

  constructor(private periodeService: PeriodeService) {}

  ngOnInit(): void {
    this.chargerPeriodes();
  }

  chargerPeriodes(): void {
    this.periodeService.getPeriodesByUser(this.userId).subscribe({
      next: (data) => {
        this.periodes = data;
        this.extraireAnnees();
        this.appliquerFiltres();
      },
      error: () => this.afficherErreur('Impossible de charger les périodes.')
    });
  }

  // Extract unique years from the periods for the year dropdown
  extraireAnnees(): void {
    const annees = this.periodes.map(p => new Date(p.dateDebut).getFullYear());
    this.anneeDisponibles = [...new Set(annees)].sort((a, b) => b - a);
  }

  // Apply both filters together
  appliquerFiltres(): void {
    this.periodesFiltrees = this.periodes.filter(p => {
      // Filter by type
      const typeOk =
        this.filtreType === 'toutes' ||
        (this.filtreType === 'reelles' && !p.estSimulation) ||
        (this.filtreType === 'simulations' && p.estSimulation);

      // Filter by year
       const annee = new Date(p.dateDebut).getFullYear();
      const anneeOk = this.filtreAnnee === null || annee === this.filtreAnnee;

      return typeOk && anneeOk;
    });
  }
   // Called when user clicks a type filter button
  setFiltreType(type: 'toutes' | 'reelles' | 'simulations'): void {
    this.filtreType = type;
    this.appliquerFiltres();
  }

  // Called when user changes the year dropdown
  setFiltreAnnee(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.filtreAnnee = val === 'toutes' ? null : parseInt(val);
    this.appliquerFiltres();
  }

  // ── MODALS ───────────────────────────────────────────────────

  ouvrirCreation(): void {
    this.form = { dateDebut: '', dateFin: '', budgetTotal: null, statut: 'ACTIVE', estSimulation: false };
    this.erreur = '';
    this.modalOuvert = 'create';
  }

  ouvrirModification(p: PeriodeBudgetaire): void {
    this.periodeSelectionnee = p;
    this.form = { id: p.id, dateDebut: p.dateDebut, dateFin: p.dateFin, budgetTotal: p.budgetTotal, statut: p.statut, estSimulation: p.estSimulation };
    this.erreur = '';
    this.modalOuvert = 'edit';
  }

  ouvrirSuppression(p: PeriodeBudgetaire): void {
    this.periodeSelectionnee = p;
    this.modalOuvert = 'delete';
  }

  fermerModal(): void {
    this.modalOuvert = null;
    this.periodeSelectionnee = null;
    this.erreur = '';
  }
   // ── CRUD ─────────────────────────────────────────────────────

  creerPeriode(): void {
    if (!this.validerFormulaire()) return;
    const payload = { ...this.form, utilisateurId: this.userId };
    this.periodeService.createPeriode(payload).subscribe({
      next: () => { this.fermerModal(); this.chargerPeriodes(); this.afficherSucces('Période créée !'); },
      error: () => this.afficherErreur('Erreur lors de la création.')
    });
  }

  modifierPeriode(): void {
    if (!this.validerFormulaire()) return;
    const payload = { ...this.form, utilisateurId: this.userId };
    this.periodeService.updatePeriode(payload).subscribe({
      next: () => { this.fermerModal(); this.chargerPeriodes(); this.afficherSucces('Période modifiée !'); },
      error: () => this.afficherErreur('Erreur lors de la modification.')
    });
  }
   confirmerSuppression(): void {
    if (!this.periodeSelectionnee?.id) return;
    this.periodeService.deletePeriode(this.periodeSelectionnee.id).subscribe({
      next: () => { this.fermerModal(); this.chargerPeriodes(); this.afficherSucces('Période supprimée.'); },
      error: () => this.afficherErreur('Erreur lors de la suppression.')
    });
  }

  // ── VALIDATION ───────────────────────────────────────────────

  validerFormulaire(): boolean {
    if (!this.form.dateDebut || !this.form.dateFin || !this.form.budgetTotal) {
      this.erreur = 'Tous les champs sont obligatoires.'; return false;
    }
    if (this.form.dateFin <= this.form.dateDebut) {
      this.erreur = 'La date de fin doit être après la date de début.'; return false;
    }
    if (this.form.budgetTotal <= 0) {
      this.erreur = 'Le budget doit être positif.'; return false;
    }
    return true;
  }
   // ── HELPERS ──────────────────────────────────────────────────

  calculerDuree(debut: string, fin: string): number {
    return Math.round((new Date(fin).getTime() - new Date(debut).getTime()) / (1000 * 60 * 60 * 24));
  }

  afficherErreur(msg: string): void { this.erreur = msg; }

  afficherSucces(msg: string): void {
    this.succes = msg;
    setTimeout(() => this.succes = '', 3000);
  }
}