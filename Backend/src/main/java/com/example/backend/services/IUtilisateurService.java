package com.example.backend.services;

import com.example.backend.entities.Utilisateur;
import java.util.List;

public interface IUtilisateurService {
    Utilisateur createUtilisateur(Utilisateur u);
    List<Utilisateur> getAllUtilisateurs();
}
