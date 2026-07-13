package com.ledgerco.controller;

import com.ledgerco.dto.BalanceResponse;
import com.ledgerco.dto.LoanRequest;
import com.ledgerco.dto.LoanResponse;
import com.ledgerco.dto.PaymentInfo;
import com.ledgerco.dto.PaymentRequest;
import com.ledgerco.dto.PaymentResponse;
import com.ledgerco.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor

public class LoanController {

    private final LoanService loanService;

    // POST /api/loans
    @PostMapping("/loans")
    public ResponseEntity<LoanResponse> createLoan(@Valid @RequestBody LoanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(loanService.createLoan(request));
    }

    // GET /api/loans
    @GetMapping("/loans")
    public ResponseEntity<List<LoanResponse>> getAllLoans() {
        return ResponseEntity.ok(loanService.getAllLoans());
    }

    // GET /api/loans/{bankName}/{borrowerName}
    @GetMapping("/loans/{bankName}/{borrowerName}")
    public ResponseEntity<LoanResponse> getLoan(
            @PathVariable String bankName,
            @PathVariable String borrowerName) {
        return ResponseEntity.ok(loanService.getLoan(bankName, borrowerName));
    }

    // GET /api/loans/{bankName}/{borrowerName}/payments
    @GetMapping("/loans/{bankName}/{borrowerName}/payments")
    public ResponseEntity<List<PaymentInfo>> getLoanPayments(
            @PathVariable String bankName,
            @PathVariable String borrowerName) {
        return ResponseEntity.ok(loanService.getLoanPayments(bankName, borrowerName));
    }

    // POST /api/payments
    @PostMapping("/payments")
    public ResponseEntity<PaymentResponse> addPayment(@Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(loanService.addPayment(request));
    }

    // GET /api/balance/{bankName}/{borrowerName}?emi=5
    @GetMapping("/balance/{bankName}/{borrowerName}")
    public ResponseEntity<BalanceResponse> getBalance(
            @PathVariable String bankName,
            @PathVariable String borrowerName,
            @RequestParam int emi) {
        return ResponseEntity.ok(
                loanService.getBalance(bankName, borrowerName, emi));
    }
}
