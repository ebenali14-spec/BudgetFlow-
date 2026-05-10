package com.example.backend.services;

import com.example.backend.entities.Utilisateur;
import com.example.backend.repos.UtilisateurRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UtilisateurService implements IUtilisateurService {

    @Autowired
    UtilisateurRepo utilisateurRepo;

    @Override
    public Utilisateur createUtilisateur(Utilisateur u) {
        return utilisateurRepo.save(u);
    }

    @Override
    public List<Utilisateur> getAllUtilisateurs() {
        return utilisateurRepo.findAll();
    }
}
