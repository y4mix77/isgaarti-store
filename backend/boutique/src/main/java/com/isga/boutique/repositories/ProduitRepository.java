package com.isga.boutique.repositories;

import com.isga.boutique.models.Produit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProduitRepository extends JpaRepository<Produit, Long> {
    // Crucial for the storefront: Load all products belonging to one category
    List<Produit> findByCategorieId(Long categorieId);
    long countByCategorieId(Long categorieId);
    
    // Allows clients to search for products by keyword
    List<Produit> findByNomContainingIgnoreCase(String keyword);

    long countByVendeurId(Long vendeurId);

    List<Produit> findByVendeurId(Long vendeurId);

    List<Produit> findByVendeurIsNull();
}
