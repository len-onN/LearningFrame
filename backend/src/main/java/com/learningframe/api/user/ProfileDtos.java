package com.learningframe.api.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ProfileDtos {
    public record UpdateDisplayNameRequest(
            @NotBlank(message = "O nome nao pode estar vazio.")
            @Size(max = 120, message = "O nome deve ter no maximo 120 caracteres.")
            String displayName
    ) {}

    public record UpdatePasswordRequest(
            @NotBlank(message = "A senha atual e obrigatoria.")
            String oldPassword,

            @NotBlank(message = "A nova senha e obrigatoria.")
            @Size(min = 8, message = "A nova senha deve ter no minimo 8 caracteres.")
            String newPassword
    ) {}
}
