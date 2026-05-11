import { Component, inject, OnInit } from '@angular/core';
import { PeriodeService } from '../../services/periode.service';
import { PeriodeBudgetaire } from '../../models/periode.model';
import { RouterLink } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-periodes-list',
  imports: [CommonModule, DecimalPipe, RouterLink],
  templateUrl: './periodes-list.html',
  styleUrl: './periodes-list.css',
})
export class PeriodesList implements OnInit {

  private readonly periodeService = inject(PeriodeService);

  userId = 1;

  periodes: PeriodeBudgetaire[]        = [];
  periodesFiltrees: PeriodeBudgetaire[] = [];

  filtreStatut: 'tous' | 'ACTIF' | 'DESACTIVE' | 'TERMINE' | 'SIMULATION' = 'tous';
  filtreAnnee: number | null = null;
  anneeDisponibles: number[] = [];

  modalDesactivation = false;
  periodeSelectionnee: PeriodeBudgetaire | null = null;
  succes = '';

  ngOnInit(): void {
    this.chargerPeriodes();
  }

  chargerPeriodes(): void {
    this.periodeService.getPeriodesByUser(this.userId).subscribe({
      next: (data: PeriodeBudgetaire[]) => {
        this.periodes = data;
        this.extraireAnnees();
        this.appliquerFiltres();
      },
      error: (err) => console.error('Impossible de charger les périodes.', err)
    });
  }

  extraireAnnees(): void {
    const annees = this.periodes.map(p => new Date(p.dateDebut).getFullYear());
    this.anneeDisponibles = [...new Set(annees)].sort((a, b) => b - a);
  }

  appliquerFiltres(): void {
    this.periodesFiltrees = this.periodes.filter(p => {
      const statutOk = this.filtreStatut === 'tous' || p.statut === this.filtreStatut;
      const anneeOk  = this.filtreAnnee === null ||
                       new Date(p.dateDebut).getFullYear() === this.filtreAnnee;
      return statutOk && anneeOk;
    });
  }

  setFiltreStatut(statut: 'tous' | 'ACTIF' | 'DESACTIVE' | 'TERMINE' | 'SIMULATION'): void {
    this.filtreStatut = statut;
    this.appliquerFiltres();
  }

  setFiltreAnnee(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.filtreAnnee = value === 'toutes' ? null : Number(value);
    this.appliquerFiltres();
  }

  // ── Stats ───────────────────────────────────────────────────
  totalBudget(): number {
    return this.periodesFiltrees.reduce((sum, p) => sum + p.budgetTotal, 0);
  }

  nbParStatut(statut: string): number {
    return this.periodesFiltrees.filter(p => p.statut === statut).length;
  }

  // ── Désactivation ───────────────────────────────────────────
  ouvrirDesactivation(periode: PeriodeBudgetaire): void {
    this.periodeSelectionnee = periode;
    this.modalDesactivation  = true;
  }

  fermerModal(): void {
    this.modalDesactivation  = false;
    this.periodeSelectionnee = null;
  }

  confirmerDesactivation(): void {
    if (!this.periodeSelectionnee) return;

    const payload: PeriodeBudgetaire = {
      ...this.periodeSelectionnee,
      statut: 'DESACTIVE'
    };

    this.periodeService.updatePeriode(payload).subscribe({
      next: () => {
        this.fermerModal();
        this.chargerPeriodes();
        this.afficherSucces('Période désactivée avec succès.');
      },
      error: (err) => console.error('Erreur lors de la désactivation.', err)
    });
  }

  // ── Helpers ─────────────────────────────────────────────────
  calculerDuree(debut: string, fin: string): number {
    return Math.round(
      (new Date(fin).getTime() - new Date(debut).getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  labelStatut(statut: string): string {
    const map: Record<string, string> = {
      ACTIF:      'Actif',
      DESACTIVE:  'Désactivé',
      TERMINE:    'Terminé',
      SIMULATION: 'Simulation'
    };
    return map[statut] ?? statut;
  }

  afficherSucces(message: string): void {
    this.succes = message;
    setTimeout(() => this.succes = '', 3000);
  }
}