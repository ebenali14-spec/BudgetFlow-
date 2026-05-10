import { Component, OnInit }          from '@angular/core';
import { CommonModule, DecimalPipe, NgClass } from '@angular/common';
import { FormsModule }                from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { PeriodeService }             from '../../services/periode.service';
import { PeriodeBudgetaire }          from '../../models/periode.model';

@Component({
  selector: 'app-periode-edit',
  imports: [CommonModule, DecimalPipe, NgClass, FormsModule, RouterLink],
  templateUrl: './periode-edit.html',
  styleUrl: './periode-edit.css',
})
export class PeriodeEdit implements OnInit {
 
  // ── État ──────────────────────────────────────────────────────
  loadingData = true;
  loading     = false;
  submitted   = false;
  erreur      = '';
 
  // Snapshot original (pour afficher "avant → après")
  periodeOriginale: PeriodeBudgetaire | null = null;
 
  // Formulaire de travail
  form: PeriodeBudgetaire = {
    id:            undefined,
    dateDebut:     '',
    dateFin:       '',
    budgetTotal:   0,
    statut:        'ACTIVE',
    estSimulation: false
  };
 
  constructor(
    private route:         ActivatedRoute,
    private router:        Router,
    private periodeService: PeriodeService
  ) {}
 
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.chargerPeriode(id);
  }
 
  // ── Chargement ────────────────────────────────────────────────
  chargerPeriode(id: number): void {
    this.periodeService.getPeriodeById(id).subscribe({
      next: (data) => {
        this.periodeOriginale = { ...data };
        this.form             = { ...data };
        this.loadingData      = false;
      },
      error: () => {
        this.erreur      = 'Impossible de charger la période.';
        this.loadingData = false;
      }
    });
  }
 
  // ── Durée calculée live ───────────────────────────────────────
  get dureeCalculee(): number {
    if (!this.form.dateDebut || !this.form.dateFin) return 0;
    const diff = new Date(this.form.dateFin).getTime() - new Date(this.form.dateDebut).getTime();
    return diff > 0 ? Math.round(diff / (1000 * 60 * 60 * 24)) : 0;
  }
 
  get dureeOriginale(): number {
    if (!this.periodeOriginale) return 0;
    const diff = new Date(this.periodeOriginale.dateFin).getTime()
               - new Date(this.periodeOriginale.dateDebut).getTime();
    return diff > 0 ? Math.round(diff / (1000 * 60 * 60 * 24)) : 0;
  }
 
  get dureeChangee(): boolean {
    return this.dureeCalculee > 0 && this.dureeCalculee !== this.dureeOriginale;
  }
 
  // ── Réinitialiser ─────────────────────────────────────────────
  reinitialiser(): void {
    if (this.periodeOriginale) {
      this.form      = { ...this.periodeOriginale };
      this.submitted = false;
      this.erreur    = '';
    }
  }
 
  // ── Validation ────────────────────────────────────────────────
  private valider(): boolean {
    if (!this.form.dateDebut || !this.form.dateFin) {
      this.erreur = 'Les dates sont obligatoires.';
      return false;
    }
    if (this.form.dateFin <= this.form.dateDebut) {
      this.erreur = 'La date de fin doit être après la date de début.';
      return false;
    }
    if (!this.form.budgetTotal || this.form.budgetTotal <= 0) {
      this.erreur = 'Le budget doit être positif.';
      return false;
    }
    return true;
  }
 
  // ── Sauvegarde ────────────────────────────────────────────────
  sauvegarder(): void {
    this.submitted = true;
    this.erreur    = '';
 
    if (!this.valider()) return;
 
    this.loading = true;
    this.periodeService.updatePeriode(this.form).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/periodes'], { queryParams: { updated: '1' } });
      },
      error: () => {
        this.loading = false;
        this.erreur  = 'Erreur lors de la sauvegarde. Réessayez.';
      }
    });
  }

}
