package com.barbara.repository;

import com.barbara.model.Fornecedor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FornecedorRepository extends JpaRepository<Fornecedor, Long> {
    // Custom query methods can be added here
}
