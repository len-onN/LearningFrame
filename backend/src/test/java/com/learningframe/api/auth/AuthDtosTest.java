package com.learningframe.api.auth;

import com.learningframe.api.auth.AuthDtos.RegisterRequest;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("validacao dos dados de autenticacao")
class AuthDtosTest {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    @DisplayName("rejeita senha de cadastro sem maiuscula, numero e simbolo")
    void rejeitaSenhaCadastroSemMaiusculaNumeroESimbolo() {
        RegisterRequest request = new RegisterRequest("Ada Lovelace", "ada@example.com", "senhaforte");

        assertThat(validator.validate(request))
                .anySatisfy(violation -> {
                    assertThat(violation.getPropertyPath()).hasToString("password");
                    assertThat(violation.getMessage()).isEqualTo("Inclua pelo menos uma letra maiuscula, um numero e um simbolo.");
                });
    }

    @Test
    @DisplayName("rejeita senha de cadastro com espaco no lugar do simbolo")
    void rejeitaSenhaCadastroComEspacoNoLugarDoSimbolo() {
        RegisterRequest request = new RegisterRequest("Ada Lovelace", "ada@example.com", "Senha 123");

        assertThat(validator.validate(request))
                .anySatisfy(violation -> {
                    assertThat(violation.getPropertyPath()).hasToString("password");
                    assertThat(violation.getMessage()).isEqualTo("Inclua pelo menos uma letra maiuscula, um numero e um simbolo.");
                });
    }

    @Test
    @DisplayName("aceita senha de cadastro com maiuscula, numero e simbolo")
    void aceitaSenhaCadastroComMaiusculaNumeroESimbolo() {
        RegisterRequest request = new RegisterRequest("Ada Lovelace", "ada@example.com", "Senha@123");

        assertThat(validator.validate(request)).isEmpty();
    }
}
