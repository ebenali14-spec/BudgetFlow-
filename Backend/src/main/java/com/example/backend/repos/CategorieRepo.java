package com.example.backend.repos;

import com.example.backend.entities.Categorie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategorieRepo extends JpaRepository<Categorie,String> {
    List<Categorie> findByEstParDefaut(boolean estParDefaut);
    //List<Categorie> getAll();
}
