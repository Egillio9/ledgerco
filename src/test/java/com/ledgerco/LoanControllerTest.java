package com.ledgerco;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class LoanControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void createPayAndCheckBalance() throws Exception {
        mockMvc.perform(post("/api/loans").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"bankName\":\"MBI\",\"borrowerName\":\"Dale\",\"principal\":2000,\"years\":2,\"rate\":2}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.emi").value(87.0));

        mockMvc.perform(post("/api/payments").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"bankName\":\"MBI\",\"borrowerName\":\"Dale\",\"amount\":1000,\"afterEmi\":5}"))
                .andExpect(status().isCreated());

        // A = 2080, EMI = ceil(2080/24) = 87; after EMI 6: 6*87 + 1000 = 1522 paid, ceil(558/87) = 7 left
        mockMvc.perform(get("/api/balance/MBI/Dale").param("emi", "6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amountPaid").value(1522))
                .andExpect(jsonPath("$.emisLeft").value(7));
    }

    @Test
    void duplicateLoanIsRejected() throws Exception {
        String body = "{\"bankName\":\"UON\",\"borrowerName\":\"Shelly\",\"principal\":15000,\"years\":2,\"rate\":9}";
        mockMvc.perform(post("/api/loans").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/api/loans").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void missingEmiParamIsBadRequest() throws Exception {
        mockMvc.perform(get("/api/balance/IDIDI/Dale"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void unknownLoanIsNotFound() throws Exception {
        mockMvc.perform(get("/api/loans/NOPE/Nobody"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Loan not found for Nobody at NOPE"));
    }

    @Test
    void deployedFrontendPassesCors() throws Exception {
        mockMvc.perform(options("/api/loans")
                        .header(HttpHeaders.ORIGIN, "https://ledgerco-beta.vercel.app")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "https://ledgerco-beta.vercel.app"));
    }
}
