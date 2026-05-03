package com.example.backend.services;

import com.example.backend.dtos.CategorieDTO;
import com.example.backend.entities.Categorie;

import java.util.List;

public interface ICategorieService {
    Categorie addCategorie(CategorieDTO dto);

}
