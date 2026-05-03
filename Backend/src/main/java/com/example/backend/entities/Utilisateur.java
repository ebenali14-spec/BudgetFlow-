package com.example.backend.entities;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
@Entity

public class Utilisateur extends  Personne{

    @Column(nullable = false)
    private String typeProfile;

    @Column(nullable = false)
    private LocalDate dateInscription;

    @OneToMany(mappedBy = "utilisateur", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PeriodeBudgetaire> periodesBudgetaires = new ArrayList<>();

    public String getTypeProfile() {
        return typeProfile;
    }

    public void setTypeProfile(String typeProfile) {
        this.typeProfile = typeProfile;
    }

    public LocalDate getDateInscription() {
        return dateInscription;
    }

    public void setDateInscription(LocalDate dateInscription) {
        this.dateInscription = dateInscription;
    }

    public List<PeriodeBudgetaire> getPeriodesBudgetaires() {
        return periodesBudgetaires;
    }

    public void setPeriodesBudgetaires(List<PeriodeBudgetaire> periodesBudgetaires) {
        this.periodesBudgetaires = periodesBudgetaires;
    }
}
