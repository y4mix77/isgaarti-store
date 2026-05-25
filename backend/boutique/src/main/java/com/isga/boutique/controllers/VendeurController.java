package com.isga.boutique.controllers;

import com.isga.boutique.models.Fournisseur;
import com.isga.boutique.models.Commande;
import com.isga.boutique.models.LigneCommande;
import com.isga.boutique.models.Produit;
import com.isga.boutique.models.Promotion;
import com.isga.boutique.models.User;
import com.isga.boutique.models.VendeurOperation;
import com.isga.boutique.repositories.CommandeRepository;
import com.isga.boutique.repositories.FournisseurRepository;
import com.isga.boutique.repositories.ProduitRepository;
import com.isga.boutique.repositories.PromotionRepository;
import com.isga.boutique.repositories.CategorieRepository;
import com.isga.boutique.repositories.VendeurOperationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vendeur")
public class VendeurController {

    @Autowired
    private ProduitRepository produitRepository;

    @Autowired
    private FournisseurRepository fournisseurRepository;

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private CategorieRepository categorieRepository;

    @Autowired
    private CommandeRepository commandeRepository;

    @Autowired
    private VendeurOperationRepository vendeurOperationRepository;

    @Autowired
    private com.isga.boutique.repositories.UserRepository userRepository;

    @Value("${imagekit.private.key:}")
    private String imageKitPrivateKey;

    // --- PRODUITS ---

    @GetMapping("/produits")
    @PreAuthorize("hasRole('VENDEUR')")
    public ResponseEntity<?> getMesProduits(java.security.Principal principal) {
        Optional<User> vendeur = currentVendor(principal);
        if (vendeur.isEmpty()) return ResponseEntity.status(403).body(Map.of("error", "Vendeur introuvable"));

        List<Produit> produits = getVisibleVendorProducts(vendeur.get());
        
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        
        for (Produit p : produits) {
            List<Promotion> validPromos = vendorOwnedPromotionsForProduct(p);
            
            if (validPromos.isEmpty()) {
                result.add(mapProductToDto(p, null));
            } else {
                for (Promotion pr : validPromos) {
                    result.add(mapProductToDto(p, pr));
                }
            }
        }
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('VENDEUR')")
    public ResponseEntity<?> getDashboard(java.security.Principal principal) {
        Optional<User> vendeur = currentVendor(principal);
        if (vendeur.isEmpty()) return ResponseEntity.status(403).body(Map.of("error", "Vendeur introuvable"));

        Long vendeurId = vendeur.get().getId();
        List<Produit> products = getVisibleVendorProducts(vendeur.get());
        Set<Long> productIds = products.stream().map(Produit::getId).collect(Collectors.toSet());

        List<Promotion> promotions = products.stream()
                .flatMap(product -> vendorPromotionsForProduct(product).stream())
                .distinct()
                .sorted((a, b) -> safeDate(b.getUpdatedAt(), b.getCreatedAt()).compareTo(safeDate(a.getUpdatedAt(), a.getCreatedAt())))
                .collect(Collectors.toList());

        List<Map<String, Object>> orderLines = commandeRepository.findAll().stream()
                .filter(order -> "PAID".equalsIgnoreCase(order.getPaymentStatus()) || "PAYEE".equalsIgnoreCase(order.getStatut()))
                .flatMap(order -> order.getLignes().stream()
                        .filter(line -> line.getProduit() != null && productIds.contains(line.getProduit().getId()))
                        .map(line -> mapOrderLine(order, line)))
                .sorted((a, b) -> ((LocalDateTime) b.get("_sortDate")).compareTo((LocalDateTime) a.get("_sortDate")))
                .peek(item -> item.remove("_sortDate"))
                .collect(Collectors.toList());

        BigDecimal inventoryValue = products.stream()
                .map(product -> product.getPrix().multiply(BigDecimal.valueOf(product.getStock() == null ? 0 : product.getStock())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal shippedValue = orderLines.stream()
                .map(item -> new BigDecimal(item.get("value").toString()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Map<String, Object>> activity = buildVendorActivity(vendeurId, products, promotions, orderLines);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("vendor", Map.of("id", vendeurId, "nom", vendeur.get().getNom(), "email", vendeur.get().getEmail()));
        response.put("kpis", Map.of(
                "revenue", shippedValue,
                "shipments", orderLines.size(),
                "products", products.size(),
                "stock", products.stream().mapToInt(p -> p.getStock() == null ? 0 : p.getStock()).sum(),
                "inventoryValue", inventoryValue,
                "activePromotions", promotions.stream().filter(Promotion::isActive).count()
        ));
        response.put("products", products.stream().map(this::mapDashboardProduct).collect(Collectors.toList()));
        response.put("promotions", promotions.stream().map(this::mapDashboardPromotion).collect(Collectors.toList()));
        response.put("shipments", orderLines);
        response.put("activity", activity);
        response.put("revenueSeries", buildRevenueSeries(orderLines));

        return ResponseEntity.ok(response);
    }

    private List<Promotion> activePromotionsForProduct(Produit product) {
        LocalDate today = LocalDate.now();
        return promotionRepository.findAll().stream()
                .filter(Promotion::isActive)
                .filter(promotion -> promotion.getDateDebut() == null || !promotion.getDateDebut().isAfter(today))
                .filter(promotion -> promotion.getDateFin() == null || !promotion.getDateFin().isBefore(today))
                .filter(promotion -> promotionMatchesProduct(promotion, product))
                .sorted((a, b) -> {
                    int discountCompare = b.getPourcentageRemise().compareTo(a.getPourcentageRemise());
                    if (discountCompare != 0) return discountCompare;
                    return b.getId().compareTo(a.getId());
                })
                .collect(Collectors.toList());
    }

    private List<Promotion> vendorPromotionsForProduct(Produit product) {
        LocalDate today = LocalDate.now();
        return promotionRepository.findAll().stream()
                .filter(promotion -> promotion.getDateFin() == null || !promotion.getDateFin().isBefore(today))
                .filter(promotion -> promotionMatchesProduct(promotion, product))
                .sorted((a, b) -> {
                    int activeCompare = Boolean.compare(b.isActive(), a.isActive());
                    if (activeCompare != 0) return activeCompare;
                    int discountCompare = b.getPourcentageRemise().compareTo(a.getPourcentageRemise());
                    if (discountCompare != 0) return discountCompare;
                    return b.getId().compareTo(a.getId());
                })
                .collect(Collectors.toList());
    }

    private List<Promotion> vendorOwnedPromotionsForProduct(Produit product) {
        LocalDate today = LocalDate.now();
        return promotionRepository.findByProduitConcerneId(product.getId()).stream()
                .filter(promotion -> promotion.getDateFin() == null || !promotion.getDateFin().isBefore(today))
                .sorted((a, b) -> {
                    int activeCompare = Boolean.compare(b.isActive(), a.isActive());
                    if (activeCompare != 0) return activeCompare;
                    return b.getId().compareTo(a.getId());
                })
                .collect(Collectors.toList());
    }

    private boolean promotionMatchesProduct(Promotion promotion, Produit product) {
        if (promotion.isGlobal()) return true;
        if (promotion.getProduitConcerne() != null && promotion.getProduitConcerne().getId().equals(product.getId())) {
            return true;
        }
        return promotion.getCategorieConcernee() != null
                && product.getCategorie() != null
                && promotion.getCategorieConcernee().getId().equals(product.getCategorie().getId());
    }

    @GetMapping("/commandes")
    @PreAuthorize("hasRole('VENDEUR')")
    public ResponseEntity<?> getVendorOrders(java.security.Principal principal) {
        Optional<User> vendeur = currentVendor(principal);
        if (vendeur.isEmpty()) return ResponseEntity.status(403).body(Map.of("error", "Vendeur introuvable"));

        Set<Long> productIds = getVisibleVendorProducts(vendeur.get()).stream()
                .map(Produit::getId)
                .collect(Collectors.toSet());

        List<Map<String, Object>> orderLines = commandeRepository.findAll().stream()
                .flatMap(order -> order.getLignes().stream()
                        .filter(line -> line.getProduit() != null && productIds.contains(line.getProduit().getId()))
                        .map(line -> mapOrderLine(order, line)))
                .sorted((a, b) -> ((LocalDateTime) b.get("_sortDate")).compareTo((LocalDateTime) a.get("_sortDate")))
                .peek(item -> item.remove("_sortDate"))
                .collect(Collectors.toList());

        return ResponseEntity.ok(orderLines);
    }

    @PatchMapping("/commandes/lignes/{lineId}/status")
    @PreAuthorize("hasRole('VENDEUR')")
    public ResponseEntity<?> updateOrderLineStatus(@PathVariable Long lineId, @RequestBody Map<String, Object> payload, java.security.Principal principal) {
        Optional<User> vendeur = currentVendor(principal);
        if (vendeur.isEmpty()) return ResponseEntity.status(403).body(Map.of("error", "Vendeur introuvable"));

        String status = String.valueOf(payload.getOrDefault("status", "")).trim().toUpperCase();
        Set<String> allowed = Set.of("PREPARATION", "EMBALLEE", "EXPEDITION", "LIVREE", "ANNULEE");
        if (!allowed.contains(status)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Statut logistique invalide"));
        }

        for (Commande order : commandeRepository.findAll()) {
            for (LigneCommande line : order.getLignes()) {
                if (!Objects.equals(line.getId(), lineId)) continue;
                Produit product = line.getProduit();
                if (product == null || !ownsProduct(product, vendeur.get())) {
                    return ResponseEntity.status(403).body(Map.of("error", "Ligne hors périmètre vendeur"));
                }
                line.setFulfillmentStatus(status);
                order.setUpdatedAt(LocalDateTime.now());
                commandeRepository.save(order);
                recordOperation(vendeur.get(), "COMMANDE", "Statut " + status, order.getNumeroCommande() + " | " + product.getNom());
                return ResponseEntity.ok(mapOrderLine(order, line));
            }
        }

        return ResponseEntity.notFound().build();
    }

    private Map<String, Object> mapProductToDto(Produit p, Promotion pr) {
        Map<String, Object> dto = new java.util.LinkedHashMap<>();
        dto.put("id", p.getId());
        dto.put("nom", p.getNom());
        dto.put("prix", p.getPrix());
        dto.put("stock", p.getStock());
        dto.put("description", p.getDescription());
        dto.put("image", p.getImage());
        dto.put("images", p.getImages());
        
        if (p.getCategorie() != null) {
            Map<String, Object> cat = new java.util.LinkedHashMap<>();
            cat.put("id", p.getCategorie().getId());
            cat.put("nom", p.getCategorie().getNom());
            dto.put("categorie", cat);
        }

        if (p.getVendeur() != null) {
            Map<String, Object> vend = new java.util.LinkedHashMap<>();
            vend.put("id", p.getVendeur().getId());
            vend.put("nom", p.getVendeur().getNom());
            dto.put("vendeur", vend);
        }

        if (pr != null) {
            dto.put("promo", pr.getPourcentageRemise());
            dto.put("promoEnd", pr.getDateFin() != null ? pr.getDateFin().toString() : null);
            dto.put("promoActive", pr.isActive());
            dto.put("promoId", pr.getId());
            dto.put("promoName", pr.getNom());
            dto.put("promoCode", pr.getCode() != null && !pr.getCode().isBlank() ? pr.getCode() : pr.getNom());
            dto.put("promoScope", pr.isGlobal() ? "GLOBAL" : pr.getCategorieConcernee() != null ? "CATEGORIE" : "PRODUIT");
            dto.put("promoDeletable", pr.getProduitConcerne() != null && pr.getProduitConcerne().getId().equals(p.getId()));
        }
        
        return dto;
    }

    private Optional<User> currentVendor(java.security.Principal principal) {
        if (principal == null) return Optional.empty();
        return userRepository.findByEmail(principal.getName());
    }

    private List<Produit> getVisibleVendorProducts(User vendeur) {
        List<Produit> legacyProducts = produitRepository.findByVendeurIsNull();
        if (!legacyProducts.isEmpty()) {
            legacyProducts.forEach(product -> product.setVendeur(vendeur));
            produitRepository.saveAll(legacyProducts);
            recordOperation(vendeur, "MIGRATION", "Produits legacy rattachés", legacyProducts.size() + " produits récupérés");
        }
        return produitRepository.findByVendeurId(vendeur.getId());
    }

    private boolean ownsProduct(Produit produit, User vendeur) {
        if (produit.getVendeur() == null) {
            produit.setVendeur(vendeur);
            produitRepository.save(produit);
            recordOperation(vendeur, "MIGRATION", "Produit legacy rattaché", produit.getNom());
            return true;
        }
        return Objects.equals(produit.getVendeur().getId(), vendeur.getId());
    }

    private Map<String, Object> mapDashboardProduct(Produit product) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", product.getId());
        dto.put("nom", product.getNom());
        dto.put("prix", product.getPrix());
        dto.put("stock", product.getStock());
        dto.put("image", product.getImage());
        dto.put("images", product.getImages());
        dto.put("description", product.getDescription());
        dto.put("category", product.getCategorie() != null ? product.getCategorie().getNom() : "Sans catégorie");
        dto.put("updatedAt", product.getUpdatedAt());
        return dto;
    }

    private Map<String, Object> mapDashboardPromotion(Promotion promo) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", promo.getId());
        dto.put("nom", promo.getNom());
        dto.put("pourcentage", promo.getPourcentageRemise());
        dto.put("active", promo.isActive());
        dto.put("dateFin", promo.getDateFin());
        dto.put("productId", promo.getProduitConcerne() != null ? promo.getProduitConcerne().getId() : null);
        dto.put("productName", promo.getProduitConcerne() != null ? promo.getProduitConcerne().getNom() : "Produit");
        dto.put("productImage", promo.getProduitConcerne() != null ? promo.getProduitConcerne().getImage() : null);
        return dto;
    }

    private Map<String, Object> mapOrderLine(Commande order, LigneCommande line) {
        Produit product = line.getProduit();
        BigDecimal value = line.getPrixUnitaire().multiply(BigDecimal.valueOf(line.getQuantite()));
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", order.getNumeroCommande() + "-L" + line.getId());
        dto.put("lineId", line.getId());
        dto.put("orderNumber", order.getNumeroCommande());
        dto.put("productId", product.getId());
        dto.put("product", product.getNom());
        dto.put("image", product.getImage());
        dto.put("quantity", line.getQuantite());
        dto.put("unitPrice", line.getPrixUnitaire());
        dto.put("value", value);
        dto.put("status", order.getStatut());
        dto.put("fulfillmentStatus", line.getFulfillmentStatus() == null ? "PREPARATION" : line.getFulfillmentStatus());
        dto.put("paymentStatus", order.getPaymentStatus());
        dto.put("orderTotal", order.getTotal());
        dto.put("clientName", order.getClientName());
        dto.put("clientEmail", order.getClientEmail());
        dto.put("shippingPhone", order.getShippingPhone());
        dto.put("shippingAddress", order.getShippingAddress());
        dto.put("shippingCity", order.getShippingCity());
        dto.put("shippingCountry", order.getShippingCountry());
        dto.put("createdAt", order.getCreatedAt());
        dto.put("_sortDate", safeDate(order.getCreatedAt(), order.getUpdatedAt()));
        return dto;
    }

    private List<Map<String, Object>> buildVendorActivity(Long vendeurId, List<Produit> products, List<Promotion> promotions, List<Map<String, Object>> orderLines) {
        List<Map<String, Object>> activity = new ArrayList<>();
        vendeurOperationRepository.findTop50ByVendeurIdOrderByCreatedAtDesc(vendeurId).forEach(operation ->
                activity.add(activityItem(operation.getCategory(), operation.getEvent(), operation.getMeta(), operation.getCreatedAt(), operation.getCreatedAt())));
        products.forEach(product -> {
            activity.add(activityItem("PRODUIT", "Produit synchronisé", product.getNom(), product.getUpdatedAt(), product.getCreatedAt()));
            if (product.getCreatedAt() != null) {
                activity.add(activityItem("CREATE", "Produit ajouté", product.getNom(), product.getCreatedAt(), product.getCreatedAt()));
            }
        });
        promotions.forEach(promo -> activity.add(activityItem("PROMO", "Promotion " + promo.getPourcentageRemise() + "%", promo.getNom(), promo.getUpdatedAt(), promo.getCreatedAt())));
        orderLines.forEach(line -> activity.add(activityItem(
                "ORDER",
                "Nouvelle commande " + line.get("orderNumber"),
                line.get("product") + " x" + line.get("quantity") + " | " + line.get("value") + " MAD | " + line.get("clientName"),
                (LocalDateTime) line.get("createdAt"),
                (LocalDateTime) line.get("createdAt"))));

        return activity.stream()
                .sorted((a, b) -> ((LocalDateTime) b.get("_sortDate")).compareTo((LocalDateTime) a.get("_sortDate")))
                .limit(30)
                .peek(item -> item.remove("_sortDate"))
                .collect(Collectors.toList());
    }

    private Map<String, Object> activityItem(String category, String event, Object meta, LocalDateTime primaryDate, LocalDateTime fallbackDate) {
        LocalDateTime date = safeDate(primaryDate, fallbackDate);
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", category + "-" + event + "-" + date);
        item.put("time", date.toString());
        item.put("category", category);
        item.put("event", event);
        item.put("meta", meta);
        item.put("_sortDate", date);
        return item;
    }

    private List<BigDecimal> buildRevenueSeries(List<Map<String, Object>> orderLines) {
        List<BigDecimal> series = new ArrayList<>();
        for (int i = 0; i < 11; i++) series.add(BigDecimal.ZERO);
        LocalDate today = LocalDate.now();
        for (Map<String, Object> line : orderLines) {
            Object createdAt = line.get("createdAt");
            if (createdAt instanceof LocalDateTime dateTime) {
                int index = 10 - (int) java.time.temporal.ChronoUnit.DAYS.between(dateTime.toLocalDate(), today);
                if (index >= 0 && index < series.size()) {
                    series.set(index, series.get(index).add(new BigDecimal(line.get("value").toString())));
                }
            }
        }
        return series;
    }

    private LocalDateTime safeDate(LocalDateTime primaryDate, LocalDateTime fallbackDate) {
        if (primaryDate != null) return primaryDate;
        if (fallbackDate != null) return fallbackDate;
        return LocalDateTime.now();
    }

    private void recordOperation(User vendeur, String category, String event, String meta) {
        if (vendeur == null || vendeur.getId() == null) return;
        vendeurOperationRepository.save(new VendeurOperation(vendeur.getId(), category, event, meta));
    }

    @PostMapping("/produits")
    @PreAuthorize("hasRole('VENDEUR')")
    public ResponseEntity<?> addProduit(@RequestBody Map<String, Object> payload, java.security.Principal principal) {
        Produit produit = new Produit();
        
        // Set the seller from current authentication
        if (principal != null) {
            userRepository.findByEmail(principal.getName()).ifPresent(produit::setVendeur);
        }
        produit.setNom((String) payload.get("nom"));
        produit.setDescription((String) payload.get("description"));
        
        Object prixObj = payload.get("prix");
        if (prixObj != null) {
            produit.setPrix(new BigDecimal(prixObj.toString()));
        }
        
        Object stockObj = payload.get("stock");
        if (stockObj != null) {
            produit.setStock(Integer.parseInt(stockObj.toString()));
        }
        
        produit.setImage((String) payload.get("image"));
        produit.setImages((String) payload.get("images"));

        Object catIdObj = payload.get("categorieId");
        if (catIdObj != null) {
            Long catId = Long.parseLong(catIdObj.toString());
            categorieRepository.findById(catId).ifPresent(produit::setCategorie);
        }

        Produit saved = produitRepository.save(produit);
        recordOperation(produit.getVendeur(), "PRODUIT", "Produit ajouté", saved.getNom());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/produits/{id}")
    @PreAuthorize("hasRole('VENDEUR')")
    public ResponseEntity<?> updateProduit(@PathVariable Long id, @RequestBody Map<String, Object> payload, java.security.Principal principal) {
        Optional<Produit> opt = produitRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        
        Produit produit = opt.get();
        Optional<User> vendeur = currentVendor(principal);
        if (vendeur.isEmpty() || !ownsProduct(produit, vendeur.get())) {
            return ResponseEntity.status(403).body(Map.of("error", "Produit hors périmètre vendeur"));
        }
        if (payload.containsKey("nom")) produit.setNom((String) payload.get("nom"));
        if (payload.containsKey("description")) produit.setDescription((String) payload.get("description"));
        if (payload.containsKey("prix")) produit.setPrix(new BigDecimal(payload.get("prix").toString()));
        if (payload.containsKey("stock")) produit.setStock(Integer.parseInt(payload.get("stock").toString()));
        if (payload.containsKey("image")) produit.setImage((String) payload.get("image"));
        if (payload.containsKey("images")) produit.setImages((String) payload.get("images"));
        
        if (payload.containsKey("categorieId") && payload.get("categorieId") != null) {
            Long catId = Long.parseLong(payload.get("categorieId").toString());
            categorieRepository.findById(catId).ifPresent(produit::setCategorie);
        }

        Produit saved = produitRepository.save(produit);
        recordOperation(vendeur.get(), "PRODUIT", "Produit mis à jour", saved.getNom());
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/produits/{id}")
    @PreAuthorize("hasRole('VENDEUR')")
    public ResponseEntity<?> deleteProduit(@PathVariable Long id, java.security.Principal principal) {
        Optional<Produit> opt = produitRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Optional<User> vendeur = currentVendor(principal);
        Produit produit = opt.get();
        if (vendeur.isEmpty() || !ownsProduct(produit, vendeur.get())) {
            return ResponseEntity.status(403).body(Map.of("error", "Produit hors périmètre vendeur"));
        }
        recordOperation(vendeur.get(), "PRODUIT", "Produit supprimé", produit.getNom());
        produitRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Produit supprimé"));
    }

    // --- FOURNISSEURS ---

    @GetMapping("/fournisseurs")
    @PreAuthorize("hasRole('VENDEUR')")
    public ResponseEntity<List<Fournisseur>> getFournisseurs() {
        return ResponseEntity.ok(fournisseurRepository.findAll());
    }

    @PostMapping("/fournisseurs")
    @PreAuthorize("hasRole('VENDEUR')")
    public ResponseEntity<?> addFournisseur(@RequestBody Fournisseur fournisseur, java.security.Principal principal) {
        // Initialize with random latency for the Telemetry feature
        if (fournisseur.getLatency() == null) {
            fournisseur.setLatency(12 + (int)(Math.random() * 84)); // 12h to 96h
        }
        Fournisseur saved = fournisseurRepository.save(fournisseur);
        currentVendor(principal).ifPresent(vendeur -> recordOperation(vendeur, "FOURNISSEUR", "Fournisseur ajouté", saved.getNom()));
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/produits/{id}/fournisseurs")
    @PreAuthorize("hasRole('VENDEUR')")
    public ResponseEntity<?> associerFournisseur(@PathVariable Long id, @RequestBody Map<String, List<Long>> payload, java.security.Principal principal) {
        Optional<Produit> optProduit = produitRepository.findById(id);
        if (optProduit.isEmpty()) return ResponseEntity.notFound().build();
        
        Produit produit = optProduit.get();
        Optional<User> vendeur = currentVendor(principal);
        if (vendeur.isEmpty() || !ownsProduct(produit, vendeur.get())) {
            return ResponseEntity.status(403).body(Map.of("error", "Produit hors périmètre vendeur"));
        }
        List<Long> ids = payload.get("fournisseurIds");
        if (ids != null) {
            Set<Fournisseur> fournisseurs = new HashSet<>();
            for (Long fId : ids) {
                fournisseurRepository.findById(fId).ifPresent(fournisseurs::add);
            }
            produit.setFournisseurs(fournisseurs);
            produitRepository.save(produit);
            recordOperation(vendeur.get(), "FOURNISSEUR", "Fournisseurs associés", produit.getNom() + " | " + fournisseurs.size() + " nodes");
        }
        
        return ResponseEntity.ok(Map.of("message", "Fournisseurs associés au produit " + id));
    }

    // --- PROMOTIONS ---

    @PostMapping("/produits/{id}/promotion")
    @PreAuthorize("hasRole('VENDEUR')")
    public ResponseEntity<?> addPromotionLocale(@PathVariable Long id, @RequestBody Map<String, Object> payload, java.security.Principal principal) {
        Optional<Produit> optProduit = produitRepository.findById(id);
        if (optProduit.isEmpty()) return ResponseEntity.notFound().build();
        Optional<User> vendeur = currentVendor(principal);
        Produit targetProduct = optProduit.get();
        if (vendeur.isEmpty() || !ownsProduct(targetProduct, vendeur.get())) {
            return ResponseEntity.status(403).body(Map.of("error", "Produit hors périmètre vendeur"));
        }

        Promotion promo = new Promotion();
        String customNom = payload.get("nom") != null ? payload.get("nom").toString() : null;
        if (customNom == null || customNom.trim().isEmpty()) {
            customNom = "PROMO-" + id + "-" + System.currentTimeMillis() % 10000;
        }
        String customCode = payload.get("code") != null ? payload.get("code").toString().trim().toUpperCase() : customNom.trim().toUpperCase();
        promo.setNom(customNom);
        promo.setCode(customCode);
        promo.setPourcentageRemise(new BigDecimal(payload.get("pourcentage").toString()));
        String dateStr = payload.get("dateFin").toString();
        if (dateStr == null || dateStr.trim().isEmpty()) {
            promo.setDateFin(LocalDate.now().plusDays(7)); // Default to 1 week if empty
        } else if (dateStr.contains("T")) {
            promo.setDateFin(LocalDate.parse(dateStr.split("T")[0]));
        } else {
            promo.setDateFin(LocalDate.parse(dateStr));
        }
        promo.setDateDebut(LocalDate.now());
        promo.setCibleType("PRODUIT");
        promo.setGlobal(false);
        promo.setActive(true);
        promo.setProduitConcerne(targetProduct);

        Promotion saved = promotionRepository.save(promo);
        recordOperation(vendeur.get(), "PROMO", "Promotion ajoutée " + saved.getPourcentageRemise() + "%", targetProduct.getNom());
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/produits/{id}/promotion")
    @PreAuthorize("hasRole('VENDEUR')")
    public ResponseEntity<?> removePromotionLocale(@PathVariable Long id, java.security.Principal principal) {
        Optional<Produit> optProduit = produitRepository.findById(id);
        if (optProduit.isEmpty()) return ResponseEntity.notFound().build();
        Optional<User> vendeur = currentVendor(principal);
        Produit targetProduct = optProduit.get();
        if (vendeur.isEmpty() || !ownsProduct(targetProduct, vendeur.get())) {
            return ResponseEntity.status(403).body(Map.of("error", "Produit hors périmètre vendeur"));
        }
        List<Promotion> promos = promotionRepository.findByProduitConcerneId(id);
        recordOperation(vendeur.get(), "PROMO", "Promotions supprimées", targetProduct.getNom());
        promotionRepository.deleteAll(promos);
        return ResponseEntity.ok(Map.of("message", "Promotion(s) supprimée(s) pour le produit " + id));
    }

    @PatchMapping("/produits/{id}/promotion/toggle")
    @PreAuthorize("hasRole('VENDEUR')")
    public ResponseEntity<?> togglePromotionLocale(@PathVariable Long id, java.security.Principal principal) {
        Optional<Produit> optProduit = produitRepository.findById(id);
        if (optProduit.isEmpty()) return ResponseEntity.notFound().build();
        Optional<User> vendeur = currentVendor(principal);
        Produit targetProduct = optProduit.get();
        if (vendeur.isEmpty() || !ownsProduct(targetProduct, vendeur.get())) {
            return ResponseEntity.status(403).body(Map.of("error", "Produit hors périmètre vendeur"));
        }
        List<Promotion> promos = promotionRepository.findByProduitConcerneId(id);
        promos.forEach(p -> {
            p.setActive(!p.isActive());
            promotionRepository.save(p);
        });
        boolean isNowActive = promos.stream().anyMatch(Promotion::isActive);
        recordOperation(vendeur.get(), "PROMO", isNowActive ? "Promotion activée" : "Promotion désactivée", targetProduct.getNom());
        return ResponseEntity.ok(Map.of("active", isNowActive));
    }

    @PatchMapping("/promotions/{id}/toggle")
    @PreAuthorize("hasRole('VENDEUR')")
    public ResponseEntity<?> togglePromotionById(@PathVariable Long id, java.security.Principal principal) {
        Promotion promo = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Promotion not found."));
        Optional<User> vendeur = currentVendor(principal);
        Produit targetProduct = promo.getProduitConcerne();
        if (vendeur.isEmpty() || targetProduct == null || !ownsProduct(targetProduct, vendeur.get())) {
            return ResponseEntity.status(403).body(Map.of("error", "Promotion hors périmètre vendeur"));
        }
        promo.setActive(!promo.isActive());
        Promotion savedPromo = promotionRepository.save(promo);
        recordOperation(vendeur.get(), "PROMO", savedPromo.isActive() ? "Promotion activée" : "Promotion désactivée", targetProduct.getNom());
        return ResponseEntity.ok(Map.of("active", savedPromo.isActive()));
    }

    @DeleteMapping("/promotions/{id}")
    @PreAuthorize("hasRole('VENDEUR')")
    public ResponseEntity<?> deletePromotion(@PathVariable Long id, java.security.Principal principal) {
        Optional<Promotion> promo = promotionRepository.findById(id);
        if (promo.isEmpty()) return ResponseEntity.notFound().build();
        Optional<User> vendeur = currentVendor(principal);
        Produit targetProduct = promo.get().getProduitConcerne();
        if (vendeur.isEmpty() || targetProduct == null || !ownsProduct(targetProduct, vendeur.get())) {
            return ResponseEntity.status(403).body(Map.of("error", "Promotion hors périmètre vendeur"));
        }
        recordOperation(vendeur.get(), "PROMO", "Promotion supprimée", targetProduct.getNom());
        promotionRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Promotion supprimée"));
    }
    // --- IMAGE UPLOAD (ImageKit.io Integration via REST) ---

    @PostMapping("/upload-image")
    @PreAuthorize("hasRole('VENDEUR')")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file, java.security.Principal principal) {
        try {
            if (imageKitPrivateKey == null || imageKitPrivateKey.isBlank()) {
                return ResponseEntity.status(503).body(Map.of("error", "ImageKit private key is not configured."));
            }
            // Basic Auth uses Private Key as username, empty password
            String authHeader = "Basic " + java.util.Base64.getEncoder().encodeToString((imageKitPrivateKey + ":").getBytes());

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA);
            headers.set("Authorization", authHeader);

            org.springframework.util.MultiValueMap<String, Object> body = new org.springframework.util.LinkedMultiValueMap<>();
            body.add("file", new org.springframework.core.io.ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload.jpg";
                }
            });
            body.add("fileName", file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload.jpg");

            org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, Object>> requestEntity = new org.springframework.http.HttpEntity<>(body, headers);

            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            org.springframework.http.ResponseEntity<java.util.Map> response = restTemplate.postForEntity(
                    "https://upload.imagekit.io/api/v1/files/upload",
                    requestEntity,
                    java.util.Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String imageUrl = (String) response.getBody().get("url");
                currentVendor(principal).ifPresent(vendeur -> recordOperation(vendeur, "MEDIA", "Image ajoutée", file.getOriginalFilename() != null ? file.getOriginalFilename() : imageUrl));
                return ResponseEntity.ok(Map.of("url", imageUrl));
            } else {
                return ResponseEntity.status(500).body(Map.of("error", "Failed to upload to ImageKit"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
