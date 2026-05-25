package com.isga.boutique.repositories;

import com.isga.boutique.models.Categorie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategorieRepository extends JpaRepository<Categorie, Long> {
    // Allows Angular to search for a category by its exact name
    Optional<Categorie> findByNom(String nom);
}