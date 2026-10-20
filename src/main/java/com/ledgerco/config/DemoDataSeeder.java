package com.ledgerco.config;

import com.ledgerco.db.repository.LoanRepository;
import com.ledgerco.dto.LoanRequest;
import com.ledgerco.dto.PaymentRequest;
import com.ledgerco.service.LoanService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Loads a few sample loans so the hosted demo never starts empty (the in-memory DB resets on every restart).
 * Disable with APP_DEMO_DATA=false.
 */
@Component
@ConditionalOnProperty(name = "app.demo-data", havingValue = "true")
public class DemoDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    private final LoanService loanService;
    private final LoanRepository loanRepository;

    public DemoDataSeeder(LoanService loanService, LoanRepository loanRepository) {
        this.loanService = loanService;
        this.loanRepository = loanRepository;
    }

    @Override
    public void run(String... args) {
        if (loanRepository.count() > 0) {
            return;
        }
        loanService.createLoan(new LoanRequest("IDIDI", "Dale", 10000, 5, 4));
        loanService.createLoan(new LoanRequest("MBI", "Harry", 2000, 2, 2));
        loanService.createLoan(new LoanRequest("UON", "Shelly", 15000, 2, 9));
        loanService.createLoan(new LoanRequest("HDFC", "Asha", 50000, 3, 8));

        loanService.addPayment(new PaymentRequest("IDIDI", "Dale", 5000, 3));
        loanService.addPayment(new PaymentRequest("UON", "Shelly", 7000, 12));
        loanService.addPayment(new PaymentRequest("HDFC", "Asha", 10000, 6));
        log.info("Loaded demo loans");
    }
}
