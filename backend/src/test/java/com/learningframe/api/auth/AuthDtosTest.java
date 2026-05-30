package com.learningframe.api.auth;

import com.learningframe.api.auth.AuthDtos.RegisterRequest;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AuthDtosTest {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void rejectsRegistrationPasswordWithoutUppercaseNumberAndSymbol() {
        RegisterRequest request = new RegisterRequest("Ada Lovelace", "ada@example.com", "senhaforte");

        assertThat(validator.validate(request))
                .anySatisfy(violation -> {
                    assertThat(violation.getPropertyPath()).hasToString("password");
                    assertThat(violation.getMessage()).isEqualTo("Inclua pelo menos uma letra maiuscula, um numero e um simbolo.");
                });
    }

    @Test
    void rejectsRegistrationPasswordWithWhitespaceInsteadOfSymbol() {
        RegisterRequest request = new RegisterRequest("Ada Lovelace", "ada@example.com", "Senha 123");

        assertThat(validator.validate(request))
                .anySatisfy(violation -> {
                    assertThat(violation.getPropertyPath()).hasToString("password");
                    assertThat(violation.getMessage()).isEqualTo("Inclua pelo menos uma letra maiuscula, um numero e um simbolo.");
                });
    }

    @Test
    void acceptsRegistrationPasswordWithUppercaseNumberAndSymbol() {
        RegisterRequest request = new RegisterRequest("Ada Lovelace", "ada@example.com", "Senha@123");

        assertThat(validator.validate(request)).isEmpty();
    }
}
