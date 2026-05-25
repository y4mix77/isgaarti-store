package com.isga.boutique.controllers;

import com.isga.boutique.models.ShippingAddress;
import com.isga.boutique.models.User;
import com.isga.boutique.repositories.ShippingAddressRepository;
import com.isga.boutique.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shipping-addresses")
public class ShippingAddressController {

    @Autowired
    private ShippingAddressRepository shippingAddressRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> list(Principal principal) {
        User client = getClient(principal);
        return ResponseEntity.ok(
                shippingAddressRepository.findByClientIdOrderByDefaultAddressDescUpdatedAtDesc(client.getId())
                        .stream()
                        .map(this::mapAddress)
                        .toList()
        );
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> save(@RequestBody Map<String, Object> payload, Principal principal) {
        User client = getClient(principal);
        ShippingAddress address = new ShippingAddress();
        address.setClient(client);
        address.setFullName(readRequired(payload, "fullName"));
        address.setEmail(readRequired(payload, "email"));
        address.setCity(readRequired(payload, "city"));
        address.setCountry(readRequired(payload, "country"));
        address.setPhone(readRequired(payload, "phone"));
        address.setAddress(readRequired(payload, "address"));
        address.setDefaultAddress(shippingAddressRepository.findByClientIdOrderByDefaultAddressDescUpdatedAtDesc(client.getId()).isEmpty());

        return ResponseEntity.ok(mapAddress(shippingAddressRepository.save(address)));
    }

    private User getClient(Principal principal) {
        if (principal == null) {
            throw new RuntimeException("Client non authentifié.");
        }

        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Client introuvable."));
    }

    private String readRequired(Map<String, Object> payload, String key) {
        String value = payload.get(key) == null ? "" : payload.get(key).toString().trim();
        if (value.isBlank()) {
            throw new IllegalArgumentException(key + " est obligatoire.");
        }
        return value;
    }

    private Map<String, Object> mapAddress(ShippingAddress address) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", address.getId());
        dto.put("fullName", address.getFullName());
        dto.put("email", address.getEmail());
        dto.put("city", address.getCity());
        dto.put("country", address.getCountry());
        dto.put("phone", address.getPhone());
        dto.put("address", address.getAddress());
        dto.put("defaultAddress", address.isDefaultAddress());
        return dto;
    }
}
