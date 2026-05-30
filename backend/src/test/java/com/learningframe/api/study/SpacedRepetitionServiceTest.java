package com.learningframe.api.study;

import com.learningframe.api.model.ReviewRating;
import com.learningframe.api.study.StudyDtos.ReviewSchedule;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("algoritmo de repeticao espacada")
class SpacedRepetitionServiceTest {
    private final SpacedRepetitionService service = new SpacedRepetitionService();

    @Test
    @DisplayName("agenda uma boa resposta nova para amanha")
    void agendaBoaRespostaNovaParaAmanha() {
        Instant now = Instant.parse("2026-05-30T10:00:00Z");

        ReviewSchedule schedule = service.next(ReviewRating.GOOD, 0, 0, 2.5, now);

        assertThat(schedule.intervalDays()).isEqualTo(1);
        assertThat(schedule.repetitions()).isEqualTo(1);
        assertThat(schedule.easeFactor()).isEqualTo(2.5);
        assertThat(schedule.nextDueAt()).isEqualTo(Instant.parse("2026-05-31T10:00:00Z"));
    }

    @Test
    @DisplayName("reinicia as repeticoes ao marcar de novo")
    void reiniciaRepeticoesAoMarcarDeNovo() {
        Instant now = Instant.parse("2026-05-30T10:00:00Z");

        ReviewSchedule schedule = service.next(ReviewRating.AGAIN, 6, 2, 2.5, now);

        assertThat(schedule.intervalDays()).isZero();
        assertThat(schedule.repetitions()).isZero();
        assertThat(schedule.easeFactor()).isEqualTo(2.3);
        assertThat(schedule.nextDueAt()).isEqualTo(Instant.parse("2026-05-30T10:10:00Z"));
    }
}
