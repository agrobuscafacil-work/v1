import { Bug, ClipboardList, Cpu, Droplets, HardHat, PawPrint, Sprout, Tractor, Warehouse, Wheat, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ProductCategory {
  name: string;
  slug: string;
  description: string;
  icon: LucideIcon;
}

const contactOnlyCategorySlugs = new Set([
  'servicos',
  'infraestrutura-rural',
  'pecuaria',
  'maquinas-e-implementos',
]);

export function getCategorySaleMode(slug?: string): 'DIRECT' | 'CONTACT_ONLY' {
  return slug && contactOnlyCategorySlugs.has(slug) ? 'CONTACT_ONLY' : 'DIRECT';
}

export const productCategories: ProductCategory[] = [
  { name: 'Insumos Agrícolas', slug: 'insumos-agricolas', description: 'Fertilizantes, adubos, sementes, mudas, corretivos, bioinsumos e proteção das culturas.', icon: Sprout },
  { name: 'Máquinas e Implementos', slug: 'maquinas-e-implementos', description: 'Tratores, colheitadeiras, plantadeiras, pulverizadores, implementos e peças.', icon: Tractor },
  { name: 'Equipamentos Rurais', slug: 'equipamentos-rurais', description: 'Irrigação, bombas, motores, geradores, medição, manejo e instalações rurais.', icon: Droplets },
  { name: 'Cultivo e Produção', slug: 'cultivo-e-producao', description: 'Culturas, mudas, colheitas, grãos, frutas, hortaliças e materiais de produção.', icon: Wheat },
  { name: 'Pecuária', slug: 'pecuaria', description: 'Animais de produção, produtos pecuários e itens para criação e manejo animal.', icon: PawPrint },
  { name: 'Produtos para Animais', slug: 'produtos-para-animais', description: 'Rações, suplementos, medicamentos, vacinas e acessórios para animais.', icon: PawPrint },
  { name: 'Apicultura', slug: 'apicultura', description: 'Colmeias, equipamentos, vestimentas, mel, própolis, cera e geleia real.', icon: Bug },
  { name: 'Ferramentas e Equipamentos', slug: 'ferramentas-e-equipamentos', description: 'Ferramentas manuais, elétricas, mecânicas e equipamentos de oficina.', icon: Wrench },
  { name: 'Infraestrutura Rural', slug: 'infraestrutura-rural', description: 'Galpões, currais, cercas, estufas, silos, pós-colheita e construção rural.', icon: Warehouse },
  { name: 'EPI e Vestuário', slug: 'epi-e-vestuario', description: 'Luvas, botas, óculos, capacetes, respiradores e roupas de proteção.', icon: HardHat },
  { name: 'Tecnologia Agrícola', slug: 'tecnologia-agricola', description: 'Softwares, drones, GPS, sensores, automação, IoT e monitoramento.', icon: Cpu },
  { name: 'Serviços', slug: 'servicos', description: 'Serviços agrícolas, pecuários, de máquinas, manutenção, transporte e consultoria.', icon: ClipboardList },
];
