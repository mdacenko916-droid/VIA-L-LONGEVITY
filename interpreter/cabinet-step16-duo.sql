-- «Вдвоём» × кабинет (2026-10-15): пара видна специалисту, только если ОБА согласились и оба у ЭТОГО специалиста.
-- clients.duo_code — код карточки партнёра (у обоих). duo_m.spec_code/spec_share — согласие из приложения.
ALTER TABLE clients ADD COLUMN duo_code TEXT;
ALTER TABLE duo_m ADD COLUMN spec_code TEXT;
ALTER TABLE duo_m ADD COLUMN spec_share INTEGER NOT NULL DEFAULT 0;
