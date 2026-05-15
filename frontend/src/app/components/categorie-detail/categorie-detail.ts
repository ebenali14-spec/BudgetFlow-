import { Component, OnInit } from '@angular/core';
import { Depense, LigneBudget, PeriodeBudgetaire } from '../../models/periode.model';
import { PeriodeService } from '../../services/periode.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-categorie-detail',
  imports: [CommonModule, DecimalPipe, FormsModule],
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
  nouvelleDepense = { description: '', montant: null as number | null };
  ajoutEnCours    = false;
  erreurForm      = '';
  warnForm        = '';   // warning seuil journalier (non bloquant)

  // Édition inline
  depenseEnEdit:   Depense | null = null;
  editDescription  = '';
  editMontant:     number | null  = null;
  erreurEdit       = '';
  warnEdit         = '';  // warning seuil journalier (non bloquant)

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
      this.nouvelleDepense = { description: '', montant: null };

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

      const filtered = deps
        .filter(d => d.categorieId === this.categorieId);

      this.depenses = filtered.map(d => ({
        ...d,
        editable: this.estEditable(d)
      }));

      console.log('DEPENSES FINAL:', this.depenses);

      this.loadingData = false;
    },
    error: () => {
      this.erreur = 'Impossible de charger les dépenses.';
      this.loadingData = false;
    }
  });
}
  // ── Helpers ───────────────────────────────────────────────────
get todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
}
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

estEditable(dep: Depense): boolean {
  console.log('today:', new Date());
  console.log('dep.date:', dep.date);

  const depDate = new Date(dep.date);

  const depDay = depDate.getFullYear() + '-' +
    String(depDate.getMonth() + 1).padStart(2, '0') + '-' +
    String(depDate.getDate()).padStart(2, '0');

  const today = new Date();
  const todayStr = today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0');

  const result = depDay === todayStr;

  console.log('editable:', result);

  return result;
}
  // ── Warnings seuil (appelés à chaque input change) ────────────
  onMontantAjoutChange(): void {
    this.warnForm = '';
    const m = this.nouvelleDepense.montant;
    if (m && m > 0 && m > this.seuilJournalier) {
      this.warnForm = `Ce montant dépasse votre seuil journalier de ${this.seuilJournalier.toFixed(2)} DT.`;
    }
  }

  onMontantEditChange(): void {
    this.warnEdit = '';
    const restantAvecEdit = this.montantRestant + (this.depenseEnEdit?.montant ?? 0);
    const m = this.editMontant;
    if (m && m > 0 && m > this.seuilJournalier) {
      this.warnEdit = `Ce montant dépasse votre seuil journalier de ${this.seuilJournalier.toFixed(2)} DT.`;
    }
    // Réinitialiser l'erreur si le montant redevient valide
    if (m && m <= restantAvecEdit) this.erreurEdit = '';
  }

  // ── Ajouter ───────────────────────────────────────────────────
  ajouterDepense(): void {
    this.erreurForm = '';
    const m = this.nouvelleDepense.montant;

    if (!this.nouvelleDepense.description.trim()) {
      this.erreurForm = 'La description est requise.'; return;
    }
    if (!m || m <= 0) {
      this.erreurForm = 'Le montant doit être positif.'; return;
    }
    if (m > this.montantRestant) {
      this.erreurForm = `Dépassement — il vous reste ${this.montantRestant.toFixed(2)} DT dans cette catégorie.`; return;
    }

    this.ajoutEnCours = true;
    const dep: Depense = {
      description: this.nouvelleDepense.description.trim(),
      montant:     m,
      date:        this.todayStr,
      estImprevue: false,
      periodeId:   this.periodeId,
      categorieId: this.categorieId,
    };

    this.periodeService.addDepense(dep).subscribe({
      next: d => {
        this.depenses.unshift(d);
        this.nouvelleDepense = { description: '', montant: null };
        this.warnForm        = '';
        this.ajoutEnCours    = false;
        this.afficherSucces('Dépense enregistrée.');
      },
      error: () => { this.erreurForm = 'Erreur lors de l\'enregistrement.'; this.ajoutEnCours = false; }
    });
  }

  // ── Édition inline ────────────────────────────────────────────
  ouvrirEdit(dep: Depense): void {
    console.log('EDIT CLICKED', dep.id);
    if (!this.estEditable(dep)) return;
    this.depenseEnEdit   = dep;
    this.editDescription = dep.description;
    this.editMontant     = dep.montant;
    this.erreurEdit      = '';
    this.warnEdit        = '';
  }

  annulerEdit(): void {
    this.depenseEnEdit = null;
    this.erreurEdit    = '';
    this.warnEdit      = '';
  }

sauvegarderEdit(): void {
  this.erreurEdit = '';
  this.warnEdit = '';

  if (!this.depenseEnEdit) return;

  const desc = this.editDescription?.trim();
  const montant = this.editMontant;

  if (!desc) {
    this.erreurEdit = 'La description est requise.';
    return;
  }

  if (montant == null || montant <= 0) {
    this.erreurEdit = 'Le montant doit être supérieur à 0.';
    return;
  }

  // budget total dispo (en tenant compte ancien montant)
  const restantAvecEdit =
    this.montantRestant + this.depenseEnEdit.montant;

  // ❌ dépasse budget total
  if (montant > restantAvecEdit) {
    this.erreurEdit =
      `Dépassement du budget disponible (${restantAvecEdit.toFixed(2)} DT).`;
    return;
  }

  // ⚠️ dépasse seuil journalier
  if (montant > this.seuilJournalier) {
    this.warnEdit =
      `Attention : ce montant dépasse le seuil journalier (${this.seuilJournalier.toFixed(2)} DT).`;
  }

  const updated: Depense = {
    ...this.depenseEnEdit,
    description: desc,
    montant: montant
  };

  this.periodeService.updateDepense(updated).subscribe({
    next: d => {
      const idx = this.depenses.findIndex(x => x.id === d.id);
      if (idx !== -1) this.depenses[idx] = {
        ...d,
        editable: this.estEditable(d)
      };

      this.depenseEnEdit = null;
      this.erreurEdit = '';
      this.warnEdit = '';
      this.afficherSucces('Dépense modifiée.');
    },
    error: () => {
      this.erreurEdit = 'Erreur lors de la modification.';
    }
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