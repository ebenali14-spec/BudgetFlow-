package com.example.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
public class PeriodeBudgetaire {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate dateDebut;

    @Column(nullable = false)
    private LocalDate dateFin;

    @Column(nullable = false)
    private double budgetTotal;

    @Column(nullable = false)
    private String statut;
    
    private boolean estSimulation;

    // Relation : un Utilisateur réalise 0..* PériodesBudgetaires
    @ManyToOne(optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    @JsonIgnore
    private Utilisateur utilisateur;

    // Relation : une PériodeBudgetaire contient 0..* LignesBudget
    @OneToMany(mappedBy = "periodeBudgetaire", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LigneBudget> lignesBudget = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDateDebut() {
        return dateDebut;
    }

    public void setDateDebut(LocalDate dateDebut) {
        this.dateDebut = dateDebut;
    }

    public LocalDate getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDate dateFin) {
        this.dateFin = dateFin;
    }

    public double getBudgetTotal() {
        return budgetTotal;
    }

    public void setBudgetTotal(double budgetTotal) {
        this.budgetTotal = budgetTotal;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public boolean isEstSimulation() {
        return estSimulation;
    }

    public void setEstSimulation(boolean estSimulation) {
        this.estSimulation = estSimulation;
    }

    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(Utilisateur utilisateur) {
        this.utilisateur = utilisateur;
    }

    public List<LigneBudget> getLignesBudget() {
        return lignesBudget;
    }

    public void setLignesBudget(List<LigneBudget> lignesBudget) {
        this.lignesBudget = lignesBudget;
    }
}
