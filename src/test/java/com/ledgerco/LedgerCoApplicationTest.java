package com.ledgerco;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "app.demo-data=false")
class LedgerCoApplicationTest {

    @Test
    void contextLoads() {
    }
}
