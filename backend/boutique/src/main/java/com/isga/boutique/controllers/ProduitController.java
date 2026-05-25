package com.isga.boutique.controllers;

import com.isga.boutique.models.Produit;
import com.isga.boutique.models.Promotion;
import com.isga.boutique.repositories.ProduitRepository;
import com.isga.boutique.repositories.PromotionRepository;
import com.isga.boutique.repositories.CategorieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/produits")
public class ProduitController {

    @Autowired
    private ProduitRepository produitRepository;

    @Autowired
    private CategorieRepository categorieRepository;

    @Autowired
    private PromotionRepository promotionRepository;

    @GetMapping
    public ResponseEntity<?> getAllProduits() {
        List<Produit> produits = produitRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        
        LocalDate today = LocalDate.now();
        
        for (Produit p : produits) {
            List<Promotion> validPromos = activePromotionsForProduct(p, today);
            
            if (validPromos.isEmpty()) {
                result.add(mapProductToDto(p, null));
            } else {
                result.add(mapProductToDto(p, validPromos.get(0)));
            }
        }
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProduitById(@PathVariable Long id) {
        Optional<Produit> produit = produitRepository.findById(id);
        if (produit.isEmpty()) return ResponseEntity.notFound().build();

        LocalDate today = LocalDate.now();
        List<Promotion> validPromos = activePromotionsForProduct(produit.get(), today);

        return ResponseEntity.ok(mapProductToDto(produit.get(), validPromos.isEmpty() ? null : validPromos.get(0)));
    }

    private List<Promotion> activePromotionsForProduct(Produit produit, LocalDate today) {
        return promotionRepository.findAll().stream()
                .filter(Promotion::isActive)
                .filter(promotion -> promotion.getDateDebut() == null || !promotion.getDateDebut().isAfter(today))
                .filter(promotion -> promotion.getDateFin() == null || !promotion.getDateFin().isBefore(today))
                .filter(promotion -> promotionMatchesProduct(promotion, produit))
                .sorted((a, b) -> {
                    int discountCompare = b.getPourcentageRemise().compareTo(a.getPourcentageRemise());
                    if (discountCompare != 0) return discountCompare;
                    return b.getId().compareTo(a.getId());
                })
                .collect(Collectors.toList());
    }

    private boolean promotionMatchesProduct(Promotion promotion, Produit produit) {
        if (promotion.isGlobal()) return true;
        if (promotion.getProduitConcerne() != null && promotion.getProduitConcerne().getId().equals(produit.getId())) {
            return true;
        }
        return promotion.getCategorieConcernee() != null
                && produit.getCategorie() != null
                && promotion.getCategorieConcernee().getId().equals(produit.getCategorie().getId());
    }

    private Map<String, Object> mapProductToDto(Produit p, Promotion pr) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", p.getId());
        dto.put("nom", p.getNom());
        dto.put("prix", p.getPrix());
        dto.put("stock", p.getStock());
        dto.put("description", p.getDescription());
        dto.put("image", p.getImage());
        dto.put("images", p.getImages());
        
        if (p.getCategorie() != null) {
            Map<String, Object> cat = new LinkedHashMap<>();
            cat.put("id", p.getCategorie().getId());
            cat.put("nom", p.getCategorie().getNom());
            dto.put("categorie", cat);
        }

        if (p.getVendeur() != null) {
            Map<String, Object> vend = new LinkedHashMap<>();
            vend.put("id", p.getVendeur().getId());
            vend.put("nom", p.getVendeur().getNom());
            vend.put("productCount", produitRepository.countByVendeurId(p.getVendeur().getId()));
            dto.put("vendeur", vend);
        }

        if (pr != null) {
            dto.put("promo", pr.getPourcentageRemise());
            dto.put("promoEnd", pr.getDateFin() != null ? pr.getDateFin().toString() : null);
            dto.put("promoActive", pr.isActive());
            dto.put("promoId", pr.getId());
            dto.put("promoName", pr.getNom());
            dto.put("promoCode", pr.getCode() != null && !pr.getCode().isBlank() ? pr.getCode() : pr.getNom());
        }
        
        return dto;
    }

    @PostMapping
    public ResponseEntity<?> createProduit(@RequestBody Produit produitData) {
        if (produitData.getCategorie() == null || produitData.getCategorie().getId() == null) {
            return ResponseEntity.badRequest().body("Categorie ID is required.");
        }
        var categorie = categorieRepository.findById(produitData.getCategorie().getId());
        if (categorie.isEmpty()) {
            return ResponseEntity.badRequest().body("Categorie not found.");
        }
        produitData.setCategorie(categorie.get());
        Produit savedProduit = produitRepository.save(produitData);
        return ResponseEntity.ok(savedProduit);
    }
}
