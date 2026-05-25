package com.isga.boutique.controllers;

import com.isga.boutique.models.Role;
import com.isga.boutique.models.User;
import com.isga.boutique.models.Categorie;
import com.isga.boutique.models.CategorieOperation;
import com.isga.boutique.models.Commande;
import com.isga.boutique.models.LigneCommande;
import com.isga.boutique.models.Promotion;
import com.isga.boutique.models.Produit;
import com.isga.boutique.repositories.CommandeRepository;
import com.isga.boutique.repositories.UserRepository;
import com.isga.boutique.repositories.RoleRepository;
import com.isga.boutique.repositories.CategorieRepository;
import com.isga.boutique.repositories.CategorieOperationRepository;
import com.isga.boutique.repositories.PromotionRepository;
import com.isga.boutique.repositories.ProduitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private CategorieRepository categorieRepository;

    @Autowired
    private CategorieOperationRepository categorieOperationRepository;

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private ProduitRepository produitRepository;

    @Autowired
    private CommandeRepository commandeRepository;

    // --- GESTION UTILISATEURS ---

    @GetMapping("/admin/utilisateurs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/admin/utilisateurs/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getPendingUsers() {
        return ResponseEntity.ok(userRepository.findPendingVendors());
    }

    @PutMapping("/admin/utilisateurs/{userId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        user.setEnabled(true);
        userRepository.save(user);
        return ResponseEntity.ok("User approved successfully!");
    }

    @PutMapping("/admin/utilisateurs/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable Long userId, @RequestBody Map<String, String> payload) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        String roleName = payload.get("role");
        Role role = roleRepository.findByName("ROLE_" + roleName.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Error: Role not found."));

        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok("User role updated successfully!");
    }

    @DeleteMapping("/admin/utilisateurs/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        userRepository.deleteById(userId);
        return ResponseEntity.ok("User deleted successfully!");
    }

    // --- GESTION CATEGORIES ---

    @GetMapping("/categories")
    public ResponseEntity<List<Categorie>> getAllCategories() {
        return ResponseEntity.ok(categorieRepository.findAll());
    }

    @GetMapping("/categories/operations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CategorieOperation>> getCategorieOperations() {
        return ResponseEntity.ok(categorieOperationRepository.findTop8ByOrderByCreatedAtDesc());
    }

    @PostMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Categorie> createCategorie(@RequestBody Categorie categorie) {
        Categorie savedCategorie = categorieRepository.save(categorie);
        recordCategorieOperation("CREATE", savedCategorie);
        return ResponseEntity.ok(savedCategorie);
    }

    @PutMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Categorie> updateCategorie(@PathVariable Long id, @RequestBody Categorie categorieData) {
        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Categorie not found."));
        categorie.setNom(categorieData.getNom());
        categorie.setDescription(categorieData.getDescription());
        Categorie savedCategorie = categorieRepository.save(categorie);
        recordCategorieOperation("EDIT", savedCategorie);
        return ResponseEntity.ok(savedCategorie);
    }

    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCategorie(@PathVariable Long id) {
        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Categorie not found."));
        recordCategorieOperation("DELETE", categorie);
        categorieRepository.deleteById(id);
        return ResponseEntity.ok("Categorie deleted successfully!");
    }

    private void recordCategorieOperation(String action, Categorie categorie) {
        CategorieOperation operation = new CategorieOperation();
        operation.setAction(action);
        operation.setCategorieId(categorie.getId());
        operation.setCategorieNom(categorie.getNom());
        categorieOperationRepository.save(operation);
    }

    // --- GESTION PROMOTIONS ---

    @GetMapping("/promotions")
    public ResponseEntity<List<Promotion>> getAllPromotions() {
        return ResponseEntity.ok(promotionRepository.findAll());
    }

    @PostMapping("/promotions/global")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Promotion> lancerPromotionGlobale(@RequestBody Map<String, Object> payload) {
        Promotion promo = new Promotion();
        String code = payload.getOrDefault("code", "PROMO-" + System.currentTimeMillis()).toString().trim().toUpperCase();
        String cibleType = payload.getOrDefault("cibleType", "GLOBAL").toString().toUpperCase();

        promo.setNom(code);
        promo.setCode(code);
        promo.setPourcentageRemise(java.math.BigDecimal.valueOf(Double.parseDouble(payload.get("pourcentage").toString())));
        promo.setDateFin(java.time.LocalDate.parse(payload.get("dateFin").toString()));
        promo.setDateDebut(java.time.LocalDate.now());
        promo.setCibleType(cibleType);
        promo.setGlobal("GLOBAL".equals(cibleType));
        promo.setActive(true);

        if ("CATEGORIE".equals(cibleType)) {
            if (payload.get("cibleId") == null) {
                return ResponseEntity.badRequest().build();
            }
            Long categorieId = Long.parseLong(payload.get("cibleId").toString());
            promo.setCategorieConcernee(categorieRepository.findById(categorieId)
                    .orElseThrow(() -> new RuntimeException("Error: Categorie not found.")));
        }

        if ("PRODUIT".equals(cibleType)) {
            if (payload.get("cibleId") == null) {
                return ResponseEntity.badRequest().build();
            }
            Long produitId = Long.parseLong(payload.get("cibleId").toString());
            promo.setProduitConcerne(produitRepository.findById(produitId)
                    .orElseThrow(() -> new RuntimeException("Error: Produit not found.")));
        }

        return ResponseEntity.ok(promotionRepository.save(promo));
    }

    @PutMapping("/promotions/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Promotion> togglePromotionStatus(@PathVariable Long id) {
        Promotion promo = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Promotion not found."));
        promo.setActive(!promo.isActive());
        return ResponseEntity.ok(promotionRepository.save(promo));
    }

    @DeleteMapping("/promotions/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePromotion(@PathVariable Long id) {
        promotionRepository.deleteById(id);
        return ResponseEntity.ok("Promotion deleted successfully!");
    }

    // --- STATS ---

    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();
        List<Commande> commandes = commandeRepository.findAll();
        List<Commande> paidOrders = commandes.stream()
                .filter(order -> "PAID".equalsIgnoreCase(order.getPaymentStatus()) || "PAYEE".equalsIgnoreCase(order.getStatut()))
                .collect(Collectors.toList());
        LocalDate today = LocalDate.now();
        List<Commande> paidThisMonth = paidOrders.stream()
                .filter(order -> order.getCreatedAt() != null && order.getCreatedAt().toLocalDate().getMonth().equals(today.getMonth()) && order.getCreatedAt().getYear() == today.getYear())
                .collect(Collectors.toList());

        stats.put("totalUtilisateurs", userRepository.count());
        stats.put("totalCategories", categorieRepository.count());
        stats.put("totalProduits", produitRepository.count());
        stats.put("totalPromotions", promotionRepository.count());
        
        long vendeursCount = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_VENDEUR")))
                .count();
        stats.put("totalVendeurs", vendeursCount);

        // Fetch distribution for Doughnut Chart
        List<Categorie> allCategories = categorieRepository.findAll();
        List<String> repartitionLabels = new java.util.ArrayList<>();
        List<Long> repartitionData = new java.util.ArrayList<>();
        
        int limit = 6;
        for (int i = 0; i < allCategories.size() && i < limit; i++) {
            Categorie cat = allCategories.get(i);
            repartitionLabels.add(cat.getNom());
            repartitionData.add(produitRepository.countByCategorieId(cat.getId()));
        }
        
        if (allCategories.size() > limit) {
             long topTotal = repartitionData.stream().mapToLong(Long::longValue).sum();
             long totalCount = produitRepository.count();
             repartitionLabels.add("Autres");
             repartitionData.add(totalCount - topTotal);
        }

        stats.put("repartitionLabels", repartitionLabels);
        stats.put("repartitionData", repartitionData);

        List<String> monthLabels = new java.util.ArrayList<>();
        List<BigDecimal> revenueSeries = new java.util.ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate target = today.minusMonths(i);
            Month month = target.getMonth();
            monthLabels.add(month.toString().substring(0, 3));
            BigDecimal monthRevenue = paidOrders.stream()
                    .filter(order -> order.getCreatedAt() != null
                            && order.getCreatedAt().getYear() == target.getYear()
                            && order.getCreatedAt().getMonth() == month)
                    .map(Commande::getTotal)
                    .filter(java.util.Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            revenueSeries.add(monthRevenue);
        }
        stats.put("historiqueLabels", monthLabels);
        stats.put("historiquePrixMoyen", revenueSeries);

        Map<String, Long> vendorPurchases = new LinkedHashMap<>();
        Map<String, BigDecimal> vendorRevenue = new LinkedHashMap<>();
        paidOrders.stream()
                .flatMap(order -> order.getLignes().stream())
                .filter(line -> line.getProduit() != null && line.getProduit().getVendeur() != null)
                .forEach(line -> {
                    Produit produit = line.getProduit();
                    String vendeurName = produit.getVendeur().getNom() != null ? produit.getVendeur().getNom() : produit.getVendeur().getEmail();
                    BigDecimal lineValue = line.getPrixUnitaire().multiply(BigDecimal.valueOf(line.getQuantite()));
                    vendorPurchases.merge(vendeurName, Long.valueOf(line.getQuantite()), Long::sum);
                    vendorRevenue.merge(vendeurName, lineValue, BigDecimal::add);
                });

        List<Map.Entry<String, Long>> topVendorPurchases = vendorPurchases.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(8)
                .collect(Collectors.toList());
        stats.put("vendorLabels", topVendorPurchases.stream().map(Map.Entry::getKey).collect(Collectors.toList()));
        stats.put("vendorPurchaseData", topVendorPurchases.stream().map(Map.Entry::getValue).collect(Collectors.toList()));
        stats.put("vendorRevenueData", topVendorPurchases.stream()
                .map(entry -> vendorRevenue.getOrDefault(entry.getKey(), BigDecimal.ZERO))
                .collect(Collectors.toList()));

        List<Map<String, Object>> vendorPurchaseAlerts = paidOrders.stream()
                .flatMap(order -> order.getLignes().stream().map(line -> {
                    Map<String, Object> alert = new LinkedHashMap<>();
                    Produit produit = line.getProduit();
                    User vendeur = produit != null ? produit.getVendeur() : null;
                    BigDecimal lineValue = line.getPrixUnitaire().multiply(BigDecimal.valueOf(line.getQuantite()));
                    alert.put("orderNumber", order.getNumeroCommande());
                    alert.put("paymentStatus", order.getPaymentStatus());
                    alert.put("status", order.getStatut());
                    alert.put("createdAt", order.getCreatedAt());
                    alert.put("clientName", order.getClientName());
                    alert.put("clientEmail", order.getClientEmail());
                    alert.put("shippingCity", order.getShippingCity());
                    alert.put("shippingCountry", order.getShippingCountry());
                    alert.put("product", produit != null ? produit.getNom() : "Produit");
                    alert.put("productImage", produit != null ? produit.getImage() : null);
                    alert.put("quantity", line.getQuantite());
                    alert.put("unitPrice", line.getPrixUnitaire());
                    alert.put("value", lineValue);
                    alert.put("orderTotal", order.getTotal());
                    alert.put("vendorName", vendeur != null ? vendeur.getNom() : "Vendeur");
                    alert.put("vendorEmail", vendeur != null ? vendeur.getEmail() : "");
                    alert.put("_sortDate", order.getCreatedAt() != null ? order.getCreatedAt() : LocalDateTime.now());
                    return alert;
                }))
                .sorted((a, b) -> ((LocalDateTime) b.get("_sortDate")).compareTo((LocalDateTime) a.get("_sortDate")))
                .limit(8)
                .peek(alert -> alert.remove("_sortDate"))
                .collect(Collectors.toList());
        stats.put("vendorPurchaseAlerts", vendorPurchaseAlerts);

        BigDecimal revenuMensuel = paidThisMonth.stream()
                .map(Commande::getTotal)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int produitsVendus = paidThisMonth.stream()
                .flatMap(order -> order.getLignes().stream())
                .mapToInt(line -> line.getQuantite() == null ? 0 : line.getQuantite())
                .sum();
        long nbAnnulations = commandes.stream()
                .filter(order -> order.getStatut() != null && order.getStatut().toUpperCase().contains("ANNU"))
                .count();

        stats.put("revenuMensuel", revenuMensuel);
        stats.put("objectifMensuel", BigDecimal.valueOf(65000));
        stats.put("nbCommandesMois", paidThisMonth.size());
        stats.put("produitsVendus", produitsVendus);
        stats.put("panierMoyen", paidThisMonth.isEmpty() ? BigDecimal.ZERO : revenuMensuel.divide(BigDecimal.valueOf(paidThisMonth.size()), 2, java.math.RoundingMode.HALF_UP));
        stats.put("nbAnnulations", nbAnnulations);
        stats.put("totalCommandesPayees", paidOrders.size());
        stats.put("revenuTotal", paidOrders.stream().map(Commande::getTotal).filter(java.util.Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add));

        return ResponseEntity.ok(stats);
    }
}
