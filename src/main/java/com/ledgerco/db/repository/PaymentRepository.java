package com.ledgerco.db.repository;

import com.ledgerco.db.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {

    List<PaymentEntity> findByLoanId(Long loanId);

    List<PaymentEntity> findByLoanIdAndAfterEmiLessThanEqual(Long loanId, Integer emiNo);
}
