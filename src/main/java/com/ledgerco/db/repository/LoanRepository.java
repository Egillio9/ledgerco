package com.ledgerco.db.repository;

import com.ledgerco.db.entity.LoanEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoanRepository extends JpaRepository<LoanEntity, Long> {

    Optional<LoanEntity> findByBankNameAndBorrowerName(String bankName, String borrowerName);

    boolean existsByBankNameAndBorrowerName(String bankName, String borrowerName);
}
