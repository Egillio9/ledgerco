package com.ledgerco.db;

import com.ledgerco.db.entity.LoanEntity;
import com.ledgerco.db.repository.LoanRepository;
import com.ledgerco.dto.LoanRequest;
import com.ledgerco.dto.LoanResponse;
import org.springframework.stereotype.Service;

@Service
public class LoanDbService {

    private final LoanRepository loanRepository;

    public LoanDbService(LoanRepository loanRepository) {
        this.loanRepository = loanRepository;
    }

    public LoanResponse createLoan(LoanRequest request) {

        LoanEntity loanEntity = LoanEntity.builder()
                .bankName(request.getBankName())
                .borrowerName(request.getBorrowerName())
                .principal(request.getPrincipal())
                .years(request.getYears())
                .rate(request.getRate())
                .build();

        LoanEntity savedLoan = loanRepository.save(loanEntity);

        return LoanResponse.builder()
                .bankName(savedLoan.getBankName())
                .borrowerName(savedLoan.getBorrowerName())
                .principal(savedLoan.getPrincipal())
                .years(savedLoan.getYears())
                .rate(savedLoan.getRate())
                .build();
    }

}