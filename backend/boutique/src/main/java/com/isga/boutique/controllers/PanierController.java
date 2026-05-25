package com.isga.boutique.controllers;

import com.isga.boutique.models.Panier;
import com.isga.boutique.models.PanierItem;
import com.isga.boutique.models.Produit;
import com.isga.boutique.models.Promotion;
import com.isga.boutique.models.User;
import com.isga.boutique.repositories.PanierItemRepository;
import com.isga.boutique.repositories.PanierRepository;
import com.isga.boutique.repositories.ProduitRepository;
import com.isga.boutique.repositories.PromotionRepository;
import com.isga.boutique.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class PanierController {

    @Autowired
    private PanierRepository panierRepository;

    @Autowired
    private PanierItemRepository panierItemRepository;

    @Autowired
    private ProduitRepository produitRepository;

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> getCart(Principal principal) {
        Panier panier = getOrCreateCart(principal);
        return ResponseEntity.ok(mapCart(panier));
    }

    @PostMapping("/items")
    @Transactional
    public ResponseEntity<?> addItem(@RequestBody Map<String, Object> payload, Principal principal) {
        Long productId = readLong(payload.get("productId"));
        int quantity = Math.max(1, readInt(payload.getOrDefault("quantity", 1)));

        Produit produit = produitRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produit introuvable."));

        Panier panier = getOrCreateCart(principal);
        PanierItem item = panierItemRepository.findByPanierIdAndProduitId(panier.getId(), productId)
                .orElseGet(() -> {
                    PanierItem newItem = new PanierItem();
                    newItem.setPanier(panier);
                    newItem.setProduit(produit);
                    newItem.setQuantite(0);
                    panier.getItems().add(newItem);
                    return newItem;
                });

        item.setQuantite(item.getQuantite() + quantity);
        panierItemRepository.save(item);
        return ResponseEntity.ok(mapCart(panierRepository.findById(panier.getId()).orElse(panier)));
    }

    @PostMapping("/merge")
    @Transactional
    public ResponseEntity<?> mergeCart(@RequestBody List<Map<String, Object>> items, Principal principal) {
        Panier panier = getOrCreateCart(principal);

        for (Map<String, Object> payload : items) {
            Long productId = readLong(payload.get("productId"));
            int quantity = Math.max(1, readInt(payload.getOrDefault("quantity", 1)));

            Produit produit = produitRepository.findById(productId)
                    .orElse(null);
            if (produit == null) continue;

            PanierItem item = panierItemRepository.findByPanierIdAndProduitId(panier.getId(), productId)
                    .orElseGet(() -> {
                        PanierItem newItem = new PanierItem();
                        newItem.setPanier(panier);
                        newItem.setProduit(produit);
                        newItem.setQuantite(0);
                        panier.getItems().add(newItem);
                        return newItem;
                    });
            item.setQuantite(item.getQuantite() + quantity);
            panierItemRepository.save(item);
        }

        return ResponseEntity.ok(mapCart(panierRepository.findById(panier.getId()).orElse(panier)));
    }

    @PutMapping("/items/{productId}")
    @Transactional
    public ResponseEntity<?> updateQuantity(@PathVariable Long productId, @RequestBody Map<String, Object> payload, Principal principal) {
        Panier panier = getOrCreateCart(principal);
        int quantity = readInt(payload.getOrDefault("quantity", 1));

        panierItemRepository.findByPanierIdAndProduitId(panier.getId(), productId).ifPresent(item -> {
            if (quantity <= 0) {
                panier.getItems().remove(item);
                panierItemRepository.delete(item);
            } else {
                item.setQuantite(quantity);
                panierItemRepository.save(item);
            }
        });

        return ResponseEntity.ok(mapCart(panierRepository.findById(panier.getId()).orElse(panier)));
    }

    @DeleteMapping("/items/{productId}")
    @Transactional
    public ResponseEntity<?> removeItem(@PathVariable Long productId, Principal principal) {
        Panier panier = getOrCreateCart(principal);
        panierItemRepository.findByPanierIdAndProduitId(panier.getId(), productId).ifPresent(item -> {
            panier.getItems().remove(item);
            panierItemRepository.delete(item);
        });
        return ResponseEntity.ok(mapCart(panierRepository.findById(panier.getId()).orElse(panier)));
    }

    @DeleteMapping
    @Transactional
    public ResponseEntity<?> clearCart(Principal principal) {
        Panier panier = getOrCreateCart(principal);
        panier.getItems().clear();
        panierRepository.save(panier);
        return ResponseEntity.ok(mapCart(panier));
    }

    @PostMapping("/promo/apply")
    @Transactional
    public ResponseEntity<?> applyPromo(@RequestBody Map<String, Object> payload, Principal principal) {
        String code = String.valueOf(payload.getOrDefault("code", "")).trim();
        if (code.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "applied", false,
                    "message", "Entrez un code promotionnel."
            ));
        }

        Panier panier = getOrCreateCart(principal);
        List<Promotion> promotions = promotionsByCode(code).stream()
                .filter(this::isPromotionUsable)
                .toList();

        if (promotions.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "applied", false,
                    "message", "Code promo introuvable ou expiré."
            ));
        }

        List<PanierItem> matchedItems = panier.getItems().stream()
                .filter(item -> promotions.stream().anyMatch(promotion -> promotionMatchesItem(promotion, item)))
                .toList();

        if (matchedItems.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "applied", false,
                    "message", "Code promo non applicable aux produits du panier."
            ));
        }

        Promotion bestPromotion = promotions.stream()
                .filter(promotion -> matchedItems.stream().anyMatch(item -> promotionMatchesItem(promotion, item)))
                .sorted((a, b) -> b.getPourcentageRemise().compareTo(a.getPourcentageRemise()))
                .findFirst()
                .orElse(promotions.get(0));

        return ResponseEntity.ok(Map.of(
                "applied", true,
                "code", effectiveCode(bestPromotion),
                "percentage", bestPromotion.getPourcentageRemise(),
                "productIds", matchedItems.stream().map(item -> item.getProduit().getId()).toList(),
                "matchedCount", matchedItems.stream().mapToInt(PanierItem::getQuantite).sum(),
                "message", "Code promo appliqué."
        ));
    }

    private Panier getOrCreateCart(Principal principal) {
        User client = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable."));

        return panierRepository.findByClientId(client.getId()).orElseGet(() -> {
            Panier panier = new Panier();
            panier.setClient(client);
            return panierRepository.save(panier);
        });
    }

    private List<Map<String, Object>> mapCart(Panier panier) {
        return panier.getItems().stream()
                .map(this::mapItem)
                .toList();
    }

    private Map<String, Object> mapItem(PanierItem item) {
        Produit produit = item.getProduit();
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", produit.getId());
        dto.put("nom", produit.getNom());
        dto.put("prix", produit.getPrix());
        dto.put("stock", produit.getStock());
        dto.put("description", produit.getDescription());
        dto.put("image", produit.getImage());
        dto.put("images", produit.getImages());
        dto.put("quantity", item.getQuantite());

        currentPromotion(produit.getId()).ifPresent(promotion -> {
            dto.put("promo", promotion.getPourcentageRemise());
            dto.put("promoEnd", promotion.getDateFin() != null ? promotion.getDateFin().toString() : null);
            dto.put("promoActive", promotion.isActive());
            dto.put("promoId", promotion.getId());
            dto.put("promoName", promotion.getNom());
            dto.put("promoCode", effectiveCode(promotion));
        });

        if (produit.getCategorie() != null) {
            Map<String, Object> categorie = new LinkedHashMap<>();
            categorie.put("id", produit.getCategorie().getId());
            categorie.put("nom", produit.getCategorie().getNom());
            dto.put("categorie", categorie);
        }

        if (produit.getVendeur() != null) {
            Map<String, Object> vendeur = new LinkedHashMap<>();
            vendeur.put("id", produit.getVendeur().getId());
            vendeur.put("nom", produit.getVendeur().getNom());
            dto.put("vendeur", vendeur);
        }

        return dto;
    }

    private java.util.Optional<Promotion> currentPromotion(Long productId) {
        LocalDate today = LocalDate.now();
        Produit produit = produitRepository.findById(productId).orElse(null);
        if (produit == null) return java.util.Optional.empty();

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
                .findFirst();
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

    private List<Promotion> promotionsByCode(String code) {
        String normalizedCode = code.trim().toUpperCase();
        List<Promotion> byCode = promotionRepository.findByCodeIgnoreCase(normalizedCode);
        if (!byCode.isEmpty()) return byCode;

        return promotionRepository.findAll().stream()
                .filter(promotion -> effectiveCode(promotion).equalsIgnoreCase(normalizedCode))
                .toList();
    }

    private boolean isPromotionUsable(Promotion promotion) {
        LocalDate today = LocalDate.now();
        return promotion.isActive()
                && (promotion.getDateDebut() == null || !promotion.getDateDebut().isAfter(today))
                && (promotion.getDateFin() == null || !promotion.getDateFin().isBefore(today));
    }

    private boolean promotionMatchesItem(Promotion promotion, PanierItem item) {
        Produit produit = item.getProduit();
        if (promotion.isGlobal()) return true;
        if (promotion.getProduitConcerne() != null && promotion.getProduitConcerne().getId().equals(produit.getId())) {
            return true;
        }
        return promotion.getCategorieConcernee() != null
                && produit.getCategorie() != null
                && promotion.getCategorieConcernee().getId().equals(produit.getCategorie().getId());
    }

    private String effectiveCode(Promotion promotion) {
        if (promotion.getCode() != null && !promotion.getCode().isBlank()) {
            return promotion.getCode().trim().toUpperCase();
        }
        return promotion.getNom() != null ? promotion.getNom().trim().toUpperCase() : "";
    }

    private Long readLong(Object value) {
        if (value instanceof Number number) return number.longValue();
        return Long.parseLong(String.valueOf(value));
    }

    private int readInt(Object value) {
        if (value instanceof Number number) return number.intValue();
        return Integer.parseInt(String.valueOf(value));
    }
}
