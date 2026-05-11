package com.example.backend.services;

import com.example.backend.dtos.CategorieDTO;
import com.example.backend.entities.Categorie;
import com.example.backend.repos.CategorieRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategorieService  implements  ICategorieService{
    @Autowired
    CategorieRepo categorieRepo;
    @Override
    public Categorie addCategorie(CategorieDTO dto) {
        return null;
    }

    @Override
    public List<Categorie> getAll() {
        return categorieRepo.findAll();
    }
}
