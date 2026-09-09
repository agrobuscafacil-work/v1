BEGIN;

INSERT INTO "Category" ("id", "name", "slug", "description", "order", "active", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'Insumos Agrícolas', 'insumos-agricolas', 'Fertilizantes, adubos, sementes, mudas, corretivos, bioinsumos e produtos para nutrição e proteção das culturas.', 1, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Máquinas e Implementos', 'maquinas-e-implementos', 'Tratores, colheitadeiras, plantadeiras, pulverizadores, implementos, peças e acessórios para mecanização rural.', 2, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Equipamentos Rurais', 'equipamentos-rurais', 'Irrigação, bombas, motores, geradores, equipamentos de ordenha, medição, manejo e instalações rurais.', 3, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Cultivo e Produção', 'cultivo-e-producao', 'Culturas, mudas, produtos de colheita, grãos, frutas, hortaliças e materiais para produção agrícola.', 4, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Pecuária', 'pecuaria', 'Animais de produção, produtos pecuários e itens relacionados à criação e manejo animal.', 5, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Produtos para Animais', 'produtos-para-animais', 'Rações, suplementos, medicamentos, vacinas, equipamentos e acessórios para alimentação, saúde e manejo animal.', 6, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Apicultura', 'apicultura', 'Colmeias, equipamentos, vestimentas e produtos apícolas como mel, própolis, cera e geleia real.', 7, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Ferramentas e Equipamentos', 'ferramentas-e-equipamentos', 'Ferramentas manuais, elétricas, mecânicas, hidráulicas, pneumáticas e equipamentos de oficina e manutenção.', 8, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Infraestrutura Rural', 'infraestrutura-rural', 'Galpões, currais, cercas, estufas, silos, armazenamento, pós-colheita e materiais de construção rural.', 9, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'EPI e Vestuário', 'epi-e-vestuario', 'Luvas, botas, óculos, capacetes, respiradores, roupas de proteção e vestuário para trabalhadores rurais.', 10, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Tecnologia Agrícola', 'tecnologia-agricola', 'Softwares, drones, GPS, sensores, automação, IoT, monitoramento, telemetria e agricultura de precisão.', 11, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Serviços', 'servicos', 'Serviços agrícolas, pecuários, de máquinas, manutenção, transporte, consultoria, construção e outros.', 12, true, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "order" = EXCLUDED."order",
  "active" = true;

DO $$
DECLARE
  category_mapping RECORD;
  old_id TEXT;
  new_id TEXT;
BEGIN
  FOR category_mapping IN
    SELECT * FROM (VALUES
      ('insumos', 'insumos-agricolas'),
      ('sementes', 'insumos-agricolas'),
      ('fertilizantes', 'insumos-agricolas'),
      ('defensivos', 'insumos-agricolas'),
      ('maquinas', 'maquinas-e-implementos'),
      ('implementos', 'maquinas-e-implementos'),
      ('irrigacao', 'equipamentos-rurais'),
      ('tecnologia', 'tecnologia-agricola'),
      ('armazenagem', 'infraestrutura-rural'),
      ('diversos', 'infraestrutura-rural')
    ) AS mappings(old_slug, new_slug)
  LOOP
    SELECT "id" INTO old_id FROM "Category" WHERE "slug" = category_mapping.old_slug;
    SELECT "id" INTO new_id FROM "Category" WHERE "slug" = category_mapping.new_slug;

    IF old_id IS NOT NULL AND new_id IS NOT NULL THEN
      UPDATE "Product" SET "categoryId" = new_id WHERE "categoryId" = old_id;
      UPDATE "Service" SET "categoryId" = new_id WHERE "categoryId" = old_id;
      UPDATE "Category" SET "parentId" = new_id WHERE "parentId" = old_id;
      DELETE FROM "Category" WHERE "id" = old_id;
    END IF;
  END LOOP;
END $$;

COMMIT;