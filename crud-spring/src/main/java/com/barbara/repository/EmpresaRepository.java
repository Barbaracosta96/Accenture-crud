package com.barbara.repository;

import com.barbara.model.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
    // Custom query methods can be added here
}
