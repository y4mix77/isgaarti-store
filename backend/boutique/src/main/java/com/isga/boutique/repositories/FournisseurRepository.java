package com.isga.boutique.repositories;

import com.isga.boutique.models.Fournisseur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FournisseurRepository extends JpaRepository<Fournisseur, Long> {
    // Ensures we don't create duplicate suppliers with the same email
    Optional<Fournisseur> findByEmail(String email);
}