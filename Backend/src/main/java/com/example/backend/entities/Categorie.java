package com.example.backend.entities;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
@Entity
public class Categorie {

    @Id
    @Column(nullable = false, length = 100)
    private String id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private boolean estParDefaut;

    // Relation : une Categorie apparaît dans 0..* LignesBudget
    @OneToMany(mappedBy = "categorie", cascade = CascadeType.ALL)
    private List<LigneBudget> lignesBudget = new ArrayList<>();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }


    public boolean isEstParDefaut() {
        return estParDefaut;
    }

    public void setEstParDefaut(boolean estParDefaut) {
        this.estParDefaut = estParDefaut;
    }

    public List<LigneBudget> getLignesBudget() {
        return lignesBudget;
    }

    public void setLignesBudget(List<LigneBudget> lignesBudget) {
        this.lignesBudget = lignesBudget;
    }
}
