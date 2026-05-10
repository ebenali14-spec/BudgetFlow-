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
export class PeriodesList implements OnInit{



  // ── Injection moderne Angular 20 ────────────────────────────

  private readonly periodeService = inject(PeriodeService);



  // ── Données ─────────────────────────────────────────────────

  userId = 1;



  periodes: PeriodeBudgetaire[] = [];

  periodesFiltrees: PeriodeBudgetaire[] = [];



  filtreType: 'toutes' | 'reelles' | 'simulations' = 'toutes';

  filtreAnnee: number | null = null;



  anneeDisponibles: number[] = [];



  modalDesactivation = false;

  periodeSelectionnee: PeriodeBudgetaire | null = null;



  succes = '';



  // ── Lifecycle ───────────────────────────────────────────────

  ngOnInit(): void {

    this.chargerPeriodes();

  }



  // ── Chargement ──────────────────────────────────────────────

  chargerPeriodes(): void {

    this.periodeService.getPeriodesByUser(this.userId).subscribe({

      next: (data: PeriodeBudgetaire[]) => {

        this.periodes = data;

        this.extraireAnnees();

        this.appliquerFiltres();

      },

      error: (err) => {

        console.error('Impossible de charger les périodes.', err);

      }

    });

  }



  extraireAnnees(): void {

    const annees = this.periodes.map(

      p => new Date(p.dateDebut).getFullYear()

    );



    this.anneeDisponibles = [...new Set(annees)]

      .sort((a, b) => b - a);

  }



  // ── Filtres ─────────────────────────────────────────────────

  appliquerFiltres(): void {



    this.periodesFiltrees = this.periodes.filter(p => {



      const typeOk =

        this.filtreType === 'toutes' ||

        (this.filtreType === 'reelles' && !p.estSimulation) ||

        (this.filtreType === 'simulations' && p.estSimulation);



      const annee = new Date(p.dateDebut).getFullYear();



      const anneeOk =

        this.filtreAnnee === null ||

        annee === this.filtreAnnee;



      return typeOk && anneeOk;

    });

  }



  setFiltreType(

    type: 'toutes' | 'reelles' | 'simulations'

  ): void {



    this.filtreType = type;

    this.appliquerFiltres();

  }



  setFiltreAnnee(event: Event): void {



    const value = (event.target as HTMLSelectElement).value;



    this.filtreAnnee =

      value === 'toutes'

        ? null

        : Number(value);



    this.appliquerFiltres();

  }



  // ── Stats ───────────────────────────────────────────────────

  totalBudget(): number {



    return this.periodesFiltrees.reduce(

      (sum, p) => sum + p.budgetTotal,

      0

    );

  }



  nbSimulations(): number {



    return this.periodesFiltrees.filter(

      p => p.estSimulation

    ).length;

  }



  // ── Désactivation ───────────────────────────────────────────

  ouvrirDesactivation(

    periode: PeriodeBudgetaire

  ): void {



    this.periodeSelectionnee = periode;

    this.modalDesactivation = true;

  }



  fermerModal(): void {



    this.modalDesactivation = false;

    this.periodeSelectionnee = null;

  }



  confirmerDesactivation(): void {



    if (!this.periodeSelectionnee) {

      return;

    }



    const payload: PeriodeBudgetaire = {

      ...this.periodeSelectionnee,

      statut: 'TERMINEE'

    };



    this.periodeService.updatePeriode(payload).subscribe({

      next: () => {



        this.fermerModal();

        this.chargerPeriodes();



        this.afficherSucces(

          'Période désactivée.'

        );

      },



      error: (err) => {

        console.error(

          'Erreur lors de la désactivation.',

          err

        );

      }

    });

  }



  // ── Helpers ─────────────────────────────────────────────────

  calculerDuree(

    debut: string,

    fin: string

  ): number {



    return Math.round(

      (

        new Date(fin).getTime() -

        new Date(debut).getTime()

      ) / (1000 * 60 * 60 * 24)

    );

  }



  afficherSucces(message: string): void {



    this.succes = message;



    setTimeout(() => {

      this.succes = '';

    }, 3000);

  }

}