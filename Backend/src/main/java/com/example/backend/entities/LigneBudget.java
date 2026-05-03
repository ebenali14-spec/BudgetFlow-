package com.example.backend.entities;

import jakarta.persistence.*;
import jakarta.persistence.Entity;

@Entity
public class LigneBudget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private double pourcentage;

    @Column(nullable = false)
    private double montantAlloue;

    // Relation : une LigneBudget appartient à 1 PériodeBudgetaire
    @ManyToOne(optional = false)
    @JoinColumn(name = "periode_budgetaire_id", nullable = false)
    private PeriodeBudgetaire periodeBudgetaire;

    // Relation : une LigneBudget est associée à 1..* Catégories
    @ManyToOne(optional = false)
    @JoinColumn(name = "categorie_id", nullable = false)
    private Categorie categorie;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public double getPourcentage() {
        return pourcentage;
    }

    public void setPourcentage(double pourcentage) {
        this.pourcentage = pourcentage;
    }

    public double getMontantAlloue() {
        return montantAlloue;
    }

    public void setMontantAlloue(double montantAlloue) {
        this.montantAlloue = montantAlloue;
    }

    public PeriodeBudgetaire getPeriodeBudgetaire() {
        return periodeBudgetaire;
    }

    public void setPeriodeBudgetaire(PeriodeBudgetaire periodeBudgetaire) {
        this.periodeBudgetaire = periodeBudgetaire;
    }

    public Categorie getCategorie() {
        return categorie;
    }

    public void setCategorie(Categorie categorie) {
        this.categorie = categorie;
    }
}
