package com.example.backend.controllers;

import com.example.backend.entities.Utilisateur;
import com.example.backend.services.IUtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/utilisateurs")
@CrossOrigin("*")
public class UtilisateurController {

    @Autowired
    IUtilisateurService utilisateurService;

    @PostMapping("/create")
    public ResponseEntity<Utilisateur> createUtilisateur(@RequestBody Utilisateur u) {
        return ResponseEntity.ok(utilisateurService.createUtilisateur(u));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Utilisateur>> getAllUtilisateurs() {
        return ResponseEntity.ok(utilisateurService.getAllUtilisateurs());
    }
}
