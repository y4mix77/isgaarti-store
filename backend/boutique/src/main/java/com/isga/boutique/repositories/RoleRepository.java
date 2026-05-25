package com.isga.boutique.repositories;

import com.isga.boutique.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    // Used when registering a new user to assign them ROLE_CLIENT, ROLE_VENDEUR, etc.
    Optional<Role> findByName(String name);
}