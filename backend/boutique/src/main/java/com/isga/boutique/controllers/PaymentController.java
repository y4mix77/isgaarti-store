package com.isga.boutique.controllers;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.isga.boutique.models.Commande;
import com.isga.boutique.models.LigneCommande;
import com.isga.boutique.models.Panier;
import com.isga.boutique.models.PanierItem;
import com.isga.boutique.models.Produit;
import com.isga.boutique.models.User;
import com.isga.boutique.repositories.CommandeRepository;
import com.isga.boutique.repositories.PanierRepository;
import com.isga.boutique.repositories.ProduitRepository;
import com.isga.boutique.repositories.PromotionRepository;
import com.isga.boutique.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("200.00");
    private static final BigDecimal STANDARD_SHIPPING = new BigDecimal("30.00");
    private static final BigDecimal TAX_RATE = new BigDecimal("0.15");

    private final PanierRepository panierRepository;
    private final UserRepository userRepository;
    private final PromotionRepository promotionRepository;
    private final CommandeRepository commandeRepository;
    private final ProduitRepository produitRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${stripe.secret.key:}")
    private String stripeSecretKey;

    @Value("${stripe.publishable.key:}")
    private String stripePublishableKey;

    @Value("${stripe.checkout.success-url}")
    private String successUrl;

    @Value("${stripe.checkout.cancel-url}")
    private String cancelUrl;

    @Value("${stripe.checkout.return-url}")
    private String returnUrl;

    public PaymentController(
            PanierRepository panierRepository,
            UserRepository userRepository,
            PromotionRepository promotionRepository,
            CommandeRepository commandeRepository,
            ProduitRepository produitRepository
    ) {
        this.panierRepository = panierRepository;
        this.userRepository = userRepository;
        this.promotionRepository = promotionRepository;
        this.commandeRepository = commandeRepository;
        this.produitRepository = produitRepository;
    }

    @PostMapping("/stripe/checkout-session")
    @Transactional
    public ResponseEntity<?> createCheckoutSession(@RequestBody Map<String, Object> payload, Principal principal) {
        if (stripeSecretKey == null || stripeSecretKey.isBlank()) {
            return ResponseEntity.status(503).body(Map.of(
                    "message", "Stripe n'est pas configuré. Ajoutez STRIPE_SECRET_KEY au backend."
            ));
        }
        if (stripePublishableKey == null || stripePublishableKey.isBlank()) {
            return ResponseEntity.status(503).body(Map.of(
                    "message", "Stripe Publishable Key manquante. Ajoutez STRIPE_PUBLISHABLE_KEY au backend."
            ));
        }

        User client = currentUser(principal);
        Panier panier = panierRepository.findByClientId(client.getId())
                .orElseThrow(() -> new RuntimeException("Panier introuvable."));

        if (panier.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Votre panier est vide."));
        }

        OrderPricing pricing = calculatePricing(panier.getItems(), String.valueOf(payload.getOrDefault("promoCode", "")));
        Commande commande = buildPendingOrder(payload, client, panier.getItems(), pricing);

        try {
            Map<String, String> stripeResponse = createStripeSession(client, panier.getItems(), pricing);
            commande.setStripeSessionId(stripeResponse.get("id"));
            commandeRepository.save(commande);

            return ResponseEntity.ok(Map.of(
                    "sessionId", stripeResponse.get("id"),
                    "clientSecret", stripeResponse.get("clientSecret"),
                    "publishableKey", stripePublishableKey,
                    "orderNumber", commande.getNumeroCommande()
            ));
        } catch (Exception exception) {
            return ResponseEntity.status(502).body(Map.of(
                    "message", "Erreur de synchronisation Stripe.",
                    "details", exception.getMessage()
            ));
        }
    }

    @GetMapping("/stripe/session/{sessionId}")
    @Transactional
    public ResponseEntity<?> confirmStripeSession(@PathVariable String sessionId, Principal principal) {
        User client = currentUser(principal);
        Commande commande = commandeRepository.findByStripeSessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Commande Stripe introuvable."));

        if (!commande.getClientId().equals(client.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Commande non autorisée."));
        }

        try {
            String paymentStatus = retrieveStripePaymentStatus(sessionId);

            if ("paid".equalsIgnoreCase(paymentStatus)) {
                markOrderPaidAndUpdateStock(commande, client);
                panierRepository.findByClientId(client.getId()).ifPresent(panier -> {
                    panier.getItems().clear();
                    panierRepository.save(panier);
                });
            } else {
                commande.setPaymentStatus(paymentStatus.toUpperCase());
            }

            commandeRepository.save(commande);
            return ResponseEntity.ok(mapOrder(commande));
        } catch (Exception exception) {
            return ResponseEntity.status(502).body(Map.of(
                    "message", "Validation Stripe impossible.",
                    "details", exception.getMessage()
            ));
        }
    }

    @GetMapping("/stripe/config")
    public ResponseEntity<?> stripeConfig() {
        if (stripePublishableKey == null || stripePublishableKey.isBlank()) {
            return ResponseEntity.status(503).body(Map.of(
                    "message", "Stripe Publishable Key manquante. Ajoutez stripe.publishable.key=pk_test_... au backend."
            ));
        }
        return ResponseEntity.ok(Map.of("publishableKey", stripePublishableKey));
    }

    @PostMapping("/stripe/payment-intent")
    @Transactional
    public ResponseEntity<?> createPaymentIntent(@RequestBody Map<String, Object> payload, Principal principal) {
        if (stripeSecretKey == null || stripeSecretKey.isBlank()) {
            return ResponseEntity.status(503).body(Map.of("message", "Stripe Secret Key manquante."));
        }
        if (stripePublishableKey == null || stripePublishableKey.isBlank()) {
            return ResponseEntity.status(503).body(Map.of("message", "Stripe Publishable Key manquante."));
        }

        User client = currentUser(principal);
        Panier panier = panierRepository.findByClientId(client.getId())
                .orElseThrow(() -> new RuntimeException("Panier introuvable."));
        if (panier.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Votre panier est vide."));
        }

        OrderPricing pricing = calculatePricing(panier.getItems(), String.valueOf(payload.getOrDefault("promoCode", "")));
        Commande commande = buildPendingOrder(payload, client, panier.getItems(), pricing);

        try {
            Map<String, Object> intent = createStripePaymentIntent(client, pricing, commande.getNumeroCommande());
            commande.setStripePaymentIntentId(String.valueOf(intent.get("id")));
            commandeRepository.save(commande);

            return ResponseEntity.ok(Map.of(
                    "paymentIntentId", String.valueOf(intent.get("id")),
                    "clientSecret", String.valueOf(intent.get("client_secret")),
                    "publishableKey", stripePublishableKey,
                    "orderNumber", commande.getNumeroCommande()
            ));
        } catch (Exception exception) {
            return ResponseEntity.status(502).body(Map.of(
                    "message", "Création PaymentIntent impossible.",
                    "details", exception.getMessage()
            ));
        }
    }

    @GetMapping("/stripe/payment-intent/{paymentIntentId}")
    @Transactional
    public ResponseEntity<?> confirmPaymentIntent(@PathVariable String paymentIntentId, Principal principal) {
        User client = currentUser(principal);
        Commande commande = commandeRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Commande PaymentIntent introuvable."));
        if (!commande.getClientId().equals(client.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Commande non autorisée."));
        }

        try {
            String status = retrievePaymentIntentStatus(paymentIntentId);
            if ("succeeded".equalsIgnoreCase(status)) {
                markOrderPaidAndUpdateStock(commande, client);
                panierRepository.findByClientId(client.getId()).ifPresent(panier -> {
                    panier.getItems().clear();
                    panierRepository.save(panier);
                });
            } else {
                commande.setPaymentStatus(status.toUpperCase());
            }
            commandeRepository.save(commande);
            return ResponseEntity.ok(mapOrder(commande));
        } catch (Exception exception) {
            return ResponseEntity.status(502).body(Map.of(
                    "message", "Validation PaymentIntent impossible.",
                    "details", exception.getMessage()
            ));
        }
    }

    private Map<String, Object> createStripePaymentIntent(User client, OrderPricing pricing, String orderNumber) throws Exception {
        List<FormPair> form = new ArrayList<>();
        form.add(pair("amount", toMinorAmount(pricing.total())));
        form.add(pair("currency", "mad"));
        form.add(pair("receipt_email", client.getEmail()));
        form.add(pair("description", "Commande ISGAARTI " + orderNumber));
        form.add(pair("automatic_payment_methods[enabled]", "true"));
        form.add(pair("automatic_payment_methods[allow_redirects]", "never"));
        form.add(pair("metadata[orderNumber]", orderNumber));
        form.add(pair("metadata[store]", "ISGAARTI Store"));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.stripe.com/v1/payment_intents"))
                .header("Authorization", "Bearer " + stripeSecretKey)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(encodeForm(form)))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        Map<String, Object> body = readJson(response.body());
        if (response.statusCode() >= 400) {
            throw new IllegalStateException(readStripeError(body, response.body()));
        }
        return body;
    }

    private String retrievePaymentIntentStatus(String paymentIntentId) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.stripe.com/v1/payment_intents/" + urlEncode(paymentIntentId)))
                .header("Authorization", "Bearer " + stripeSecretKey)
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        Map<String, Object> body = readJson(response.body());
        if (response.statusCode() >= 400) {
            throw new IllegalStateException(readStripeError(body, response.body()));
        }
        return String.valueOf(body.getOrDefault("status", ""));
    }

    private Map<String, String> createStripeSession(User client, List<PanierItem> items, OrderPricing pricing) throws Exception {
        List<FormPair> form = new ArrayList<>();
        form.add(pair("mode", "payment"));
        form.add(pair("ui_mode", "embedded"));
        form.add(pair("return_url", returnUrl));
        form.add(pair("redirect_on_completion", "always"));
        form.add(pair("customer_email", client.getEmail()));
        form.add(pair("client_reference_id", client.getId().toString()));
        form.add(pair("metadata[store]", "ISGAARTI Store"));
        form.add(pair("metadata[order_total]", pricing.total().toPlainString()));

        int index = 0;
        for (PanierItem item : items) {
            Produit produit = item.getProduit();
            BigDecimal unitPrice = pricing.discountedUnitPrice(produit.getId(), produit.getPrix());
            form.add(pair("line_items[" + index + "][quantity]", String.valueOf(item.getQuantite())));
            form.add(pair("line_items[" + index + "][price_data][currency]", "mad"));
            form.add(pair("line_items[" + index + "][price_data][unit_amount]", toMinorAmount(unitPrice)));
            form.add(pair("line_items[" + index + "][price_data][product_data][name]", produit.getNom()));
            index++;
        }

        if (pricing.shippingCost().compareTo(BigDecimal.ZERO) > 0) {
            form.add(pair("line_items[" + index + "][quantity]", "1"));
            form.add(pair("line_items[" + index + "][price_data][currency]", "mad"));
            form.add(pair("line_items[" + index + "][price_data][unit_amount]", toMinorAmount(pricing.shippingCost())));
            form.add(pair("line_items[" + index + "][price_data][product_data][name]", "Livraison ISGAARTI"));
            index++;
        }

        form.add(pair("line_items[" + index + "][quantity]", "1"));
        form.add(pair("line_items[" + index + "][price_data][currency]", "mad"));
        form.add(pair("line_items[" + index + "][price_data][unit_amount]", toMinorAmount(pricing.taxAmount())));
        form.add(pair("line_items[" + index + "][price_data][product_data][name]", "Taxes 15%"));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.stripe.com/v1/checkout/sessions"))
                .header("Authorization", "Bearer " + stripeSecretKey)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(encodeForm(form)))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        Map<String, Object> body = readJson(response.body());
        if (response.statusCode() >= 400) {
            throw new IllegalStateException(readStripeError(body, response.body()));
        }

        return Map.of(
                "id", String.valueOf(body.getOrDefault("id", "")),
                "clientSecret", String.valueOf(body.getOrDefault("client_secret", ""))
        );
    }

    private String retrieveStripePaymentStatus(String sessionId) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.stripe.com/v1/checkout/sessions/" + urlEncode(sessionId)))
                .header("Authorization", "Bearer " + stripeSecretKey)
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        Map<String, Object> body = readJson(response.body());
        if (response.statusCode() >= 400) {
            throw new IllegalStateException(readStripeError(body, response.body()));
        }
        return String.valueOf(body.getOrDefault("payment_status", ""));
    }

    private Commande buildPendingOrder(Map<String, Object> payload, User client, List<PanierItem> items, OrderPricing pricing) {
        Commande commande = new Commande();
        commande.setNumeroCommande("CMD-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + System.currentTimeMillis());
        commande.setStatut("PAYMENT_PENDING");
        commande.setPaymentStatus("PENDING");
        commande.setClientId(client.getId());
        commande.setClientEmail(client.getEmail());
        commande.setClientName(readText(payload, "fullName", client.getNom()));
        commande.setShippingAddress(readText(payload, "address", ""));
        commande.setShippingCity(readText(payload, "city", ""));
        commande.setShippingCountry(readText(payload, "country", ""));
        commande.setShippingPhone(readText(payload, "phone", ""));
        commande.setSubtotal(pricing.subtotal());
        commande.setShippingCost(pricing.shippingCost());
        commande.setTaxAmount(pricing.taxAmount());
        commande.setPromoDiscount(pricing.promoDiscount());
        commande.setPromoCode(pricing.promoCode());
        commande.setTotal(pricing.total());

        items.forEach(item -> {
            LigneCommande ligne = new LigneCommande();
            ligne.setCommande(commande);
            ligne.setProduit(item.getProduit());
            ligne.setQuantite(item.getQuantite());
            ligne.setPrixUnitaire(pricing.discountedUnitPrice(item.getProduit().getId(), item.getProduit().getPrix()));
            ligne.setFulfillmentStatus("PAYMENT_PENDING");
            commande.getLignes().add(ligne);
        });

        return commande;
    }

    private OrderPricing calculatePricing(List<PanierItem> items, String promoCode) {
        BigDecimal subtotal = items.stream()
                .map(item -> item.getProduit().getPrix().multiply(BigDecimal.valueOf(item.getQuantite())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal promoRate = BigDecimal.ZERO;
        List<Long> matchedProductIds = new ArrayList<>();
        String normalizedCode = promoCode == null ? "" : promoCode.trim().toUpperCase();

        if (!normalizedCode.isBlank()) {
            Optional<com.isga.boutique.models.Promotion> matchingPromotion = promotionsByCode(normalizedCode).stream()
                    .filter(this::isPromotionUsable)
                    .filter(promotion -> items.stream().anyMatch(item -> promotionMatchesItem(promotion, item)))
                    .sorted((a, b) -> {
                        int discountCompare = b.getPourcentageRemise().compareTo(a.getPourcentageRemise());
                        if (discountCompare != 0) return discountCompare;
                        return b.getId().compareTo(a.getId());
                    })
                    .findFirst();

            if (matchingPromotion.isPresent()) {
                com.isga.boutique.models.Promotion promotion = matchingPromotion.get();
                promoRate = promotion.getPourcentageRemise();
                matchedProductIds.addAll(items.stream()
                        .filter(item -> promotionMatchesItem(promotion, item))
                        .map(item -> item.getProduit().getId())
                        .toList());
            }
        }

        BigDecimal discount = BigDecimal.ZERO;
        Map<Long, BigDecimal> discountedUnitPrices = new LinkedHashMap<>();
        for (PanierItem item : items) {
            BigDecimal unitPrice = item.getProduit().getPrix();
            if (matchedProductIds.contains(item.getProduit().getId()) && promoRate.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal multiplier = BigDecimal.ONE.subtract(promoRate.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
                BigDecimal discounted = money(unitPrice.multiply(multiplier));
                discountedUnitPrices.put(item.getProduit().getId(), discounted);
                discount = discount.add(unitPrice.subtract(discounted).multiply(BigDecimal.valueOf(item.getQuantite())));
            }
        }

        BigDecimal discountedSubtotal = subtotal.subtract(discount);
        BigDecimal shipping = discountedSubtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0 ? BigDecimal.ZERO : STANDARD_SHIPPING;
        BigDecimal tax = money(discountedSubtotal.multiply(TAX_RATE));
        BigDecimal total = money(discountedSubtotal.add(shipping).add(tax));

        return new OrderPricing(
                money(subtotal),
                money(shipping),
                tax,
                money(discount),
                total,
                normalizedCode.isBlank() ? null : normalizedCode,
                discountedUnitPrices
        );
    }

    private List<com.isga.boutique.models.Promotion> promotionsByCode(String code) {
        List<com.isga.boutique.models.Promotion> byCode = promotionRepository.findByCodeIgnoreCase(code);
        if (!byCode.isEmpty()) return byCode;

        return promotionRepository.findAll().stream()
                .filter(promotion -> effectiveCode(promotion).equalsIgnoreCase(code))
                .toList();
    }

    private boolean isPromotionUsable(com.isga.boutique.models.Promotion promotion) {
        LocalDate today = LocalDate.now();
        return promotion.isActive()
                && (promotion.getDateDebut() == null || !promotion.getDateDebut().isAfter(today))
                && (promotion.getDateFin() == null || !promotion.getDateFin().isBefore(today));
    }

    private boolean promotionMatchesItem(com.isga.boutique.models.Promotion promotion, PanierItem item) {
        Produit produit = item.getProduit();
        if (promotion.isGlobal()) return true;
        if (promotion.getProduitConcerne() != null && promotion.getProduitConcerne().getId().equals(produit.getId())) {
            return true;
        }
        return promotion.getCategorieConcernee() != null
                && produit.getCategorie() != null
                && promotion.getCategorieConcernee().getId().equals(produit.getCategorie().getId());
    }

    private String effectiveCode(com.isga.boutique.models.Promotion promotion) {
        if (promotion.getCode() != null && !promotion.getCode().isBlank()) {
            return promotion.getCode().trim().toUpperCase();
        }
        return promotion.getNom() != null ? promotion.getNom().trim().toUpperCase() : "";
    }

    private Map<String, Object> mapOrder(Commande commande) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", commande.getId());
        dto.put("orderNumber", commande.getNumeroCommande());
        dto.put("status", commande.getStatut());
        dto.put("paymentStatus", commande.getPaymentStatus());
        dto.put("total", commande.getTotal());
        dto.put("subtotal", commande.getSubtotal());
        dto.put("shippingCost", commande.getShippingCost());
        dto.put("taxAmount", commande.getTaxAmount());
        dto.put("promoDiscount", commande.getPromoDiscount());
        dto.put("promoCode", commande.getPromoCode());
        dto.put("clientName", commande.getClientName());
        dto.put("clientEmail", commande.getClientEmail());
        dto.put("shippingPhone", commande.getShippingPhone());
        dto.put("shippingAddress", commande.getShippingAddress());
        dto.put("shippingCity", commande.getShippingCity());
        dto.put("shippingCountry", commande.getShippingCountry());
        dto.put("items", commande.getLignes().stream().map(this::mapLine).toList());
        return dto;
    }

    private void markOrderPaidAndUpdateStock(Commande commande, User client) {
        if ("PAID".equalsIgnoreCase(commande.getPaymentStatus())) return;

        commande.setStatut("PAYEE");
        commande.setPaymentStatus("PAID");
        commande.getLignes().forEach(line -> {
            line.setFulfillmentStatus("PREPARATION");
            Produit produit = line.getProduit();
            if (produit == null || produit.getId() == null) return;
            int currentStock = produit.getStock() == null ? 0 : produit.getStock();
            produit.setStock(Math.max(0, currentStock - line.getQuantite()));
            produitRepository.save(produit);
        });
    }

    private Map<String, Object> mapLine(LigneCommande ligne) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("name", ligne.getProduit().getNom());
        dto.put("quantity", ligne.getQuantite());
        dto.put("unitPrice", ligne.getPrixUnitaire());
        dto.put("fulfillmentStatus", ligne.getFulfillmentStatus());
        dto.put("image", ligne.getProduit().getImage());
        return dto;
    }

    private User currentUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable."));
    }

    private String encodeForm(List<FormPair> pairs) {
        return pairs.stream()
                .map(pair -> urlEncode(pair.key()) + "=" + urlEncode(pair.value()))
                .reduce((left, right) -> left + "&" + right)
                .orElse("");
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }

    private Map<String, Object> readJson(String json) throws Exception {
        if (json == null || json.isBlank()) return Map.of();
        return objectMapper.readValue(json, new TypeReference<>() {});
    }

    @SuppressWarnings("unchecked")
    private String readStripeError(Map<String, Object> body, String fallback) {
        Object error = body.get("error");
        if (error instanceof Map<?, ?> errorMap) {
            Object message = errorMap.get("message");
            if (message != null) return String.valueOf(message);
        }
        return fallback;
    }

    private FormPair pair(String key, String value) {
        return new FormPair(key, value);
    }

    private String toMinorAmount(BigDecimal amount) {
        return money(amount).multiply(new BigDecimal("100")).setScale(0, RoundingMode.HALF_UP).toPlainString();
    }

    private BigDecimal money(BigDecimal amount) {
        return amount.setScale(2, RoundingMode.HALF_UP);
    }

    private String readText(Map<String, Object> payload, String key, String fallback) {
        Object value = payload.get(key);
        if (value == null || String.valueOf(value).isBlank()) return fallback;
        return String.valueOf(value).trim();
    }

    private record FormPair(String key, String value) {}

    private record OrderPricing(
            BigDecimal subtotal,
            BigDecimal shippingCost,
            BigDecimal taxAmount,
            BigDecimal promoDiscount,
            BigDecimal total,
            String promoCode,
            Map<Long, BigDecimal> discountedUnitPrices
    ) {
        BigDecimal discountedUnitPrice(Long productId, BigDecimal fallback) {
            return discountedUnitPrices.getOrDefault(productId, fallback);
        }
    }
}
