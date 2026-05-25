package com.isga.boutique.repositories;

import com.isga.boutique.models.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Spring Security absolutely requires this method to load user details during login
    Optional<User> findByEmail(String email);
    
    // Quick check to prevent registering the same email twice
    Boolean existsByEmail(String email);

    @Query("select distinct u from User u join u.roles r where u.enabled = false and r.name = 'ROLE_VENDEUR' order by u.id desc")
    List<User> findPendingVendors();
}
